import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

const GlassyOverlay = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <BlurView intensity={20} tint="dark" style={styles.absoluteFill}>
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                {message && <Text style={styles.text}>{message}</Text>}
            </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);

  const showLoading = useCallback((message = null) => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(null);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      <GlassyOverlay visible={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
};

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Fallback/tint
    zIndex: 9999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    padding: 24,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  text: {
    marginTop: 12,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  }
});
