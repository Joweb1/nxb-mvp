import React, { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import CustomTabBar from '../../components/CustomTabBar';
import { getFixturesByDate } from '../../services/api-football';
import { updateMatchesInFirestore, getLastFetchTimestamp, setLastFetchTimestamp } from '../../services/firebase';

export default function AppLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lastFetch = await getLastFetchTimestamp();
        const now = new Date();
        const tenMinutes = 10 * 60 * 1000;

        if (!lastFetch || (now.getTime() - new Date(lastFetch).getTime()) > tenMinutes) {
          console.log('Fetching fixtures for date range...');
          
          const formatDate = (d) => d.toISOString().split('T')[0];
          const todayDate = new Date();
          const yesterday = new Date(todayDate);
          yesterday.setDate(todayDate.getDate() - 1);
          const tomorrow = new Date(todayDate);
          tomorrow.setDate(todayDate.getDate() + 1);

          const dates = [formatDate(yesterday), formatDate(todayDate), formatDate(tomorrow)];

          const allFixtures = [];
          for (const date of dates) {
            try {
              const fixtures = await getFixturesByDate(date);
              if (fixtures && fixtures.length > 0) {
                allFixtures.push(...fixtures);
              }
            } catch (error) {
              console.error(`Error fetching data for date: ${date}`, error);
            }
          }

          if (allFixtures.length > 0) {
            await updateMatchesInFirestore(allFixtures);
            await setLastFetchTimestamp();
            console.log('Fixtures updated in Firestore for the date range.');
          }
        } else {
          console.log('Fetched within the last 10 minutes. Skipping fetch.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(interval);
  }, []);


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
