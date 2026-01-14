import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const ForYouModal = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('leagues');
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { addToForYou, isForYou } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const matchesSnapshot = await getDocs(collection(db, 'matches'));
      const allLeagues = new Map();
      const allTeams = new Map();
      matchesSnapshot.forEach(doc => {
        const data = doc.data();
        if (!allLeagues.has(data.league.name)) {
          allLeagues.set(data.league.name, { name: data.league.name, logo: data.league.logo });
        }
        if (!allTeams.has(data.teams.home.name)) {
          allTeams.set(data.teams.home.name, { name: data.teams.home.name, logo: data.teams.home.logo });
        }
        if (!allTeams.has(data.teams.away.name)) {
          allTeams.set(data.teams.away.name, { name: data.teams.away.name, logo: data.teams.away.logo });
        }
      });
      setLeagues([...allLeagues.values()].sort((a, b) => a.name.localeCompare(b.name)));
      setTeams([...allTeams.values()].sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    };

    if (visible) {
      fetchData();
      setSearchText('');
    }
  }, [visible]);

  const filteredData = (activeTab === 'leagues' ? leagues : teams).filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item, type }) => {
    const isAdded = isForYou(item.name, type);
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => addToForYou(item.name, type)}>
        <Image source={{ uri: item.logo }} style={styles.itemLogo} />
        <Text style={styles.itemName}>{item.name}</Text>
        <MaterialCommunityIcons
          name={isAdded ? 'check-circle' : 'plus-circle-outline'}
          size={24}
          color={isAdded ? COLORS.primary : COLORS.text}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add to your feed</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'leagues' && styles.activeTab]}
              onPress={() => setActiveTab('leagues')}
            >
              <Text style={styles.tabText}>Leagues</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'teams' && styles.activeTab]}
              onPress={() => setActiveTab('teams')}
            >
              <Text style={styles.tabText}>Teams</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filteredData}
              renderItem={({ item }) => renderItem({ item, type: activeTab })}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 50 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No results found</Text>
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    height: '80%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.padding,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: SIZES.h2,
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SIZES.base,
    marginBottom: SIZES.padding,
    height: 45,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
    fontSize: SIZES.body,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.padding,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.base,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.card,
    marginBottom: SIZES.base,
  },
  itemLogo: {
    width: 30,
    height: 30,
    marginRight: SIZES.base,
  },
  itemName: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: SIZES.body,
    color: COLORS.text,
    flex: 1,
  },
  emptyText: {
    fontFamily: FONT_FAMILY.primary,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ForYouModal;
