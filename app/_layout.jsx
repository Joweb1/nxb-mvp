import React from 'react';
import { Stack } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { AuthProvider } from '../context/AuthContext';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}