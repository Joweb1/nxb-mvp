import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY } from '../constants/theme';

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

        if (isFocused) {
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.activeButton}
            >
              <MaterialCommunityIcons name={iconName} color="#000" size={24} />
              <Text style={styles.activeButtonText}>{label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.inactiveButton}
          >
            <MaterialCommunityIcons name={iconName} color="#999" size={24} />
            <Text style={styles.inactiveButtonText}>{label}</Text>
          </Pressable>
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
    height: 80,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  activeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  activeButtonText: {
    color: '#000',
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
  },
  inactiveButton: {
    alignItems: 'center',
    gap: 4,
    padding: 10,
  },
  inactiveButtonText: {
    color: '#999',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
  },
});

export default CustomTabBar;
