import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_FAMILY } from '../../constants/theme';

const ForYouScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>For You</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>For You</Text>
        <Text style={styles.screenSubtitle}>Personalized content will be displayed here.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  screenTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 28,
    color: COLORS.text,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default ForYouScreen;