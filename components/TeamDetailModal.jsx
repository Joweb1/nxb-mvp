import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES } from '../constants/theme';
import { Image } from 'expo-image';

const TeamDetailModal = ({ visible, onClose, teamId }) => {
  // Placeholder for now, as fetching detailed team stats requires another API call and extensive UI work.
  // This will be expanded in future iterations.
  
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
         </TouchableOpacity>
         <View style={styles.content}>
            <Text style={styles.text}>Team Details Coming Soon</Text>
            <Text style={styles.subText}>Team ID: {teamId}</Text>
         </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  content: {
    alignItems: 'center',
  },
  text: {
    color: COLORS.text,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
  },
  subText: {
    color: '#888',
    marginTop: 10,
    fontFamily: FONT_FAMILY.primary,
  },
});

export default TeamDetailModal;
