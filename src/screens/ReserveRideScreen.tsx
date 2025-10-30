import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import api from '../services/api';

interface Ride {
  id: number;
  start_location: string;
  end_location: string;
  distance_km: string;
  price: string;
  status: string;
}

export default function ReserveRideScreen() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distanceKm, setDistanceKm] = useState('10');
  const [price, setPrice] = useState('20.00');
  const [rides, setRides] = useState<Ride[]>([]);

  const fetchRides = async () => {
    try {
      const { data } = await api.get<Ride[]>('/rides/');
      setRides(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const reserve = async () => {
    try {
      await api.post('/rides/', {
        start_location: start,
        end_location: end,
        distance_km: Number(distanceKm),
        price: Number(price),
      });
      setStart('');
      setEnd('');
      await fetchRides();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to reserve ride');
    }
  };

  return (
    <View style={{ padding: 16, gap: 12, flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Reserve a Ride</Text>
      <Text>Start location</Text>
      <TextInput value={start} onChangeText={setStart} style={{ borderWidth: 1, padding: 8, borderRadius: 6 }} />
      <Text>End location</Text>
      <TextInput value={end} onChangeText={setEnd} style={{ borderWidth: 1, padding: 8, borderRadius: 6 }} />
      <Text>Distance (km)</Text>
      <TextInput value={distanceKm} onChangeText={setDistanceKm} keyboardType="decimal-pad" style={{ borderWidth: 1, padding: 8, borderRadius: 6 }} />
      <Text>Price</Text>
      <TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={{ borderWidth: 1, padding: 8, borderRadius: 6 }} />
      <Button title="Reserve" onPress={reserve} />

      <Text style={{ fontSize: 18, marginTop: 16 }}>My recent rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{item.start_location} → {item.end_location} • {item.status}</Text>
            <Text>{item.distance_km} km · {item.price} €</Text>
          </View>
        )}
      />
    </View>
  );
}

