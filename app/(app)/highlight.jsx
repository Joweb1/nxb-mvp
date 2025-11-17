import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES } from '@/constants/theme';
import { mockMatches } from '@/mock/matches';
import MatchItem from '@/components/MatchItem';
import { Image } from 'expo-image';

const HighlightScreen = () => {
  const [adVisible, setAdVisible] = React.useState(true);
  const [oddsEnabled, setOddsEnabled] = React.useState(false);
  const [matchesCollapsed, setMatchesCollapsed] = React.useState(false);

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="magnify" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>NXB Football</Text>
      <View style={styles.headerRight}>
        <Image
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXCoVGMUm1NGhYIzanEHN4bAJNjWeYeWZ05VKdlg30z94X9ZIoJRbfjMyCtxfONofU4wAT-Bic_fAaNTUDUowZbFuFFrWOD-4erj7BpS9JOQ2_bvvffdQFL2zELhifyftodejxZS9NhIVymTkXUnoyphZk0TqW4KZPaUXusEYWO6ih2JCl7Pj0e6UGq-SAjFRaIGwsOivsySL87_bcsU8TFkyILLaxYwKrpcObZXQ8sGaAQ3c86_V6HckzKKwNVdAinjmarR_eM5wO' }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.headerButton}>
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const AdBanner = () => (
    adVisible && (
      <View style={styles.adBanner}>
        <View style={styles.adContent}>
          <View style={styles.adLogo}>
            <Text style={styles.adLogoText}>LS{"\n"}Bet</Text>
          </View>
          <View style={styles.adTextContainer}>
            <Text style={styles.adTitle}>OYA, claim your ₦100K Free Bets!</Text>
            <Text style={styles.adSubtitle}>We match your first deposit Only on NXB</Text>
            <Text style={styles.adTerms}>*Terms apply. Bet responsibly. 18+</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeAdButton} onPress={() => setAdVisible(false)}>
          <MaterialCommunityIcons name="close" size={20} color={COLORS.border} />
        </TouchableOpacity>
      </View>
    )
  );

  const DateSelector = () => (
    <View style={styles.dateNavContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateNavScrollView}>
        <TouchableOpacity style={styles.dateNavItem}>
          <Text style={styles.dateNavTextBold}>LIVE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateNavItem}>
          <Text style={styles.dateNavText}>THU</Text>
          <Text style={styles.dateNavText}>13 NOV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateNavItem}>
          <Text style={styles.dateNavText}>FRI</Text>
          <Text style={styles.dateNavText}>14 NOV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dateNavItem, styles.dateNavItemActive]}>
          <Text style={styles.dateNavTextBold}>TODAY</Text>
          <Text style={styles.dateNavText}>15 NOV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateNavItem}>
          <Text style={styles.dateNavText}>SUN</Text>
          <Text style={styles.dateNavText}>16 NOV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateNavItem}>
          <Text style={styles.dateNavText}>MON</Text>
          <Text style={styles.dateNavText}>17 NOV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateNavItem}>
          <MaterialCommunityIcons name="calendar-today" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const groupedMatches = React.useMemo(() => {
    const groups = {};
    mockMatches.forEach(match => {
      if (!groups[match.league]) {
        groups[match.league] = [];
      }
      groups[match.league].push(match);
    });

    const data = [];
    for (const leagueName in groups) {
      data.push({ type: 'leagueHeader', leagueName: leagueName });
      groups[leagueName].forEach(match => {
        data.push({ type: 'match', data: match });
      });
    }
    return data;
  }, [mockMatches]);

  const renderItem = ({ item }) => {
    if (item.type === 'leagueHeader') {
      // Find the corresponding league in highlight.html to get the icon and country
      let leagueIcon = 'soccer'; // Default icon
      let leagueCountry = '';

      if (item.leagueName === 'NPFL') {
        leagueIcon = 'trophy'; // Assuming trophy for NPFL
        leagueCountry = 'Nigeria';
      } else if (item.leagueName.includes('World Cup Qualifiers')) {
        leagueIcon = 'trophy'; // Assuming trophy for World Cup Qualifiers
        leagueCountry = 'UEFA Qualification: 1st Round: Group B'; // Hardcoding for now
      }

      return (
        <View>
          <View style={styles.leagueHeader}>
            <View style={styles.leagueHeaderLeft}>
              {leagueIcon && (
                <View style={styles.leagueIconContainer}>
                  <MaterialCommunityIcons name={leagueIcon} size={18} color="#FFD700" />
                </View>
              )}
              <View>
                <Text style={styles.leagueTitle}>{item.leagueName}</Text>
                {leagueCountry && <Text style={styles.leagueCountry}>{leagueCountry}</Text>}
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
          </View>
          <View style={styles.leagueSeparator} />
        </View>
      );
    } else if (item.type === 'match') {
      return <MatchItem match={item.data} />;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <AdBanner />
        <View style={styles.scoresOddsContainer}>
          <TouchableOpacity style={styles.scoresButton}>
            <Text style={styles.scoresButtonText}>Scores</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.oddsSwitchContainer}>
            <Text style={styles.oddsSwitchText}>Odds</Text>
            <Switch
              trackColor={{ false: '#767577', true: COLORS.primary }}
              thumbColor={oddsEnabled ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setOddsEnabled(previousState => !previousState)}
              value={oddsEnabled}
            />
          </View>
        </View>
        <DateSelector />
        <View style={styles.matchesContainer}>
          <View style={styles.favouritesHeader}>
            <View style={styles.favouritesHeaderLeft}>
              <View style={styles.favouritesIconContainer}>
                <MaterialCommunityIcons name="soccer" size={18} color="#000" />
              </View>
              <Text style={styles.favouritesTitle}>Matches</Text>
            </View>
            <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setMatchesCollapsed(!matchesCollapsed)}>
              <MaterialCommunityIcons name="dots-vertical" size={18} color="#999" />
              <MaterialCommunityIcons name={matchesCollapsed ? "chevron-down" : "chevron-up"} size={18} color="#999" />
            </TouchableOpacity>
          </View>
          {!matchesCollapsed && (
            <View style={styles.favouritesContent}>
              <FlatList
                data={groupedMatches}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.type === 'match' ? item.data.id : item.leagueName + index}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: SIZES.base,
  },
  adBanner: {
    backgroundColor: '#2c2c2c',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    margin: SIZES.padding,
    position: 'relative',
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adLogo: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  adLogoText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  adSubtitle: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: COLORS.text,
    marginVertical: 4,
  },
  adTerms: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    color: COLORS.border,
  },
  closeAdButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  dateNavContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  dateNavScrollView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateNavItem: {
    alignItems: 'center',
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
  dateNavItemActive: {
    backgroundColor: '#2c2c2c',
  },
  dateNavText: {
    fontFamily: FONT_FAMILY.primary,
    color: COLORS.border,
    fontSize: 12,
  },
  dateNavTextBold: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
    fontSize: 14,
  },
  matchesContainer: {
    padding: SIZES.padding,
  },
  scoresOddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },
  scoresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: 20,
    gap: 5,
  },
  scoresButtonText: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: COLORS.text,
  },
  oddsSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  oddsSwitchText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  favouritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  favouritesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  favouritesIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favouritesTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  favouritesContent: {
    backgroundColor: '#1A1A1A', // dark:bg-zinc-900
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
  },
  leagueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base * 1.5,
  },
  leagueHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  leagueIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2c2c2c', // gray-200 dark:bg-zinc-700
    justifyContent: 'center',
    alignItems: 'center',
  },
  leagueTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  leagueCountry: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 10,
    color: '#999', // gray-500 dark:text-gray-400
  },
  leagueSeparator: {
    height: 1,
    backgroundColor: '#2c2c2c', // gray-200 dark:bg-zinc-800
    marginVertical: SIZES.base,
  },
});

export default HighlightScreen;
