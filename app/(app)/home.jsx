import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../../constants/theme';

export default function MainScreen() {
  const { user, logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
      // Navigation will be handled by the root layout
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <Pressable onPress={handleLogout}>
            <Feather name="log-out" size={24} color={COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeMessage}>Welcome, {user?.email}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Matches</Text>
            <Text style={styles.cardSubtitle}>View your potential connections.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vault</Text>
            <Text style={styles.cardSubtitle}>Access your secure information.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  welcomeMessage: {
    fontSize: SIZES.h3,
    fontFamily: FONT_FAMILY.primary,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.large,
    padding: SIZES.padding,
    marginBottom: SIZES.base * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  cardSubtitle: {
    fontSize: SIZES.body,
    fontFamily: FONT_FAMILY.primary,
    color: COLORS.text,
  },
});
