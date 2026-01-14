import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../constants/theme';
import MatchItem from './MatchItem';

const { height: screenHeight } = Dimensions.get('window');

const SearchModal = ({ visible, onClose, matches }) => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Reset search when modal opens
  useEffect(() => {
    if (visible) {
      setSearchText('');
      setActiveTab('all');
    }
  }, [visible]);

  // Extract unique teams and leagues from matches
  const { uniqueTeams, uniqueLeagues } = useMemo(() => {
    const teamsMap = new Map();
    const leaguesMap = new Map();

    matches.forEach(match => {
      // Teams
      if (!teamsMap.has(match.teamA)) {
        teamsMap.set(match.teamA, { name: match.teamA, logo: match.teamALogo, type: 'team' });
      }
      if (!teamsMap.has(match.teamB)) {
        teamsMap.set(match.teamB, { name: match.teamB, logo: match.teamBLogo, type: 'team' });
      }

      // Leagues
      if (!leaguesMap.has(match.league)) {
        leaguesMap.set(match.league, { name: match.league, logo: match.leagueIcon, country: match.leagueCountry, type: 'league' });
      }
    });

    return {
      uniqueTeams: Array.from(teamsMap.values()),
      uniqueLeagues: Array.from(leaguesMap.values()),
    };
  }, [matches]);

  // Filter Logic
  const results = useMemo(() => {
    if (!searchText.trim()) return [];

    const lowerSearch = searchText.toLowerCase();

    const filteredMatches = matches.filter(match => 
      match.teamA.toLowerCase().includes(lowerSearch) ||
      match.teamB.toLowerCase().includes(lowerSearch) ||
      match.league.toLowerCase().includes(lowerSearch)
    ).map(m => ({ ...m, type: 'match' }));

    const filteredTeams = uniqueTeams.filter(team => 
      team.name.toLowerCase().includes(lowerSearch)
    );

    const filteredLeagues = uniqueLeagues.filter(league => 
      league.name.toLowerCase().includes(lowerSearch)
    );

    if (activeTab === 'matches') return filteredMatches;
    if (activeTab === 'teams') return filteredTeams;
    if (activeTab === 'leagues') return filteredLeagues;

    // 'all' tab: interleave or just concat? Let's concat with headers if we wanted, but for now simple list
    // Priority: Teams/Leagues first, then matches? Or Matches first?
    // Let's do Teams, Leagues, then Matches
    return [...filteredTeams, ...filteredLeagues, ...filteredMatches];

  }, [searchText, activeTab, matches, uniqueTeams, uniqueLeagues]);

  const renderItem = ({ item }) => {
    if (item.type === 'match') {
      return <MatchItem match={item} />;
    }
    
    return (
      <View style={styles.simpleItemContainer}>
        <View style={styles.iconContainer}>
            <Image source={{ uri: item.logo }} style={styles.itemLogo} contentFit="contain" />
        </View>
        <View style={styles.itemTextContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.type === 'league' && <Text style={styles.itemSubText}>{item.country}</Text>}
            {item.type === 'team' && <Text style={styles.itemSubText}>Team</Text>}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
      </View>
    );
  };

  const TabButton = ({ title, id }) => (
    <TouchableOpacity 
      style={[styles.tab, activeTab === id && styles.activeTab]}
      onPress={() => setActiveTab(id)}
    >
      <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={24} color="#999" />
                <TextInput 
                    style={styles.input}
                    placeholder="Search matches, teams, leagues..."
                    placeholderTextColor="#666"
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
            <TabButton title="All" id="all" />
            <TabButton title="Matches" id="matches" />
            <TabButton title="Teams" id="teams" />
            <TabButton title="Leagues" id="leagues" />
        </View>

        <View style={styles.content}>
            <FlashList 
                data={results}
                renderItem={renderItem}
                estimatedItemSize={70}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: SIZES.padding }}
                ListEmptyComponent={
                    searchText.length > 0 ? (
                        <Text style={styles.emptyText}>No results found for "{searchText}"</Text>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <MaterialCommunityIcons name="magnify" size={64} color="#333" />
                            <Text style={styles.placeholderText}>Start typing to search...</Text>
                        </View>
                    )
                }
            />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50, // safe area approximation
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
    gap: SIZES.base,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SIZES.base,
    height: 50,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    marginLeft: SIZES.base,
  },
  cancelButton: {
    padding: SIZES.base,
  },
  cancelText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.base,
    gap: 10,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(58, 134, 255, 0.15)',
    borderColor: COLORS.primary,
  },
  tabText: {
    color: '#999',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
  },
  activeTabText: {
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
  content: {
    flex: 1,
  },
  simpleItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
  },
  itemLogo: {
    width: 24,
    height: 24,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
  },
  itemSubText: {
    color: '#666',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: FONT_FAMILY.primary,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    gap: SIZES.base,
  },
  placeholderText: {
    color: '#444',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
  }
});

export default SearchModal;
