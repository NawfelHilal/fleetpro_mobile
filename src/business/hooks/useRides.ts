/**
 * Custom Hooks Pattern - Réutilise la logique métier pour les trajets
 * Séparation des concerns : logique métier séparée de l'UI
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export interface Ride {
    id: number;
    client: number;
    driver?: number;
    pickup_point?: { lat: number; lng: number };
    dropoff_point?: { lat: number; lng: number };
    start_location?: string;
    end_location?: string;
    distance_km: number;
    price_cents: number;
    price: number;
    status: 'requested' | 'assigned' | 'ongoing' | 'done' | 'cancelled';
    started_at?: string;
    finished_at?: string;
    created_at: string;
    updated_at: string;
}

interface UseRidesReturn {
    rides: Ride[];
    loading: boolean;
    error: string | null;
    fetchRides: () => Promise<void>;
    createRide: (pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number) => Promise<Ride | null>;
    cancelRide: (rideId: number) => Promise<boolean>;
    startRide: (rideId: number) => Promise<boolean>;
    finishRide: (rideId: number) => Promise<boolean>;
}

export function useRides(): UseRidesReturn {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRides = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Ride[]>('/rides/');
            setRides(data);
        } catch (e: any) {
            const errorMessage = e?.response?.data?.detail || e?.message || 'Failed to fetch rides';
            setError(errorMessage);
            console.error('[useRides] Error fetching rides:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const createRide = useCallback(async (
        pickupLat: number,
        pickupLng: number,
        dropoffLat: number,
        dropoffLng: number
    ): Promise<Ride | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post<Ride>('/rides/', {
                pickup_lat: pickupLat,
                pickup_lng: pickupLng,
                dropoff_lat: dropoffLat,
                dropoff_lng: dropoffLng,
            });

            // Ajouter le nouveau trajet à la liste
            setRides((prevRides) => [data, ...prevRides]);
            return data;
        } catch (e: any) {
            const errorMessage = e?.response?.data?.detail || e?.message || 'Failed to create ride';
            setError(errorMessage);
            console.error('[useRides] Error creating ride:', errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelRide = useCallback(async (rideId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/rides/${rideId}/cancel/`);
            // Rafraîchir la liste
            await fetchRides();
            return true;
        } catch (e: any) {
            const errorMessage = e?.response?.data?.detail || e?.message || 'Failed to cancel ride';
            setError(errorMessage);
            console.error('[useRides] Error cancelling ride:', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchRides]);

    const startRide = useCallback(async (rideId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/rides/${rideId}/start/`);
            await fetchRides();
            return true;
        } catch (e: any) {
            const errorMessage = e?.response?.data?.detail || e?.message || 'Failed to start ride';
            setError(errorMessage);
            console.error('[useRides] Error starting ride:', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchRides]);

    const finishRide = useCallback(async (rideId: number): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/rides/${rideId}/finish/`);
            await fetchRides();
            return true;
        } catch (e: any) {
            const errorMessage = e?.response?.data?.detail || e?.message || 'Failed to finish ride';
            setError(errorMessage);
            console.error('[useRides] Error finishing ride:', errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchRides]);

    // Charger les trajets au montage
    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    return {
        rides,
        loading,
        error,
        fetchRides,
        createRide,
        cancelRide,
        startRide,
        finishRide,
    };
}

