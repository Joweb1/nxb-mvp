import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '../../../components/CustomTabBar';

export default function TabsLayout() {
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
