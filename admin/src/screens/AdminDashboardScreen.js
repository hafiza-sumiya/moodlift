/**
 * Admin Dashboard Screen
 * Overview of all admin statistics and recent activity
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { adminService } from "../services/adminService";
import { StatCard } from "../components/StatCard";
import { COLORS, SPACING, RADIUS, FONT, WEIGHT, SHADOWS } from "@/styles/theme";

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching dashboard stats...");
      const response = await adminService.getDashboardStats();
      if (response.success) {
        console.log("✅ Dashboard stats loaded successfully");
        setStats(response.data);
      } else {
        throw new Error(response.message || "Failed to load stats");
      }
    } catch (error) {
      console.error("❌ Dashboard Error:", error.message);
      Alert.alert(
        "Error",
        `Failed to fetch dashboard statistics\n\nDetails: ${error.message}\n\nMake sure the backend server is running on http://localhost:5000`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Welcome Back!</Text>
          <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="shield-account" size={40} color={COLORS.primary} />
        </View>
      </View>

      {/* User Statistics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Users</Text>
        </View>
        <TouchableOpacity
          style={styles.statGrid}
          onPress={() => navigation.navigate("Users")}
          activeOpacity={0.7}
        >
          <StatCard
            icon="account"
            label="Total Users"
            value={stats?.users?.total || 0}
            iconColor={COLORS.primary}
            bgColor={COLORS.primarySoft}
          />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statHalf}>
            <StatCard
              icon="check-circle"
              label="Active"
              value={stats?.users?.active || 0}
              iconColor={COLORS.success}
              bgColor={COLORS.successLight}
            />
          </View>
          <View style={styles.statHalf}>
            <StatCard
              icon="lock"
              label="Blocked"
              value={stats?.users?.blocked || 0}
              iconColor={COLORS.danger}
              bgColor={COLORS.dangerLight}
            />
          </View>
        </View>

        <StatCard
          icon="shield-account"
          label="Admin Users"
          value={stats?.users?.admins || 0}
          iconColor={COLORS.warning}
          bgColor={COLORS.warningLight}
        />
      </View>

      {/* Story Statistics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="book-open" size={20} color={COLORS.info} />
          <Text style={styles.sectionTitle}>Stories</Text>
        </View>
        <TouchableOpacity
          style={styles.statGrid}
          onPress={() => navigation.navigate("Stories")}
          activeOpacity={0.7}
        >
          <StatCard
            icon="book-multiple"
            label="Total Stories"
            value={stats?.stories?.total || 0}
            iconColor={COLORS.info}
            bgColor={COLORS.infoLight}
          />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statHalf}>
            <StatCard
              icon="check-circle"
              label="Published"
              value={stats?.stories?.active || 0}
              iconColor={COLORS.success}
              bgColor={COLORS.successLight}
            />
          </View>
          <View style={styles.statHalf}>
            <StatCard
              icon="lock"
              label="Blocked"
              value={stats?.stories?.blocked || 0}
              iconColor={COLORS.danger}
              bgColor={COLORS.dangerLight}
            />
          </View>
        </View>

        <StatCard
          icon="flag"
          label="Flagged"
          value={stats?.stories?.flagged || 0}
          iconColor={COLORS.warning}
          bgColor={COLORS.warningLight}
        />
      </View>

      {/* Comment Statistics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="comment-multiple" size={20} color={COLORS.success} />
          <Text style={styles.sectionTitle}>Comments</Text>
        </View>
        <TouchableOpacity
          style={styles.statGrid}
          onPress={() => navigation.navigate("Comments")}
          activeOpacity={0.7}
        >
          <StatCard
            icon="comment-multiple"
            label="Total Comments"
            value={stats?.comments?.total || 0}
            iconColor={COLORS.success}
            bgColor={COLORS.successLight}
          />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statHalf}>
            <StatCard
              icon="check-circle"
              label="Approved"
              value={stats?.comments?.active || 0}
              iconColor={COLORS.success}
              bgColor={COLORS.successLight}
            />
          </View>
          <View style={styles.statHalf}>
            <StatCard
              icon="lock"
              label="Blocked"
              value={stats?.comments?.blocked || 0}
              iconColor={COLORS.danger}
              bgColor={COLORS.dangerLight}
            />
          </View>
        </View>

        <StatCard
          icon="clock-outline"
          label="Pending Approval"
          value={stats?.comments?.pending || 0}
          iconColor={COLORS.warning}
          bgColor={COLORS.warningLight}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.warning} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionCard, SHADOWS.medium]}
          onPress={() => navigation.navigate("Users")}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons name="account-multiple" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Users</Text>
            <Text style={styles.actionSubtitle}>Block, delete, or promote users</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, SHADOWS.medium]}
          onPress={() => navigation.navigate("Stories")}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons name="book-open" size={24} color={COLORS.info} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Stories</Text>
            <Text style={styles.actionSubtitle}>Review, block, or delete stories</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, SHADOWS.medium]}
          onPress={() => navigation.navigate("Comments")}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons name="comment-check" size={24} color={COLORS.success} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Comments</Text>
            <Text style={styles.actionSubtitle}>Approve, block, or delete comments</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      {stats?.recentActivity && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {stats.recentActivity.users?.length > 0 && (
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>New Users</Text>
              {stats.recentActivity.users.slice(0, 3).map((user, idx) => (
                <View key={idx} style={styles.activityItem}>
                  <MaterialCommunityIcons name="account" size={16} color={COLORS.primary} />
                  <Text style={styles.activityText}>{user.name}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {stats.recentActivity.stories?.length > 0 && (
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>New Stories</Text>
              {stats.recentActivity.stories.slice(0, 3).map((story, idx) => (
                <View key={idx} style={styles.activityItem}>
                  <MaterialCommunityIcons name="book" size={16} color={COLORS.info} />
                  <Text style={styles.activityText} numberOfLines={1}>
                    {story.title}
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(story.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.spacing} />
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT.xl,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statGrid: {
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statHalf: {
    flex: 1,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT.base,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  actionSubtitle: {
    fontSize: FONT.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  activityCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  activityTitle: {
    fontSize: FONT.base,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  activityText: {
    flex: 1,
    fontSize: FONT.sm,
    color: COLORS.textPrimary,
  },
  activityDate: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
  },
  spacing: {
    height: SPACING.xl,
  },
});
