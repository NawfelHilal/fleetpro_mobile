import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function MapScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [region, setRegion] = useState<Region | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const init = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        Alert.alert(
          'Permission requise',
          "La localisation est nécessaire pour afficher votre position sur la carte."
        );
        return;
      }
      setHasPermission(true);

      const last = await Location.getLastKnownPositionAsync({});
      const current = last || (await Location.getCurrentPositionAsync({}));
      const { latitude, longitude } = current.coords;
      setCoords({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (update) => {
          const { latitude: lat, longitude: lng } = update.coords;
          setCoords({ latitude: lat, longitude: lng });
        }
      );
    };

    init();

    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
      }
    };
  }, []);

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>Localisation non autorisée.</Text>
      </View>
    );
  }

  if (!region || !coords) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement de la carte…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={setRegion}
      >
        <Marker coordinate={coords} title="Vous êtes ici" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
});

