import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../constants/theme';
import { getTeamInfo, getTeamStatistics } from '../services/api-football';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const TeamDetailModal = ({ visible, onClose, teamId }) => {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (visible && teamId) {
      setLoading(true);
      // Fetch team basic info and stats for a default league (e.g. Premier League 2023)
      Promise.all([
        getTeamInfo(teamId),
        getTeamStatistics(2023, teamId, 39) 
      ]).then(([info, statistics]) => {
        if (info && info.length > 0) {
          setTeamData(info[0]);
        }
        setStats(statistics);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching team details:", err);
        setLoading(false);
      });
    }
  }, [visible, teamId]);

  if (!teamId) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (!teamData) {
      return <Text style={styles.errorText}>Team information not available.</Text>;
    }

    const { team, venue } = teamData;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stadium Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Venue</Text>
          <Image source={{ uri: venue.image }} style={styles.venueImage} />
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.venueCity}>{venue.city}, {team.country}</Text>
            <View style={styles.capacityRow}>
               <MaterialCommunityIcons name="account-group" size={16} color={COLORS.primary} />
               <Text style={styles.capacityText}>Capacity: {venue.capacity.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Form/Stats Overview */}
        {stats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Season Overview (2023)</Text>
            <View style={styles.statsGrid}>
              <StatItem label="Played" value={stats.fixtures.played.total} />
              <StatItem label="Wins" value={stats.fixtures.wins.total} color="lightgreen" />
              <StatItem label="Draws" value={stats.fixtures.draws.total} color="#FFD700" />
              <StatItem label="Losses" value={stats.fixtures.losses.total} color="#FF4D4D" />
            </View>
            
            <View style={styles.goalsContainer}>
               <View style={styles.goalStat}>
                  <Text style={styles.goalValue}>{stats.goals.for.total.total}</Text>
                  <Text style={styles.goalLabel}>Goals Scored</Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.goalStat}>
                  <Text style={styles.goalValue}>{stats.goals.against.total.total}</Text>
                  <Text style={styles.goalLabel}>Goals Conceded</Text>
               </View>
            </View>
          </View>
        )}

        <View style={styles.infoRow}>
           <Text style={styles.infoLabel}>Founded</Text>
           <Text style={styles.infoValue}>{team.founded}</Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="chevron-down" size={30} color={COLORS.text} />
          </TouchableOpacity>
          {teamData && (
            <View style={styles.headerContent}>
              <Image source={{ uri: teamData.team.logo }} style={styles.bigLogo} />
              <Text style={styles.teamName}>{teamData.team.name}</Text>
              <Text style={styles.countryName}>{teamData.team.country}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const StatItem = ({ label, value, color = COLORS.text }) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: '#161616',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  headerContent: {
    alignItems: 'center',
  },
  bigLogo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  teamName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  countryName: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  loaderContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    color: '#888',
    fontSize: 12,
    fontFamily: FONT_FAMILY.bold,
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  venueImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },
  venueName: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
  },
  venueCity: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  capacityText: {
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: FONT_FAMILY.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  goalsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  goalStat: {
    flex: 1,
    alignItems: 'center',
  },
  goalValue: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
  },
  goalLabel: {
    color: '#888',
    fontSize: 12,
  },
  divider: {
    width: 1,
    backgroundColor: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  infoLabel: {
    color: '#888',
    fontFamily: FONT_FAMILY.primary,
  },
  infoValue: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
  },
  errorText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  }
});

export default TeamDetailModal;