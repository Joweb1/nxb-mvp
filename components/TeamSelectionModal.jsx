import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const TeamSelectionModal = ({ visible, onClose, onSelect, currentTeam }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const matchesSnapshot = await getDocs(collection(db, 'matches'));
        const allTeams = new Map();
        matchesSnapshot.forEach(doc => {
          const data = doc.data();
          if (!allTeams.has(data.teams.home.name)) {
            allTeams.set(data.teams.home.name, { name: data.teams.home.name, logo: data.teams.home.logo });
          }
          if (!allTeams.has(data.teams.away.name)) {
            allTeams.set(data.teams.away.name, { name: data.teams.away.name, logo: data.teams.away.logo });
          }
        });
        setTeams([...allTeams.values()].sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Error fetching teams: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchTeams();
      setSearchText('');
    }
  }, [visible]);

  const filteredTeams = useMemo(() => {
    return teams.filter(t => t.name.toLowerCase().includes(searchText.toLowerCase()));
  }, [teams, searchText]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.teamItem, currentTeam?.name === item.name && styles.selectedTeam]} 
      onPress={() => onSelect(item)}
    >
      <View style={styles.teamInfo}>
        <Image source={{ uri: item.logo }} style={styles.teamLogo} contentFit="contain" />
        <Text style={styles.teamName}>{item.name}</Text>
      </View>
      {currentTeam?.name === item.name && (
        <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Favorite Team</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Search teams..."
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ flex: 1, width: '100%' }}>
                <FlashList
                data={filteredTeams}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                estimatedItemSize={60}
                contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '70%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: SIZES.h2,
    color: COLORS.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SIZES.base,
    height: 45,
    marginBottom: SIZES.padding,
  },
  input: {
    flex: 1,
    marginLeft: SIZES.base,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: 8,
    backgroundColor: '#1A1A1A',
  },
  selectedTeam: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamLogo: {
    width: 30,
    height: 30,
  },
  teamName: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default TeamSelectionModal;
