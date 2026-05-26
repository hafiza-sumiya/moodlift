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
import { adminService } from '@/services/adminService';
import { COLORS, SPACING, RADIUS, FONT, WEIGHT, SHADOWS } from '@/styles/theme';

const COLORS_ADMIN = {
  primary: '#8E48BB',
  background: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  danger: '#EF4444',
  warning: '#F59E0B',
};

const CONDITIONS = [
  'Anxiety',
  'Depression',
  'Burnout',
  'Stress',
  'Sleep Issues',
  'PTSD',
  'OCD',
  'Panic Disorder',
  'Other',
];

export default function StoriesScreen() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Published', value: 'published' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Flagged', value: 'flagged' },
  ];

  const fetchStories = async (pageNum = 1, searchQuery = '', statusVal = '', condVal = '') => {
    try {
      setLoading(pageNum === 1);
      const response = await adminService.getAllStories(
        pageNum,
        20,
        searchQuery,
        condVal,
        statusVal
      );
      if (response.success) {
        if (pageNum === 1) {
          setStories(response.data.stories || []);
        } else {
          setStories((prev) => [...prev, ...(response.data.stories || [])]);
        }
        setHasMore(response.data.pagination?.hasNext || false);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch stories');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch stories');
      console.error('Fetch stories error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchStories(1, search, statusFilter, conditionFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, conditionFilter]);

  useFocusEffect(
    React.useCallback(() => {
      fetchStories(page, search, statusFilter, conditionFilter);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStories(1, search, statusFilter, conditionFilter);
    setRefreshing(false);
  };

  const handleBlockStory = async (storyId: string) => {
    try {
      setActionLoading(storyId);
      const response = await adminService.toggleBlockStory(storyId);
      if (response.success) {
        Alert.alert('Success', 'Story status updated');
        fetchStories(1, search, statusFilter, conditionFilter);
      } else {
        Alert.alert('Error', response.message || 'Failed to update story');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update story');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    Alert.alert('Delete Story', 'Are you sure you want to delete this story?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(storyId);
            const response = await adminService.deleteStory(storyId);
            if (response.success) {
              Alert.alert('Success', 'Story deleted');
              fetchStories(1, search, statusFilter, conditionFilter);
            } else {
              Alert.alert('Error', response.message || 'Failed to delete story');
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete story');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#10B981';
      case 'blocked':
        return COLORS_ADMIN.danger;
      case 'flagged':
        return COLORS_ADMIN.warning;
      default:
        return COLORS_ADMIN.textSecondary;
    }
  };

  const renderStoryItem = ({ item }: { item: any }) => (
    <View style={styles.storyCard}>
      <View style={styles.storyHeader}>
        <View style={styles.storyTitleContainer}>
          <Text style={styles.storyTitle} numberOfLines={2}>
            {item.title || 'Untitled'}
          </Text>
          <Text style={styles.storyAuthor}>{item.author?.name || 'Anonymous'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {item.status || 'N/A'}
          </Text>
        </View>
      </View>
      <View style={styles.storyMeta}>
        <Text style={styles.metaText}>Condition: {item.condition || 'N/A'}</Text>
        <Text style={styles.metaText}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.storyActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFF0F0' }]}
          onPress={() => handleBlockStory(item._id)}
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
          onPress={() => handleDeleteStory(item._id)}
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

  if (loading && stories.length === 0) {
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
        <Text style={styles.headerTitle}>Stories Management</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS_ADMIN.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories..."
            placeholderTextColor={COLORS_ADMIN.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filterChips}>
          {statusOptions.map((filter) => (
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
        <View style={styles.conditionChips}>
          {CONDITIONS.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.filterChip,
                conditionFilter === condition && styles.filterChipActive,
              ]}
              onPress={() => setConditionFilter(condition === conditionFilter ? '' : condition)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  conditionFilter === condition && styles.filterChipTextActive,
                ]}
                numberOfLines={1}
              >
                {condition}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stories List */}
      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={() => hasMore && fetchStories(page + 1, search, statusFilter, conditionFilter)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="book-off" size={48} color={COLORS_ADMIN.textSecondary} />
            <Text style={styles.emptyStateText}>No stories found</Text>
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
    marginBottom: SPACING.sm,
  },
  conditionChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
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
  storyCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  storyTitleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  storyTitle: {
    fontSize: FONT.sm,
    fontWeight: '600',
    color: COLORS_ADMIN.text,
  },
  storyAuthor: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  statusBadgeText: {
    fontSize: FONT.xs,
    fontWeight: '600',
  },
  storyMeta: {
    marginBottom: SPACING.md,
  },
  metaText: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
    marginBottom: 2,
  },
  storyActions: {
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
