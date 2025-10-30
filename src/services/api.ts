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
    const mobileUrl = 'http://10.6.3.13:8000/api';
    console.warn('[API] Platform:', Platform.OS, 'using default:', mobileUrl);
    console.warn('[API] WARNING: host.docker.internal may not work on physical devices!');
    console.warn('[API] Configure EXPO_PUBLIC_API_URL with your computer IP (e.g., http://10.6.3.13:8000/api)');
    return mobileUrl;
};

const baseURL = getBaseURL();
console.log('[API] Initialized with baseURL:', baseURL);

const api = axios.create({
    baseURL: baseURL,
});

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

export default api;

