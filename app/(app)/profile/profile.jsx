import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || 'User Name');
  const [bio, setBio] = useState(user?.bio || 'Football enthusiast ⚽');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: name,
        bio: bio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          photoURL: result.assets[0].uri,
        });
        // Note: In a production app, you would upload the image to Firebase Storage first
      } catch (error) {
        console.error("Error updating avatar: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
          <Text style={styles.editButton}>{isEditing ? (loading ? 'Saving...' : 'Save') : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={isEditing ? handlePickImage : null} style={styles.avatarContainer}>
            <Image 
              source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
            {isEditing && (
              <View style={styles.editIconContainer}>
                <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={styles.label}>Name</Text>
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#666"
              />
              <Text style={styles.label}>Bio</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={bio} 
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor="#666"
                multiline
              />
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userBio}>{bio}</Text>
            </View>
          )}
        </View>

        {/* Stats / Info */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.favorites?.length || 0}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.wallet?.balance || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/settings/settings')}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(58, 134, 255, 0.1)' }]}>
                <MaterialCommunityIcons name="cog-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>Settings</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/notifications/notifications')}>
            <View style={styles.menuItemLeft}>
               <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 206, 86, 0.1)' }]}>
                <MaterialCommunityIcons name="bell-outline" size={22} color="#FFCE56" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
             <MaterialCommunityIcons name="chevron-right" size={22} color="#666" />
          </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem} onPress={logOut}>
            <View style={styles.menuItemLeft}>
               <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                <MaterialCommunityIcons name="logout" size={22} color={COLORS.error} />
              </View>
              <Text style={[styles.menuText, { color: COLORS.error }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  editButton: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    fontSize: 14,
    padding: SIZES.base,
  },
  content: {
    padding: SIZES.padding,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.padding,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  userBio: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: SIZES.padding,
  },
  editForm: {
    width: '100%',
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.medium,
    padding: 16,
    color: COLORS.text,
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.large,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  statLabel: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#333',
  },
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default ProfileScreen;
