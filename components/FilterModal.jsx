import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '../constants/theme';

const FilterModal = ({ visible, onClose, onApply, currentFilters }) => {
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'time');
  const [status, setStatus] = useState(currentFilters.status || 'all');
  const [showOdds, setShowOdds] = useState(currentFilters.showOdds || false);

  const handleApply = () => {
    onApply({ sortBy, status, showOdds });
    onClose();
  };

  const RadioOption = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity 
      style={[styles.radioOption, selectedValue === value && styles.radioOptionSelected]}
      onPress={() => onSelect(value)}
    >
      <Text style={[styles.radioText, selectedValue === value && styles.radioTextSelected]}>{label}</Text>
      {selectedValue === value && <MaterialCommunityIcons name="check" size={18} color={COLORS.background} />}
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
            <Text style={styles.title}>Filter & Sort</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.optionsRow}>
              <RadioOption label="All" value="all" selectedValue={status} onSelect={setStatus} />
              <RadioOption label="Live" value="live" selectedValue={status} onSelect={setStatus} />
              <RadioOption label="Upcoming" value="upcoming" selectedValue={status} onSelect={setStatus} />
              <RadioOption label="Finished" value="finished" selectedValue={status} onSelect={setStatus} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.optionsRow}>
              <RadioOption label="Time" value="time" selectedValue={sortBy} onSelect={setSortBy} />
              <RadioOption label="Popularity" value="popularity" selectedValue={sortBy} onSelect={setSortBy} />
              <RadioOption label="League" value="league" selectedValue={sortBy} onSelect={setSortBy} />
            </View>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding,
    paddingBottom: 40,
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
  section: {
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: COLORS.text,
    marginRight: 4,
  },
  radioTextSelected: {
    color: COLORS.background,
    fontFamily: FONT_FAMILY.bold,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  applyButtonText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.background,
  },
});

export default FilterModal;
