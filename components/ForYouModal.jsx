import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    }
  }, [visible]);

  const renderItem = ({ item, type }) => {
    const isAdded = isForYou(item.name, type);
    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.logo }} style={styles.itemLogo} />
        <Text style={styles.itemName}>{item.name}</Text>
        <TouchableOpacity onPress={() => addToForYou(item.name, type)}>
          <MaterialCommunityIcons
            name={isAdded ? 'check-circle' : 'plus-circle-outline'}
            size={24}
            color={isAdded ? COLORS.primary : COLORS.text}
          />
        </TouchableOpacity>
      </View>
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
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add to your feed</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
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
              data={activeTab === 'leagues' ? leagues : teams}
              renderItem={({ item }) => renderItem({ item, type: activeTab })}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          )}
        </View>
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
});

export default ForYouModal;
