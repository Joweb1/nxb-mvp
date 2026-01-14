import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../constants/theme';
import { BlurView } from 'expo-blur';
import { getMatchStatistics, getMatchEvents, getMatchLineups } from '../services/api-football';

const { width } = Dimensions.get('window');

const MatchDetailModal = ({ visible, onClose, match, onTeamPress }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState(null);
  const [lineups, setLineups] = useState(null);

  useEffect(() => {
    if (visible && match) {
      setLoading(true);
      Promise.all([
        getMatchStatistics(match.id),
        getMatchEvents(match.id),
        getMatchLineups(match.id)
      ]).then(([statsData, eventsData, lineupsData]) => {
        setStats(statsData);
        setEvents(eventsData);
        setLineups(lineupsData);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching match details:", err);
        setLoading(false);
      });
    }
  }, [visible, match]);

  if (!match) return null;

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    switch (activeTab) {
      case 'summary':
        return <SummaryTab events={events} />;
      case 'stats':
        return <StatsTab stats={stats} />;
      case 'lineups':
        return <LineupsTab lineups={lineups} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="chevron-down" size={30} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{match.league}</Text>
          </View>

          <View style={styles.scoreBoard}>
            <TouchableOpacity style={styles.teamContainer} onPress={() => onTeamPress(match.homeId)}>
              <Image source={{ uri: match.teamALogo }} style={styles.teamLogoBig} />
              <Text style={styles.teamNameBig}>{match.teamA}</Text>
            </TouchableOpacity>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreBig}>{match.scoreA} - {match.scoreB}</Text>
              <Text style={styles.matchStatus}>{match.minute}</Text>
            </View>
            <TouchableOpacity style={styles.teamContainer} onPress={() => onTeamPress(match.awayId)}>
              <Image source={{ uri: match.teamBLogo }} style={styles.teamLogoBig} />
              <Text style={styles.teamNameBig}>{match.teamB}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {['summary', 'stats', 'lineups'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.contentContainer}>
            {renderTabContent()}
          </ScrollView>
        </BlurView>
      </View>
    </Modal>
  );
};

const SummaryTab = ({ events }) => {
  if (!events || events.length === 0) return <Text style={styles.noDataText}>No events available</Text>;
  return (
    <View style={styles.tabContent}>
      {events.map((event, index) => (
        <View key={index} style={styles.eventRow}>
          <Text style={styles.eventTime}>{event.time.elapsed}'</Text>
          <View style={styles.eventDetail}>
            <Text style={styles.eventPlayer}>{event.player.name}</Text>
            <Text style={styles.eventType}>{event.type} - {event.detail}</Text>
          </View>
          <View style={styles.eventTeam}>
             <Image source={{ uri: event.team.logo }} style={styles.miniLogo} />
          </View>
        </View>
      ))}
    </View>
  );
};

const StatsTab = ({ stats }) => {
  if (!stats || stats.length === 0) return <Text style={styles.noDataText}>No stats available</Text>;
  
  // Consolidate stats (assuming standard structure array of 2 teams)
  const homeStats = stats[0].statistics;
  const awayStats = stats[1].statistics;

  return (
    <View style={styles.tabContent}>
      {homeStats.map((stat, index) => {
        const type = stat.type;
        const homeValue = stat.value;
        const awayValue = awayStats.find(s => s.type === type)?.value || 0;
        
        // Simple comparison for visual bar (rudimentary)
        const total = (parseInt(homeValue) || 0) + (parseInt(awayValue) || 0);
        const homePercent = total === 0 ? 50 : ((parseInt(homeValue) || 0) / total) * 100;
        
        return (
          <View key={index} style={styles.statRow}>
             <View style={styles.statHeader}>
                <Text style={styles.statValue}>{homeValue || 0}</Text>
                <Text style={styles.statLabel}>{type}</Text>
                <Text style={styles.statValue}>{awayValue || 0}</Text>
             </View>
             <View style={styles.statBarContainer}>
                <View style={[styles.statBar, { width: `${homePercent}%`, backgroundColor: COLORS.primary }]} />
                <View style={[styles.statBar, { width: `${100 - homePercent}%`, backgroundColor: '#444' }]} />
             </View>
          </View>
        );
      })}
    </View>
  );
};

const LineupsTab = ({ lineups }) => {
   if (!lineups || lineups.length === 0) return <Text style={styles.noDataText}>No lineups available</Text>;

   return (
     <View style={styles.tabContent}>
       {lineups.map((teamLineup, index) => (
         <View key={index} style={styles.lineupContainer}>
           <Text style={styles.lineupTeamName}>{teamLineup.team.name} ({teamLineup.formation})</Text>
           <Text style={styles.coachName}>Coach: {teamLineup.coach.name}</Text>
           <View style={styles.playersList}>
             {teamLineup.startXI.map((player, idx) => (
                <View key={idx} style={styles.playerRow}>
                  <Text style={styles.playerNumber}>{player.player.number}</Text>
                  <Text style={styles.playerName}>{player.player.name} ({player.player.pos})</Text>
                </View>
             ))}
           </View>
         </View>
       ))}
     </View>
   );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  blurContainer: {
    flex: 1,
    marginTop: 50,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: SIZES.padding,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  closeButton: {
    position: 'absolute',
    left: SIZES.padding,
    top: SIZES.padding,
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
  },
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding * 1.5,
    backgroundColor: '#161616',
  },
  teamContainer: {
    alignItems: 'center',
    width: '30%',
  },
  teamLogoBig: {
    width: 60,
    height: 60,
    marginBottom: SIZES.base,
  },
  teamNameBig: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreBig: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 32,
    color: COLORS.text,
  },
  matchStatus: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 5,
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
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
  },
  contentContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  loaderContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  noDataText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: FONT_FAMILY.primary,
  },
  // Event Styles
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 8,
  },
  eventTime: {
    width: 40,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  eventDetail: {
    flex: 1,
  },
  eventPlayer: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
  },
  eventType: {
    fontFamily: FONT_FAMILY.primary,
    color: '#bbb',
    fontSize: 12,
  },
  eventTeam: {
     marginLeft: 10,
  },
  miniLogo: {
     width: 20, 
     height: 20,
  },
  // Stats Styles
  statRow: {
    marginBottom: 15,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    color: '#bbb',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
  },
  statValue: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
    width: 30,
    textAlign: 'center',
  },
  statBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  statBar: {
    height: '100%',
  },
  // Lineup Styles
  lineupContainer: {
    marginBottom: 25,
  },
  lineupTeamName: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 5,
  },
  coachName: {
    color: '#888',
    fontSize: 12,
    marginBottom: 10,
  },
  playersList: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerNumber: {
    width: 30,
    color: COLORS.primary,
    fontFamily: FONT_FAMILY.bold,
  },
  playerName: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
  },
});

export default MatchDetailModal;
