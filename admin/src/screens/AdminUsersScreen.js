/**
 * Admin User Management Screen
 * View, block/unblock, delete, and manage admin privileges for users
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
import { UserRow } from "../components/UserRow";
import { SearchBar, FilterChips, EmptyState } from "../components/CommonComponents";
import { COLORS, SPACING, RADIUS, FONT, WEIGHT, SHADOWS } from "@/styles/theme";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const filterOptions = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Blocked", value: "blocked" },
    { label: "Admins", value: "admin" },
  ];

  const fetchUsers = async (pageNum = 1, searchQuery = "", statusVal = "") => {
    try {
      setLoading(pageNum === 1);
      const response = await adminService.getAllUsers(pageNum, 20, searchQuery, statusVal);
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users");
      console.error(error);
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
      fetchUsers(1, search, statusFilter);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(page, search, statusFilter);
    setRefreshing(false);
  };

  const handleBlockUser = async (userId) => {
    try {
      setActionLoading(userId);
      await adminService.toggleBlockUser(userId);
      await fetchUsers(page, search, statusFilter);
      Alert.alert("Success", "User status updated");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to block user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setActionLoading(userId);
      await adminService.deleteUser(userId);
      await fetchUsers(page, search, statusFilter);
      Alert.alert("Success", "User deleted successfully");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      setActionLoading(userId);
      await adminService.makeUserAdmin(userId);
      await fetchUsers(page, search, statusFilter);
      Alert.alert("Success", "User promoted to admin");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to promote user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      setActionLoading(userId);
      await adminService.removeUserAdmin(userId);
      await fetchUsers(page, search, statusFilter);
      Alert.alert("Success", "Admin privileges removed");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to remove admin privileges");
    } finally {
      setActionLoading(null);
    }
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.pages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(nextPage, search, statusFilter);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchUsers(prevPage, search, statusFilter);
    }
  };

  const renderHeader = () => (
    <View>
      <SearchBar placeholder="Search users..." onSearch={setSearch} loading={loading} />
      <FilterChips
        options={filterOptions}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        loading={loading}
      />
      {pagination && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Total: {pagination.total} users | Page {pagination.page} of {pagination.pages}
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
        <Text style={[styles.paginationBtnText, page === 1 ? styles.paginationBtnTextDisabled : null]}>
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
        <Text style={[styles.paginationBtnText, page >= pagination?.pages ? styles.paginationBtnTextDisabled : null]}>
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
    <UserRow
      user={item}
      onBlock={handleBlockUser}
      onDelete={handleDeleteUser}
      onMakeAdmin={handleMakeAdmin}
      onRemoveAdmin={handleRemoveAdmin}
    />
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="account-off-outline"
            title="No users found"
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
