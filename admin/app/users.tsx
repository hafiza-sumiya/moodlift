import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { adminService } from '../src/services/adminService';
import { COLORS, SPACING, RADIUS, FONT, WEIGHT, SHADOWS } from '@/styles/theme';

const COLORS_ADMIN = {
  primary: '#8E48BB',
  background: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  success: '#10B981',
  danger: '#EF4444',
};

export default function UsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filterOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Admins', value: 'admin' },
  ];

  const fetchUsers = async (pageNum = 1, searchQuery = '', statusVal = '') => {
    try {
      setLoading(pageNum === 1);
      const response = await adminService.getAllUsers(pageNum, 20, searchQuery, statusVal);
      if (response.success) {
        if (pageNum === 1) {
          setUsers(response.data.users || []);
        } else {
          setUsers((prev) => [...prev, ...(response.data.users || [])]);
        }
        setHasMore(response.data.pagination?.hasNext || false);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers(page, search, statusFilter);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(1, search, statusFilter);
    setRefreshing(false);
  };

  const handleBlockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await adminService.toggleBlockUser(userId);
      if (response.success) {
        Alert.alert('Success', 'User status updated');
        fetchUsers(1, search, statusFilter);
      } else {
        Alert.alert('Error', response.message || 'Failed to update user');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(userId);
            const response = await adminService.deleteUser(userId);
            if (response.success) {
              Alert.alert('Success', 'User deleted');
              fetchUsers(1, search, statusFilter);
            } else {
              Alert.alert('Error', response.message || 'Failed to delete user');
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete user');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={24} color={COLORS_ADMIN.primary} />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name || 'N/A'}</Text>
          <Text style={styles.userEmail}>{item.email || 'N/A'}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userStatus}>
              Status: <Text style={{ fontWeight: '600' }}>{item.isBlocked ? 'Blocked' : 'Active'}</Text>
            </Text>
            {item.isAdmin && <Text style={styles.adminBadge}>Admin</Text>}
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFF0F0' }]}
          onPress={() => handleBlockUser(item._id)}
          disabled={actionLoading === item._id}
        >
          {actionLoading === item._id ? (
            <ActivityIndicator size="small" color={COLORS_ADMIN.danger} />
          ) : (
            <MaterialCommunityIcons
              name={item.isBlocked ? 'lock-open' : 'lock'}
              size={18}
              color={COLORS_ADMIN.danger}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFE8E8', marginLeft: SPACING.sm }]}
          onPress={() => handleDeleteUser(item._id)}
          disabled={actionLoading === item._id}
        >
          {actionLoading === item._id ? (
            <ActivityIndicator size="small" color={COLORS_ADMIN.danger} />
          ) : (
            <MaterialCommunityIcons name="delete" size={18} color={COLORS_ADMIN.danger} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS_ADMIN.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users Management</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS_ADMIN.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={COLORS_ADMIN.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filterChips}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                statusFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={() => hasMore && fetchUsers(page + 1, search, statusFilter)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={48} color={COLORS_ADMIN.textSecondary} />
            <Text style={styles.emptyStateText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_ADMIN.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS_ADMIN.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  headerTitle: {
    fontSize: FONT.xl,
    fontWeight: '700',
    color: COLORS_ADMIN.text,
  },
  filtersSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT.sm,
    color: COLORS_ADMIN.text,
  },
  filterChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: '#F0F0F0',
  },
  filterChipActive: {
    backgroundColor: COLORS_ADMIN.primary,
  },
  filterChipText: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT.sm,
    fontWeight: '600',
    color: COLORS_ADMIN.text,
  },
  userEmail: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  userStatus: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
  },
  adminBadge: {
    fontSize: FONT.xs,
    color: '#FFFFFF',
    backgroundColor: COLORS_ADMIN.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
    fontWeight: '600',
    overflow: 'hidden',
  },
  userActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: SPACING.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: SPACING.md,
    fontSize: FONT.sm,
    color: COLORS_ADMIN.textSecondary,
  },
});
