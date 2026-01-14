import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Switch, Animated, Dimensions, Modal, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '@/constants/theme';
import MatchItem from '@/components/MatchItem';
import { Image } from 'expo-image';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuth } from '@/context/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ITEM_WIDTH = 70;
const ITEM_MARGIN = 4;
const FULL_ITEM_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

const DateSelector = ({ selectedDate, setSelectedDate, liveAnimation }) => {
  const [dates, setDates] = React.useState([]);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const scrollViewRef = React.useRef(null);

  const isSameDay = (date1, date2) => {
      if (!date1 || !date2) return false;
      return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
    };

  React.useEffect(() => {
    const today = new Date();
    const datesArray = [];
    for (let i = -30; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      datesArray.push(date);
    }
    setDates(datesArray);
  }, []);

  const todayIndex = React.useMemo(() => dates.findIndex(d => isSameDay(d, new Date())), [dates]);

  const horizontalPadding = (containerWidth / 2) - (FULL_ITEM_WIDTH / 2);

  const onLayout = (event) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  React.useEffect(() => {
    let timeoutId;
    if (scrollViewRef.current && dates.length > 0 && containerWidth > 0 && todayIndex !== -1) {
      const initialOffset = todayIndex * FULL_ITEM_WIDTH;
      timeoutId = setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: initialOffset, animated: false });
        }
      }, 100);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [dates, containerWidth, todayIndex]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / FULL_ITEM_WIDTH);
    if (dates[index] && !isSameDay(selectedDate, dates[index])) {
      setSelectedDate(dates[index]);
    }
  };

  const handleDatePress = (index) => {
    if (scrollViewRef.current) {
      const offset = index * FULL_ITEM_WIDTH;
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
    }
  };

  const getDayString = (date) => {
    if (isSameDay(date, new Date())) return 'TODAY';
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  return (
    <View style={styles.dateNavContainer}>
      <TouchableOpacity style={styles.liveButton}>
        <View style={styles.liveDot} />
        <Animated.Text style={[styles.dateNavTextBold, styles.liveText, { opacity: liveAnimation }]}>
          LIVE
        </Animated.Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={FULL_ITEM_WIDTH}
          decelerationRate="fast"
          style={styles.dateNavScrollView}
        >
          {dates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dateNavItem}
              onPress={() => handleDatePress(index)}
            >
              <Text style={isSameDay(date, selectedDate) ? styles.dateNavTextBold : styles.dateNavText}>
                {getDayString(date)}
              </Text>
              <Text style={isSameDay(date, selectedDate) ? styles.dateNavTextBold : styles.dateNavText}>
                {date.getDate()} {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.highlightMarker} pointerEvents="none" />
      </View>
      <TouchableOpacity style={styles.calendarButton} onPress={() => handleDatePress(todayIndex)}>
        <MaterialCommunityIcons name="calendar-today" size={24} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
};

import ForYouModal from '@/components/ForYouModal';

const HighlightScreen = () => {
  const [adVisible, setAdVisible] = React.useState(true);
  const [oddsEnabled, setOddsEnabled] = React.useState(false);
  const [matchesCollapsed, setMatchesCollapsed] = React.useState(false);
  const { isTablet } = useResponsive();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [logoutPopupVisible, setLogoutPopupVisible] = React.useState(false);
  const [forYouModalVisible, setForYouModalVisible] = React.useState(false);
  const { logOut, user } = useAuth();
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
          isFavourite: false, // Implement favourite logic later
          league: data.league.name,
          leagueIcon: data.league.logo,
          leagueCountry: data.league.country,
        };
      });
      setMatches(matchesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const liveAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveAnimation, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(liveAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [liveAnimation]);

  const menuAnimation = React.useRef(new Animated.Value(0)).current;
  const popupAnimation = React.useRef(new Animated.Value(0)).current;

  const toggleMenu = (visible) => {
    setMenuVisible(visible);
    Animated.timing(menuAnimation, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const toggleLogoutPopup = (visible) => {
    setLogoutPopupVisible(visible);
    Animated.timing(popupAnimation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    toggleMenu(false);
    toggleLogoutPopup(true);
  };

  const confirmLogout = () => {
    logOut();
    toggleLogoutPopup(false);
  };

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.headerButton} onPress={() => toggleMenu(true)}>
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
        <TouchableOpacity style={styles.headerButton} onPress={() => setForYouModalVisible(true)}>
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
            <Text style={styles.adLogoText}>NXB{"\n"}Bet</Text>
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

  const groupedMatches = useMemo(() => {
    const isSameDay = (date1, date2) => {
      if (!date1 || !date2) return false;
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
    };

    const today = new Date();
    const selected = new Date(selectedDate);
    const isToday = isSameDay(selected, today);
    const isPast = selected < today && !isToday;
    const isFuture = selected > today && !isToday;

    const filtered = matches.filter(match => isSameDay(match.date, selectedDate));

    const groups = {
      live: [],
      upcoming: [],
      finished: [],
    };

    if (isPast) {
      groups.finished = filtered;
    } else if (isFuture) {
      groups.upcoming = filtered;
    } else { // Today
      filtered.forEach(match => {
        if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(match.status)) {
          groups.live.push(match);
        } else if (match.status === 'NS') {
          groups.upcoming.push(match);
        } else {
          groups.finished.push(match);
        }
      });
    }


    const popularLeagues = [
      'Premier League',
      'La Liga',
      'Bundesliga',
      'Serie A',
      'Ligue 1',
      'UEFA Champions League',
      'UEFA Europa League',
    ];

    const sortLeagues = (leagues) => {
      const sortedLeagues = {};
      const leagueNames = Object.keys(leagues);

      leagueNames.sort((a, b) => {
        const aIsPopular = popularLeagues.includes(a);
        const bIsPopular = popularLeagues.includes(b);

        if (aIsPopular && !bIsPopular) {
          return -1;
        }
        if (!aIsPopular && bIsPopular) {
          return 1;
        }
        return a.localeCompare(b);
      });

      leagueNames.forEach(name => {
        sortedLeagues[name] = leagues[name];
      });

      return sortedLeagues;
    };


    const data = [];
    if (groups.live.length > 0) {
      data.push({ type: 'statusHeader', title: 'Live' });
      let leagues = {};
      groups.live.forEach(match => {
        if (!leagues[match.league]) {
          leagues[match.league] = { leagueName: match.league, leagueIcon: match.leagueIcon, leagueCountry: match.leagueCountry, matches: [] };
        }
        leagues[match.league].matches.push(match);
      });
      leagues = sortLeagues(leagues);
      for (const leagueName in leagues) {
        const league = leagues[leagueName];
        data.push({ type: 'leagueHeader', leagueName: league.leagueName, leagueIcon: league.leagueIcon, leagueCountry: league.leagueCountry });
        league.matches.forEach(match => {
          data.push({ type: 'match', data: { ...match, isFavourite: (user.favorites || []).includes(match.id) } });
        });
      }
    }
    if (groups.upcoming.length > 0) {
      data.push({ type: 'statusHeader', title: 'Upcoming' });
       let leagues = {};
      groups.upcoming.forEach(match => {
        if (!leagues[match.league]) {
          leagues[match.league] = { leagueName: match.league, leagueIcon: match.leagueIcon, leagueCountry: match.leagueCountry, matches: [] };
        }
        leagues[match.league].matches.push(match);
      });
      leagues = sortLeagues(leagues);
      for (const leagueName in leagues) {
        const league = leagues[leagueName];
        data.push({ type: 'leagueHeader', leagueName: league.leagueName, leagueIcon: league.leagueIcon, leagueCountry: league.leagueCountry });
        league.matches.forEach(match => {
          data.push({ type: 'match', data: { ...match, isFavourite: (user.favorites || []).includes(match.id) } });
        });
      }
    }
    if (groups.finished.length > 0) {
      data.push({ type: 'statusHeader', title: 'Finished' });
       let leagues = {};
      groups.finished.forEach(match => {
        if (!leagues[match.league]) {
          leagues[match.league] = { leagueName: match.league, leagueIcon: match.leagueIcon, leagueCountry: match.leagueCountry, matches: [] };
        }
        leagues[match.league].matches.push(match);
      });
      leagues = sortLeagues(leagues);
      for (const leagueName in leagues) {
        const league = leagues[leagueName];
        data.push({ type: 'leagueHeader', leagueName: league.leagueName, leagueIcon: league.leagueIcon, leagueCountry: league.leagueCountry });
        league.matches.forEach(match => {
          data.push({ type: 'match', data: { ...match, isFavourite: (user.favorites || []).includes(match.id) } });
        });
      }
    }

    return data;
  }, [matches, selectedDate, user.favorites]);

  const renderItem = ({ item }) => {
    if (item.type === 'statusHeader') {
      return <Text style={styles.statusHeader}>{item.title}</Text>;
    }
    if (item.type === 'leagueHeader') {
      return (
        <View>
          <View style={styles.leagueHeader}>
            <View style={styles.leagueHeaderLeft}>
              {item.leagueIcon && (
                <View style={styles.leagueIconContainer}>
                  <Image source={{ uri: item.leagueIcon }} style={styles.leagueIcon} />
                </View>
              )}
              <View>
                <Text style={styles.leagueTitle}>{item.leagueName}</Text>
                {item.leagueCountry && <Text style={styles.leagueCountry}>{item.leagueCountry}</Text>}
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

  const menuTranslateY = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const popupScale = popupAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

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
        <ScrollView showsVerticalScrollIndicator={false}>
          <AdBanner />
          <View style={styles.scoresOddsContainer}>
            <TouchableOpacity style={styles.scoresButton}>
              <Text style={styles.scoresButtonText}>Scores</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.oddsSwitchContainer}>
              <Text style={styles.oddsSwitchText}>Bet</Text>
              <Switch
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={oddsEnabled ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setOddsEnabled(previousState => !previousState)}
                value={oddsEnabled}
              />
            </View>
          </View>
          <DateSelector
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            liveAnimation={liveAnimation}
          />
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
                {groupedMatches.length > 0 ? (
                  <FlatList
                    data={groupedMatches}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.type === 'match' ? item.data.id : (item.leagueName || item.title) + index}
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={styles.noMatchesText}>Data unavailable for this date</Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        transparent
        visible={menuVisible}
        onRequestClose={() => toggleMenu(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => toggleMenu(false)}>
          <Animated.View style={[styles.menuContainer, { opacity: menuAnimation, transform: [{ translateY: menuTranslateY }] }]}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={logoutPopupVisible}
        onRequestClose={() => toggleLogoutPopup(false)}>
        <Animated.View style={[styles.popupBackdrop, { opacity: popupAnimation }]}>
          <Animated.View style={[styles.popupContainer, { transform: [{ scale: popupScale }] }]}>
            <Text style={styles.popupTitle}>Logout</Text>
            <Text style={styles.popupMessage}>Are you sure you want to logout?</Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity style={[styles.popupButton, styles.cancelButton]} onPress={() => toggleLogoutPopup(false)}>
                <Text style={styles.popupButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.popupButton, styles.confirmButton]} onPress={confirmLogout}>
                <Text style={styles.popupButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
      <ForYouModal visible={forYouModalVisible} onClose={() => setForYouModalVisible(false)} />
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
  content: {
    width: '100%',
    height: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 5,
  },
  liveText: {
    color: 'red',
  },
  dateNavScrollView: {
    flex: 1,
  },
  dateNavItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.base,
    marginHorizontal: ITEM_MARGIN,
    height: 60,
    borderRadius: SIZES.radius,
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
  calendarButton: {
    paddingHorizontal: SIZES.padding,
  },
  highlightMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: FULL_ITEM_WIDTH,
    marginLeft: -(FULL_ITEM_WIDTH / 2),
    backgroundColor: '#2c2c2c',
    borderRadius: SIZES.radius,
    zIndex: -1,
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
  leagueIcon: {
    width: 18,
    height: 18,
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
  modalBackdrop: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 55, // Adjust as needed
    left: SIZES.padding,
    backgroundColor: '#333',
    borderRadius: BORDER_RADIUS.small,
    padding: SIZES.base / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base,
  },
  menuItemText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    marginLeft: SIZES.base,
  },
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#333',
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    width: '80%',
    alignItems: 'center',
  },
  popupTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  popupMessage: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  popupButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  popupButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.base,
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  popupButtonText: {
    color: '#fff',
    fontFamily: FONT_FAMILY.bold,
  },
  noMatchesText: {
    color: COLORS.text,
    textAlign: 'center',
    paddingVertical: 20
  },
  statusHeader: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    backgroundColor: '#2c2c2c',
  },
});

export default HighlightScreen;
