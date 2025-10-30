import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ReserveRideScreen from './src/screens/ReserveRideScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ReserveRide: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Thème Material Design personnalisé
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    surface: '#ffffff',
    error: '#d32f2f',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ReserveRide" component={ReserveRideScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

