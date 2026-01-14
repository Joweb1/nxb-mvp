import React, { createContext, useContext, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text, Animated } from 'react-native';
import { COLORS, FONT_FAMILY, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  
  // Animation for toast
  const toastOpacity = React.useRef(new Animated.Value(0)).current;
  const toastTranslateY = React.useRef(new Animated.Value(-50)).current;

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const showToast = (message) => {
    setToast({ visible: true, message });
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(toastTranslateY, { toValue: 50, duration: 300, useNativeDriver: true }),
    ]).start();

    // Auto hide after 2 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: -50, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast({ visible: false, message: '' }));
    }, 2000);
  };

  return (
    <UIContext.Provider value={{ showLoading, hideLoading, showToast }}>
      {children}
      
      {/* Glassy Loading Overlay */}
      {loading && (
        <Modal transparent animationType="fade" visible={loading}>
          <View style={styles.overlay}>
            {/* Fallback for Android which might not support BlurView perfectly in all versions, 
                but using semi-transparent background works universally */}
            <View style={styles.glassContainer}>
               <ActivityIndicator size="large" color={COLORS.primary} />
               <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </UIContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // Dark semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: BORDER_RADIUS.large,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
  },
  toastContainer: {
    position: 'absolute',
    top: 0, // Will be animated down
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
  }
});
