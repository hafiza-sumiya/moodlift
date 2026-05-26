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

export default function CommentsScreen() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filterOptions = [
    { label: 'All', value: '' },
    { label: 'Approved', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' },
  ];

  const fetchComments = async (pageNum = 1, searchQuery = '', statusVal = '') => {
    try {
      setLoading(pageNum === 1);
      const response = await adminService.getAllComments(pageNum, 20, searchQuery, statusVal);
      if (response.success) {
        if (pageNum === 1) {
          setComments(response.data.comments || []);
        } else {
          setComments((prev) => [...prev, ...(response.data.comments || [])]);
        }
        setHasMore(response.data.pagination?.hasNext || false);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch comments');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch comments');
      console.error('Fetch comments error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchComments(1, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  useFocusEffect(
    React.useCallback(() => {
      fetchComments(page, search, statusFilter);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComments(1, search, statusFilter);
    setRefreshing(false);
  };

  const handleBlockComment = async (commentId: string) => {
    try {
      setActionLoading(commentId);
      const response = await adminService.toggleBlockComment(commentId);
      if (response.success) {
        Alert.alert('Success', 'Comment status updated');
        fetchComments(1, search, statusFilter);
      } else {
        Alert.alert('Error', response.message || 'Failed to update comment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update comment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      setActionLoading(commentId);
      const response = await adminService.toggleApproveComment(commentId);
      if (response.success) {
        Alert.alert('Success', 'Comment approved');
        fetchComments(1, search, statusFilter);
      } else {
        Alert.alert('Error', response.message || 'Failed to approve comment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve comment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(commentId);
            const response = await adminService.deleteComment(commentId);
            if (response.success) {
              Alert.alert('Success', 'Comment deleted');
              fetchComments(1, search, statusFilter);
            } else {
              Alert.alert('Error', response.message || 'Failed to delete comment');
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete comment');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS_ADMIN.success;
      case 'pending':
        return '#F59E0B';
      case 'blocked':
        return COLORS_ADMIN.danger;
      default:
        return COLORS_ADMIN.textSecondary;
    }
  };

  const renderCommentItem = ({ item }: { item: any }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={16} color={COLORS_ADMIN.primary} />
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author?.name || 'Anonymous'}</Text>
            <Text style={styles.commentDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {item.status || 'pending'}
          </Text>
        </View>
      </View>
      <Text style={styles.commentText} numberOfLines={3}>
        {item.text || 'No content'}
      </Text>
      <View style={styles.commentMeta}>
        <Text style={styles.metaText}>On: {item.story?.title || 'Unknown story'}</Text>
      </View>
      <View style={styles.commentActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]}
            onPress={() => handleApproveComment(item._id)}
            disabled={actionLoading === item._id}
          >
            {actionLoading === item._id ? (
              <ActivityIndicator size="small" color={COLORS_ADMIN.success} />
            ) : (
              <MaterialCommunityIcons name="check" size={18} color={COLORS_ADMIN.success} />
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FFF0F0', marginLeft: SPACING.sm }]}
          onPress={() => handleBlockComment(item._id)}
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
          onPress={() => handleDeleteComment(item._id)}
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

  if (loading && comments.length === 0) {
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
        <Text style={styles.headerTitle}>Comments Management</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS_ADMIN.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search comments..."
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

      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={() => hasMore && fetchComments(page + 1, search, statusFilter)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="comment-off"
              size={48}
              color={COLORS_ADMIN.textSecondary}
            />
            <Text style={styles.emptyStateText}>No comments found</Text>
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
  commentCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  authorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: FONT.sm,
    fontWeight: '600',
    color: COLORS_ADMIN.text,
  },
  commentDate: {
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
  commentText: {
    fontSize: FONT.sm,
    color: COLORS_ADMIN.text,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  commentMeta: {
    marginBottom: SPACING.md,
  },
  metaText: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
  },
  commentActions: {
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
