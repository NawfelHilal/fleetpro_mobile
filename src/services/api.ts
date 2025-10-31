import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Détection de la plateforme pour choisir la bonne URL
// Sur web, host.docker.internal ne fonctionne pas, il faut utiliser localhost
// Sur mobile physique, host.docker.internal ne fonctionne pas, il faut utiliser l'IP locale
const getBaseURL = () => {
    // Vérifier si process.env existe (peut ne pas être défini dans certains environnements)
    let envUrl: string | undefined;
    // @ts-ignore - process.env est disponible dans Expo mais pas dans les types TypeScript par défaut
    if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        envUrl = process.env.EXPO_PUBLIC_API_URL;
    }

    // Sur web, toujours utiliser localhost (même si EXPO_PUBLIC_API_URL est définie)
    // car le navigateur web accède depuis l'ordinateur local
    if (Platform.OS === 'web') {
        const webUrl = 'http://localhost:8000/api';
        console.log('[API] Platform: web, using:', webUrl);
        return webUrl;
    }

    // Sur mobile: utiliser EXPO_PUBLIC_API_URL si définie, sinon host.docker.internal (qui peut ne pas fonctionner sur téléphone physique)
    if (envUrl) {
        console.log('[API] Platform:', Platform.OS, 'using environment URL:', envUrl);
        return envUrl;
    }

    // Fallback pour mobile (peut ne pas fonctionner sur téléphone physique)
    // ⚠️ ATTENTION : Cette IP doit être remplacée par votre IP locale actuelle !
    // Pour trouver votre IP : ipconfig | findstr IPv4 (Windows) ou ifconfig (Linux/Mac)
    // Créez un fichier .env avec : EXPO_PUBLIC_API_URL=http://VOTRE_IP:8000/api
    const mobileUrl = 'http://localhost:8000/api'; // ⚠️ Ne fonctionnera PAS sur téléphone physique !
    console.error('[API] ⚠️ WARNING: No EXPO_PUBLIC_API_URL configured!');
    console.error('[API] Using fallback:', mobileUrl);
    console.error('[API] This will NOT work on physical devices!');
    console.error('[API] Solution: Create .env file with: EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api');
    return mobileUrl;
};

const baseURL = getBaseURL();
console.log('[API] Initialized with baseURL:', baseURL);

const api = axios.create({
    baseURL: baseURL,
    timeout: 10000, // 10 secondes de timeout pour éviter les requêtes infinies
});

// Gestion du header Authorization
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            // Erreur silencieuse si AsyncStorage n'est pas disponible (ne devrait pas arriver)
            console.warn('[API] Failed to get token from AsyncStorage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Rafraîchissement de token automatique
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void; }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;

        // N'essaie pas de refresh si endpoint d'auth lui-même
        const isAuthEndpoint = typeof originalRequest?.url === 'string' && (
            originalRequest.url.includes('/users/login') ||
            originalRequest.url.includes('/users/register') ||
            originalRequest.url.includes('/users/token/refresh')
        );

        if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (token) {
                            originalRequest.headers = originalRequest.headers || {};
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;
            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }
                const { data } = await api.post('/users/token/refresh/', { refresh: refreshToken });
                const newAccess = data?.access as string | undefined;
                if (!newAccess) {
                    throw new Error('No access token in refresh response');
                }
                await AsyncStorage.setItem('accessToken', newAccess);
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
                processQueue(null, newAccess);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err as any, null);
                await logout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export async function logout() {
    try {
        const refresh = await AsyncStorage.getItem('refreshToken');
        if (refresh) {
            // On tente de blacklister côté serveur (best effort)
            try {
                await api.post('/users/logout/', { refresh });
            } catch (_e) {
                // ignorer les erreurs de logout serveur
            }
        }
    } finally {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    }
}

export default api;

