import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_FAMILY, SIZES, BORDER_RADIUS } from '@/constants/theme';

const NotificationsScreen = () => {
  const router = useRouter();
  
  // Dummy data
  const notifications = [
    {
      id: '1',
      title: 'Match Starting Soon',
      message: 'Manchester United vs Liverpool starts in 15 minutes!',
      time: '10m ago',
      read: false,
      type: 'match',
    },
    {
      id: '2',
      title: 'Goal Alert!',
      message: 'Haaland scores for Man City (1-0)',
      time: '1h ago',
      read: true,
      type: 'goal',
    },
    {
      id: '3',
      title: 'Full Time',
      message: 'Arsenal 2 - 1 Chelsea. What a comeback!',
      time: 'Yesterday',
      read: true,
      type: 'match',
    },
    {
      id: '4',
      title: 'Transfer News',
      message: 'Mbappe signs 5-year deal with Real Madrid.',
      time: '2d ago',
      read: true,
      type: 'news',
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      <View style={[styles.iconContainer, !item.read && styles.unreadIcon]}>
        <MaterialCommunityIcons 
          name={item.type === 'goal' ? 'soccer' : item.type === 'news' ? 'newspaper' : 'clock-outline'} 
          size={24} 
          color={item.read ? '#999' : COLORS.primary} 
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.topRow}>
          <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </View>
      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="bell-off-outline" size={64} color="#333" />
                <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
        }
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
  clearButton: {
    padding: SIZES.base,
  },
  clearButtonText: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    padding: SIZES.padding,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1A1A',
    marginBottom: SIZES.base,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: '#252525',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unreadIcon: {
    backgroundColor: 'rgba(58, 134, 255, 0.15)',
  },
  textContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: '#ccc',
  },
  unreadText: {
    color: COLORS.text,
  },
  time: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 12,
    color: '#666',
  },
  message: {
    fontFamily: FONT_FAMILY.primary,
    fontSize: 13,
    color: '#999',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#666',
    fontFamily: FONT_FAMILY.primary,
    fontSize: 16,
    marginTop: 16,
  }
});

export default NotificationsScreen;
