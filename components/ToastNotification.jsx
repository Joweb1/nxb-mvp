import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const ToastNotification = ({ visible, message, onHide }) => {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
      
      // Auto-hide is handled by the parent or usually just stays until data loads in this specific "loading more" context
      // But if it's a generic toast, we might want a timeout.
      // For "Loading more data...", it should stay until visible becomes false.
    } else {
      translateY.value = withTiming(100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.spinner} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

import { ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40, // Above the tab bar usually
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none', // Let touches pass through if needed, though usually toasts block nothing
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  spinner: {
    marginRight: 10,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  }
});

export default ToastNotification;
