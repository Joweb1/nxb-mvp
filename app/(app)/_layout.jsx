import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import CustomTabBar from '../../components/CustomTabBar';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="highlight"
        options={{
          title: 'Highlight',
          tabBarIconName: 'soccer',
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Favourites',
          tabBarIconName: 'star',
        }}
      />
      <Tabs.Screen
        name="forYou"
        options={{
          title: 'For You',
          tabBarIconName: 'receipt',
        }}
      />
    </Tabs>
  );
}
