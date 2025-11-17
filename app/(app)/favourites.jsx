import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const FavouritesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favourites</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
  },
});

export default FavouritesScreen;
