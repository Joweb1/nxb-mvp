import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { COLORS, FONT_FAMILY } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import MatchItem from '@/components/MatchItem';

import { useAuth } from '@/context/AuthContext';

const ForYouScreen = () => {
  const { isTablet } = useResponsive();
  const { forYou } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const matchesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.fixture.date,
          status: data.fixture.status.short,
          minute: data.fixture.status.elapsed + "'",
          time: new Date(data.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          teamA: data.teams.home.name,
          teamB: data.teams.away.name,
          teamALogo: data.teams.home.logo,
          teamBLogo: data.teams.away.logo,
          scoreA: data.goals.home,
          scoreB: data.goals.away,
          action: data.fixture.status.short === 'NS' ? 'Preview' : 'Summary',
          league: data.league.name,
        };
      });

      const filteredMatches = matchesData.filter(match => {
        const userLeagues = forYou?.leagues || [];
        const userTeams = forYou?.teams || [];
        return userLeagues.includes(match.league) || userTeams.includes(match.teamA) || userTeams.includes(match.teamB);
      });
      
      setMatches(filteredMatches);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [forYou]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.mainContent, isTablet && styles.contentTablet]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>For You</Text>
        </View>
        {matches.length > 0 ? (
          <FlatList
            data={matches}
            renderItem={({ item }) => <MatchItem match={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Nothing to see here</Text>
            <Text style={styles.screenSubtitle}>Add your favorite leagues and teams to get started.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  mainContent: {
    width: '100%',
    flex: 1,
    maxWidth: 500,
  },
  contentTablet: {
    maxWidth: 500,
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
  listContent: {
    paddingHorizontal: 16,
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