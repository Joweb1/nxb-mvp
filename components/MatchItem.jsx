import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES } from '@/constants/theme';

import { useAuth } from '@/context/AuthContext';

const MatchItem = React.memo(({ match, onPress }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const isLive = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(match.status);
  const isFavourite = isFavorite(match.id);
  const starIconColor = isFavourite ? COLORS.primary : '#999';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.timeStatusContainer}>
        {isLive ? (
          <View style={styles.liveContainer}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : (
          <Text style={styles.time}>{match.time}</Text>
        )}
      </View>

      {isLive && <View style={styles.liveIndicator} />}

      <View style={styles.teamsScoresContainer}>
        <Text style={styles.leagueName}>{match.league}</Text>
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: match.teamALogo }} style={styles.teamLogo} />
            <Text style={styles.teamName}>{match.teamA}</Text>
          </View>
          <Text style={styles.score}>{match.scoreA}</Text>
        </View>
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: match.teamBLogo }} style={styles.teamBLogo} />
            <Text style={styles.teamName}>{match.teamB}</Text>
          </View>
          <Text style={styles.score}>{match.scoreB}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => toggleFavorite(match.id)}>
        <MaterialCommunityIcons name="star" size={20} color={starIconColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
    paddingVertical: SIZES.base * 1.5,
  },
  timeStatusContainer: {
    width: 40, // Fixed width for time/minute
    alignItems: 'center',
  },
  time: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    color: '#999', // gray-600
  },
  liveMinute: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    color: COLORS.primary,
  },
  liveIndicator: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  teamsScoresContainer: {
    flex: 1,
    gap: SIZES.base / 2,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base / 2,
  },
  teamLogo: {
    width: 20,
    height: 20,
  },
  teamBLogo: {
    width: 20,
    height: 20,
    marginLeft: 2, // Adjust for slight alignment with teamA logo
  },
  teamName: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: COLORS.text,
  },
  score: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  liveContainer: {
    backgroundColor: 'rgba(144, 238, 144, 0.2)',
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base / 2,
    paddingVertical: SIZES.base / 4,
  },
  liveText: {
    color: 'lightgreen',
    fontSize: 10,
    fontFamily: FONT_FAMILY.bold,
  },
  leagueName: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    color: '#999',
    marginBottom: SIZES.base / 2,
  },
});

export default MatchItem;
