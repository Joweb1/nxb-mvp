import React from 'react';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { AuthProvider } from '../context/AuthContext';
import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
