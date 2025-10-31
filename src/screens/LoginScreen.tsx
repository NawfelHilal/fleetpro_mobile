import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, Portal, Dialog } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const openReset = () => setResetVisible(true);
  const closeReset = () => {
    setResetVisible(false);
    setResetEmail('');
    setResetLoading(false);
  };

  const submitPasswordReset = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    try {
      setResetLoading(true);
      await api.post('/users/password-reset/', { email: resetEmail.trim() });
      Alert.alert('Email sent', 'If this email exists, a reset link was sent.');
      closeReset();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Unable to send reset email');
      setResetLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      console.log('[Login] Attempting login with:', { username, password: '***' });
      console.log('[Login] API URL:', api.defaults.baseURL);
      
      const { data } = await api.post('/users/login', { username, password });
      
      console.log('[Login] Login successful, saving tokens...');
      
      if (!data.access || !data.refresh) {
        throw new Error('Invalid response from server: missing tokens');
      }
      
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      
      console.log('[Login] Tokens saved, navigating to Tabs...');
      setLoading(false); // Désactiver le loading avant la navigation
      
      requestAnimationFrame(() => {
        navigation.replace('Tabs');
      });
      
    } catch (e: any) {
      console.error('[Login] Error:', {
        message: e?.message,
        response: e?.response?.data,
        status: e?.response?.status,
        url: api.defaults.baseURL,
        code: e?.code,
      });
      
      setLoading(false); // S'assurer que loading est désactivé en cas d'erreur
      
      let errorMessage = 'Please check credentials';
      
      if (!e.response) {
        // Erreur réseau (timeout, connexion refusée, etc.)
        if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
          const apiUrl = api.defaults.baseURL;
          errorMessage = `Connection timeout!\n\nTrying to connect to:\n${apiUrl}\n\n✅ SOLUTIONS:\n\n1. Verify backend is running:\n   cd fleetpro-backend/docker\n   docker compose ps\n\n2. Find your PC's IP address:\n   Windows: ipconfig | findstr IPv4\n   Then update .env with:\n   EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api\n\n3. Check if backend accessible:\n   Open http://localhost:8000/api/docs/ in your browser\n\n4. Ensure mobile and PC are on the same WiFi network`;
        } else if (e.code === 'ERR_NETWORK' || e.message?.includes('Network Error')) {
          errorMessage = `Network error: Unable to reach server.\n\nAPI URL: ${api.defaults.baseURL}\n\n⚠️ TROUBLESHOOTING:\n\n1. Check backend: docker compose ps (in fleetpro-backend/docker)\n2. Test in browser: http://localhost:8000/api/docs/\n3. Find your IP: ipconfig | findstr IPv4\n4. Create .env file with your IP:\n   EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api\n\nSee TROUBLESHOOTING_API.md for details.`;
        } else {
          errorMessage = `Network error: ${e.message || 'Unable to reach server'}\n\nAPI URL: ${api.defaults.baseURL}\n\nSee TROUBLESHOOTING_API.md for help.`;
        }
      } else {
        // Erreur du serveur
        errorMessage = e?.response?.data?.detail || 'Please check credentials';
      }
      
      Alert.alert('Login failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.surface} elevation={2}>
          <Text variant="displaySmall" style={styles.title}>
            FleetPro
          </Text>
          <Text variant="headlineMedium" style={styles.subtitle}>
            Login
          </Text>

          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Button
            mode="text"
            onPress={openReset}
            style={styles.linkButton}
          >
            Forgot password?
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.replace('Register')}
            style={styles.linkButton}
          >
            Don't have an account? Register
          </Button>
        </Surface>
      </ScrollView>

      <Portal>
        <Dialog visible={resetVisible} onDismiss={closeReset}>
          <Dialog.Title>Reset password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Email"
              value={resetEmail}
              onChangeText={setResetEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeReset} disabled={resetLoading}>Cancel</Button>
            <Button onPress={submitPasswordReset} loading={resetLoading} disabled={resetLoading}>
              Send
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 8,
  },
});
