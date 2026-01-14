import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import TeamSelectionModal from '@/components/TeamSelectionModal';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Image } from 'expo-image';

const SettingsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSelectTeam = async (team) => {
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favoriteTeam: team
      });
      setTeamModalVisible(false);
    } catch (error) {
      console.error("Error updating favorite team: ", error);
    } finally {
      setUpdating(false);
    }
  };

  const SettingItem = ({ icon, title, value, onToggle, type = 'toggle', onPress, color = COLORS.text, subTitle, logo }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={type === 'link' ? onPress : () => onToggle(!value)}
      disabled={type === 'toggle'}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={22} color={COLORS.text} />
        </View>
        <View>
            <Text style={[styles.itemText, { color }]}>{title}</Text>
            {subTitle && <Text style={styles.itemSubText}>{subTitle}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        {logo && <Image source={{ uri: logo }} style={styles.teamLogo} contentFit="contain" />}
        {type === 'toggle' ? (
            <Switch
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={value ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={onToggle}
            value={value}
            />
        ) : (
            <MaterialCommunityIcons name="chevron-right" size={22} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }}>
            {updating && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>Personalization</Text>
        <View style={styles.section}>
          <SettingItem 
            icon="soccer" 
            title="Favorite Team" 
            subTitle={user?.favoriteTeam?.name || "None selected"}
            logo={user?.favoriteTeam?.logo}
            type="link"
            onPress={() => setTeamModalVisible(true)}
          />
        </View>

        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.section}>
          <SettingItem 
            icon="bell-outline" 
            title="Push Notifications" 
            value={notificationsEnabled} 
            onToggle={setNotificationsEnabled} 
          />
           <View style={styles.divider} />
          <SettingItem 
            icon="theme-light-dark" 
            title="Dark Mode" 
            value={darkMode} 
            onToggle={setDarkMode} 
          />
           <View style={styles.divider} />
          <SettingItem 
            icon="database-arrow-down-outline" 
            title="Data Saver" 
            value={dataSaver} 
            onToggle={setDataSaver} 
          />
        </View>

        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.section}>
          <SettingItem 
            icon="account-edit-outline" 
            title="Edit Profile" 
            type="link"
            onPress={() => router.push('/(app)/profile/profile')} 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="shield-check-outline" 
            title="Privacy & Security" 
            type="link" 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="help-circle-outline" 
            title="Help & Support" 
            type="link" 
          />
        </View>

        <Text style={styles.sectionHeader}>About</Text>
        <View style={styles.section}>
          <SettingItem 
            icon="information-outline" 
            title="About App" 
            type="link" 
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="file-document-outline" 
            title="Terms of Service" 
            type="link" 
          />
        </View>
        
        <Text style={styles.versionText}>Version 1.0.0 (Build 20260114)</Text>
      </ScrollView>
      <TeamSelectionModal 
        visible={teamModalVisible} 
        onClose={() => setTeamModalVisible(false)} 
        onSelect={handleSelectTeam}
        currentTeam={user?.favoriteTeam}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  content: {
    padding: SIZES.padding,
  },
  sectionHeader: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SIZES.base,
    marginTop: SIZES.base,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
    marginBottom: SIZES.padding,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  itemText: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    color: COLORS.text,
  },
  itemSubText: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    color: '#666',
  },
  teamLogo: {
    width: 24,
    height: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginLeft: 50, 
  },
  versionText: {
    textAlign: 'center',
    color: '#666',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    marginTop: SIZES.padding,
    marginBottom: 40,
  },
});

export default SettingsScreen;
