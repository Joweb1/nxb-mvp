import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { COLORS, FONT_FAMILY, SIZES } from '../../constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuth } from '@/context/AuthContext';
import MatchItem from '@/components/MatchItem';

const FavouritesScreen = () => {
  const { isTablet } = useResponsive();
  const { favorites } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteMatches = async () => {
      setLoading(true);
      if (favorites.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const matchesRef = collection(db, 'matches');
      const q = query(matchesRef, where(documentId(), 'in', favorites));
      const querySnapshot = await getDocs(q);
      const matchesData = querySnapshot.docs.map(doc => {
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
      setMatches(matchesData);
      setLoading(false);
    };

    fetchFavoriteMatches();
  }, [favorites]);

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft} />
      <Text style={styles.headerTitle}>Favourites</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, isTablet && styles.contentTablet]}>
        <Header />
        {matches.length > 0 ? (
          <FlatList
            data={matches}
            renderItem={({ item }) => <MatchItem match={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.body}>
            <Text style={styles.title}>No Favourites</Text>
            <Text style={styles.subtitle}>You haven't added any matches to your favourites yet.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    width: '100%',
    flex: 1,
    maxWidth: 500,
  },
  contentTablet: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default FavouritesScreen;
