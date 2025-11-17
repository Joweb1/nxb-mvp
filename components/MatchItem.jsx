import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES } from '@/constants/theme';

const MatchItem = ({ match }) => {
  const isLive = match.status === 'live';
  const actionText = match.action === 'Preview' ? 'Preview' : 'Summary';
  const starIconColor = match.isFavourite ? COLORS.primary : '#999'; // text-primary or gray-400

  return (
    <View style={styles.container}>
      <View style={styles.timeStatusContainer}>
        {isLive ? (
          <Text style={styles.liveMinute}>{match.minute}</Text>
        ) : (
          <Text style={styles.time}>{match.time}</Text>
        )}
      </View>

      {isLive && <View style={styles.liveIndicator} />}

      <View style={styles.teamsScoresContainer}>
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

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>{actionText}</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <MaterialCommunityIcons name="star" size={20} color={starIconColor} />
      </TouchableOpacity>
    </View>
  );
};

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
  actionButton: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
  },
  actionButtonText: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    color: COLORS.primary,
  },
});

export default MatchItem;
