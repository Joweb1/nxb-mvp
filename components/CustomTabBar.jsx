import React, { useEffect, useRef } from 'react';
import { View, Pressable, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FONT_FAMILY } from '../constants/theme';

const TabButton = ({ isFocused, onPress, onLongPress, route, label, iconName }) => {
  const animation = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFocused, animation]);

  return (
    <Pressable
      key={route.key}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.buttonContainer}
    >
      <Animated.View style={[styles.activeButton, { opacity: animation }]}>
        <MaterialCommunityIcons name={iconName} color="#000" size={24} />
        <Text style={styles.activeButtonText}>{label}</Text>
      </Animated.View>

      <Animated.View style={[styles.inactiveButton, { opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
        <MaterialCommunityIcons name={iconName} color="#999" size={24} />
        <Text style={styles.inactiveButtonText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconName = options.tabBarIconName || 'help-circle';

        return (
          <TabButton
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            route={route}
            label={label}
            iconName={iconName}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#222',
    height: 95,
    paddingBottom: 15,
    paddingHorizontal: 10,
    // marginBottom: 10, // Removed to fix white space
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 8,
    position: 'absolute',
  },
  activeButtonText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: '#000',
  },
  inactiveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  inactiveButtonText: {
    color: '#999',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
  },
});

export default CustomTabBar;