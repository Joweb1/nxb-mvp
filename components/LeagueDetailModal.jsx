import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES } from '../constants/theme';
import { getLeagueStandings } from '../services/api-football';

const LeagueDetailModal = ({ visible, onClose, leagueName, leagueId, leagueLogo, leagueCountry }) => {
  const [activeTab, setActiveTab] = useState('standings');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && leagueId) {
      setLoading(true);
      // Assuming current season is 2025 based on date, or fetching dynamically. 
      // API Football usually needs a specific season year.
      // Using 2023 as a fallback for the MVP/Free plan which limits access to current seasons
      const currentYear = 2023; 
      
      getLeagueStandings(currentYear, leagueId).then(data => {
        // Standings data structure: response[0].league.standings[0] (array of teams)
        if (data && data.length > 0 && data[0].league.standings) {
             setStandings(data[0].league.standings[0]);
        } else {
             setStandings([]); // Ensure empty if no data found
        }
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching standings:", err);
        setStandings([]); // Reset on error
        setLoading(false);
      });
    }
  }, [visible, leagueId]);

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
    
    if (activeTab === 'standings') {
       if (!standings || standings.length === 0) {
         return (
           <View style={{ padding: 20, alignItems: 'center' }}>
             <Text style={styles.noDataText}>Standings not available for this season (2023).</Text>
             <Text style={[styles.noDataText, { fontSize: 12, marginTop: 10 }]}>Note: Free API plan has limited historical data access.</Text>
           </View>
         );
       }

       return (
         <View style={styles.standingsContainer}>
            <View style={styles.tableHeader}>
               <Text style={[styles.th, { width: 30 }]}>#</Text>
               <Text style={[styles.th, { flex: 1, textAlign: 'left' }]}>Team</Text>
               <Text style={[styles.th, { width: 30 }]}>MP</Text>
               <Text style={[styles.th, { width: 30 }]}>GD</Text>
               <Text style={[styles.th, { width: 30 }]}>Pts</Text>
            </View>
            {standings.map((teamData) => (
               <View key={teamData.team.id} style={styles.tableRow}>
                  <Text style={[styles.td, { width: 30 }]}>{teamData.rank}</Text>
                  <View style={[styles.td, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
                     <Image source={{ uri: teamData.team.logo }} style={styles.miniLogo} />
                     <Text style={styles.teamName}>{teamData.team.name}</Text>
                  </View>
                  <Text style={[styles.td, { width: 30 }]}>{teamData.all.played}</Text>
                  <Text style={[styles.td, { width: 30 }]}>{teamData.goalsDiff}</Text>
                  <Text style={[styles.td, { width: 30, fontFamily: FONT_FAMILY.bold, color: COLORS.primary }]}>{teamData.points}</Text>
               </View>
            ))}
         </View>
       );
    }
    return <Text style={styles.noDataText}>Content coming soon...</Text>;
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Image source={{ uri: leagueLogo }} style={styles.leagueLogo} />
            <Text style={styles.leagueName}>{leagueName}</Text>
            <Text style={styles.country}>{leagueCountry}</Text>
        </View>

        <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, activeTab === 'standings' && styles.activeTab]} onPress={() => setActiveTab('standings')}>
               <Text style={[styles.tabText, activeTab === 'standings' && styles.activeTabText]}>Standings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'matches' && styles.activeTab]} onPress={() => setActiveTab('matches')}>
               <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>Matches</Text>
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
           {renderContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: '#161616',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 5,
  },
  leagueLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  leagueName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.text,
    textAlign: 'center',
  },
  country: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: '#888',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONT_FAMILY.primary,
    color: '#888',
  },
  activeTabText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  standingsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: SIZES.radius,
    padding: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
    marginBottom: 10,
  },
  th: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.bold,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    alignItems: 'center',
  },
  td: {
    color: COLORS.text,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.primary,
  },
  miniLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  teamName: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
  },
  noDataText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LeagueDetailModal;
