/**
 * Admin Story Management Screen
 * View, block/unblock, delete, and manage story status
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { adminService } from "../services/adminService";
import { StoryRow } from "../components/StoryRow";
import { SearchBar, FilterChips, EmptyState } from "../components/CommonComponents";
import { COLORS, SPACING, RADIUS, FONT, WEIGHT, SHADOWS } from "@/styles/theme";

const CONDITIONS = [
  "Anxiety",
  "Depression",
  "Burnout",
  "Stress",
  "Sleep Issues",
  "PTSD",
  "OCD",
  "Panic Disorder",
  "Other",
];

export default function AdminStoriesScreen() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Published", value: "published" },
    { label: "Blocked", value: "blocked" },
    { label: "Flagged", value: "flagged" },
  ];

  const fetchStories = async (pageNum = 1, searchQuery = "", statusVal = "", condVal = "") => {
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
        setStories(response.data.stories);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch stories");
      console.error(error);
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
      fetchStories(1, search, statusFilter, conditionFilter);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStories(page, search, statusFilter, conditionFilter);
    setRefreshing(false);
  };

  const handleBlockStory = async (storyId) => {
    try {
      setActionLoading(storyId);
      await adminService.toggleBlockStory(storyId);
      await fetchStories(page, search, statusFilter, conditionFilter);
      Alert.alert("Success", "Story status updated");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to block story");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      setActionLoading(storyId);
      await adminService.deleteStory(storyId);
      await fetchStories(page, search, statusFilter, conditionFilter);
      Alert.alert("Success", "Story deleted successfully");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to delete story");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (storyId, newStatus) => {
    try {
      setActionLoading(storyId);
      await adminService.updateStoryStatus(storyId, newStatus);
      await fetchStories(page, search, statusFilter, conditionFilter);
      Alert.alert("Success", `Story status changed to ${newStatus}`);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update story status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.pages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStories(nextPage, search, statusFilter, conditionFilter);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchStories(prevPage, search, statusFilter, conditionFilter);
    }
  };

  const renderHeader = () => (
    <View>
      <SearchBar
        placeholder="Search stories by title or content..."
        onSearch={setSearch}
        loading={loading}
      />
      <FilterChips
        options={statusOptions}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        loading={loading}
      />
      <View style={styles.conditionFilter}>
        <MaterialCommunityIcons name="filter-variant" size={16} color={COLORS.textMuted} />
        <Text style={styles.filterLabel}>Condition:</Text>
        <TouchableOpacity
          style={[styles.conditionDropdown, conditionFilter && styles.conditionDropdownActive]}
          onPress={() => {}}
        >
          <Text style={styles.conditionDropdownText}>
            {conditionFilter || "All Conditions"}
          </Text>
        </TouchableOpacity>
      </View>
      {pagination && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Total: {pagination.total} stories | Page {pagination.page} of {pagination.pages}
          </Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationBtn, !page || page === 1 ? styles.paginationBtnDisabled : null]}
        onPress={handlePrevPage}
        disabled={page === 1 || loading}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={20}
          color={page === 1 ? COLORS.textMuted : COLORS.primary}
        />
        <Text
          style={[
            styles.paginationBtnText,
            page === 1 ? styles.paginationBtnTextDisabled : null,
          ]}
        >
          Previous
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paginationBtn,
          !pagination || page >= pagination.pages ? styles.paginationBtnDisabled : null,
        ]}
        onPress={handleNextPage}
        disabled={!pagination || page >= pagination.pages || loading}
      >
        <Text
          style={[
            styles.paginationBtnText,
            page >= pagination?.pages ? styles.paginationBtnTextDisabled : null,
          ]}
        >
          Next
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={page >= pagination?.pages ? COLORS.textMuted : COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <StoryRow
      story={item}
      onBlock={handleBlockStory}
      onDelete={handleDeleteStory}
      onStatusChange={handleStatusChange}
    />
  );

  if (loading && stories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="book-off-outline"
            title="No stories found"
            subtitle="Try adjusting your search or filters"
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgBase,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  conditionFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  filterLabel: {
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
    fontWeight: WEIGHT.medium,
  },
  conditionDropdown: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgMuted,
    borderRadius: RADIUS.md,
  },
  conditionDropdownActive: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  conditionDropdownText: {
    fontSize: FONT.sm,
    color: COLORS.textPrimary,
  },
  paginationInfo: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  paginationText: {
    fontSize: FONT.sm,
    color: COLORS.textPrimary,
    fontWeight: WEIGHT.medium,
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  paginationBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  paginationBtnDisabled: {
    backgroundColor: COLORS.bgMuted,
    opacity: 0.5,
  },
  paginationBtnText: {
    fontSize: FONT.base,
    fontWeight: WEIGHT.bold,
    color: COLORS.textInverse,
  },
  paginationBtnTextDisabled: {
    color: COLORS.textMuted,
  },
});
