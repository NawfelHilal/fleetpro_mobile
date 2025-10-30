import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      console.log('Registering with:', { username, email, password: '***' });
      console.log('API URL:', api.defaults.baseURL);
      const response = await api.post('/users/register', { username, email, password });
      console.log('Registration successful:', response.data);
      Alert.alert('Success', 'Account created successfully! Please login.', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } catch (e: any) {
      console.error('Registration error:', {
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        request: e?.request,
      });
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (!e.response) {
        // Erreur réseau (pas de réponse du serveur)
        errorMessage = `Network error: ${e.message || 'Unable to reach server'}\n\nPlease check:\n- Is the backend running?\n- Is the API URL correct?\n\nCurrent URL: ${api.defaults.baseURL}`;
      } else {
        // Erreur du serveur
        const errorData = e.response.data;
        errorMessage = 
          errorData?.detail || 
          errorData?.username?.[0] ||
          errorData?.email?.[0] ||
          Object.values(errorData || {})
            .flat()
            .filter((msg: any) => typeof msg === 'string')
            .join('\n') ||
          `Server error (${e.response.status}): ${e.response.statusText || 'Unknown error'}`;
      }
      
      Alert.alert('Registration failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center' }}>FleetPro</Text>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Register</Text>
      <Text>Username</Text>
      <TextInput 
        value={username} 
        onChangeText={setUsername} 
        autoCapitalize="none" 
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }} 
        placeholder="Enter your username"
      />
      <Text>Email</Text>
      <TextInput 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }} 
        placeholder="Enter your email"
      />
      <Text>Password</Text>
      <TextInput 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }} 
        placeholder="Enter your password"
      />
      <Button title={loading ? 'Creating...' : 'Register'} onPress={handleRegister} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={{ textAlign: 'center', color: '#007AFF', marginTop: 8 }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

