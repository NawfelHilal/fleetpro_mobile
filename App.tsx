import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import ReserveRideScreen from './src/screens/ReserveRideScreen';

export type RootStackParamList = {
  Login: undefined;
  ReserveRide: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ReserveRide" component={ReserveRideScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

