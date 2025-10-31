import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, Card, Divider, ActivityIndicator } from 'react-native-paper';
import api, { logout } from '../services/api';
import { useNavigation } from '@react-navigation/native';

interface Ride {
  id: number;
  start_location: string;
  end_location: string;
  distance_km: number | string;
  price: string;
  status: string;
}

export default function ReserveRideScreen() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distanceKm, setDistanceKm] = useState('10');
  const [price, setPrice] = useState('20.00');
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigation = useNavigation();

  const fetchRides = async () => {
    try {
      setFetching(true);
      const { data } = await api.get<Ride[]>('/rides/');
      setRides(data);
    } catch (e) {
      // ignore
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const reserve = async () => {
    if (!start || !end) {
      Alert.alert('Error', 'Please fill in start and end locations');
      return;
    }

    try {
      setLoading(true);
      await api.post('/rides/', {
        start_location: start,
        end_location: end,
        distance_km: Number(distanceKm),
        price: Number(price),
      });
      setStart('');
      setEnd('');
      await fetchRides();
      Alert.alert('Success', 'Ride reserved successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to reserve ride');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    // @ts-ignore - root stack has Login
    navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.formSurface} elevation={2}>
        <Button mode="text" onPress={handleLogout} style={styles.logoutButton} icon="logout">
          Logout
        </Button>
        <Text variant="headlineMedium" style={styles.title}>
          Reserve a Ride
        </Text>

        <TextInput
          label="Start location"
          value={start}
          onChangeText={setStart}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker" />}
          placeholder="Enter starting point"
        />

        <TextInput
          label="End location"
          value={end}
          onChangeText={setEnd}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="map-marker-check" />}
          placeholder="Enter destination"
        />

        <TextInput
          label="Distance (km)"
          value={distanceKm}
          onChangeText={setDistanceKm}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          left={<TextInput.Icon icon="ruler" />}
        />

        <TextInput
          label="Price (€)"
          value={price}
          onChangeText={setPrice}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          left={<TextInput.Icon icon="currency-eur" />}
        />

        <Button
          mode="contained"
          onPress={reserve}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          icon="car"
        >
          {loading ? 'Reserving...' : 'Reserve Ride'}
        </Button>
      </Surface>

      <Text variant="titleLarge" style={styles.sectionTitle}>
        My Recent Rides
      </Text>

      {fetching ? (
        <ActivityIndicator style={styles.loader} />
      ) : rides.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.emptyText}>
              No rides yet. Reserve your first ride!
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card style={styles.rideCard} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium" style={styles.rideRoute}>
                  {item.start_location} → {item.end_location}
                </Text>
                <Divider style={styles.divider} />
                <Text variant="bodySmall" style={styles.rideDetails}>
                  {typeof item.distance_km === 'number' ? item.distance_km : item.distance_km} km · {item.price} €
                </Text>
                <Text variant="bodySmall" style={[styles.status, getStatusColor(item.status)]}>
                  {item.status.toUpperCase()}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return { color: '#4caf50' };
    case 'in_progress':
      return { color: '#2196f3' };
    case 'requested':
      return { color: '#ff9800' };
    default:
      return { color: '#757575' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  formSurface: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  logoutButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginVertical: 32,
  },
  emptyCard: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  rideCard: {
    marginBottom: 12,
  },
  rideRoute: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  rideDetails: {
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontWeight: '600',
    marginTop: 4,
  },
});
