import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Détection de la plateforme pour choisir la bonne URL
// Sur web, host.docker.internal ne fonctionne pas, il faut utiliser localhost
const getBaseURL = () => {
    // Vérifier si process.env existe (peut ne pas être défini dans certains environnements)
    let envUrl: string | undefined;
    // @ts-ignore - process.env est disponible dans Expo mais pas dans les types TypeScript par défaut
    if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        envUrl = process.env.EXPO_PUBLIC_API_URL;
    }

    if (envUrl) {
        return envUrl;
    }

    // Sur web, utiliser localhost
    if (Platform.OS === 'web') {
        return 'http://localhost:8000/api';
    }

    // Sur mobile, utiliser host.docker.internal (depuis Docker) ou localhost (depuis appareil physique)
    return 'http://host.docker.internal:8000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

