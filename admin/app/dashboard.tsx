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
import { adminService } from "../src/services/adminService";
import { StatCard } from "../src/components/StatCard";
import { COLORS, SPACING, RADIUS, FONT, WEIGHT, SHADOWS } from "@/styles/theme";
import { useAuth } from "@/context/auth-context";

const COLORS_ADMIN = {
  primary: "#8E48BB",
  background: "#FFFFFF",
  text: "#333333",
  textSecondary: "#666666",
};

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout } = useAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to fetch dashboard statistics",
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to fetch dashboard statistics",
      );
      console.error("Dashboard fetch error:", error);
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
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS_ADMIN.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Welcome Back!</Text>
          <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.logoutButtonHeader}
            onPress={async () => {
              try {
                await logout();
              } catch (e) {
                console.warn("Logout failed:", e);
              }
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={20} color={COLORS_ADMIN.primary} />
            <Text style={styles.logoutTextHeader}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Overview</Text>

        {stats && (
          <View style={styles.statsGrid}>
            <StatCard
              icon="account-multiple"
              subtitle="Total User's"
              label="Total Users"
              value={stats.totalUsers || 0}
              iconColor={COLORS_ADMIN.primary}
            />
            <StatCard
              icon="book"
              subtitle="User's Stories"
              label="Total Stories"
              value={stats.totalStories || 0}
              iconColor="#10B981"
            />
            <StatCard
              icon="comment-multiple"
              subtitle="Total Comments"
              label="Total Comments"
              value={stats.totalComments || 0}
              iconColor="#F59E0B"
            />
            <StatCard
              icon="alert-circle"
              subtitle="Flagged Stories"
              label="Flagged Stories"
              value={stats.flaggedStories || 0}
              iconColor="#EF4444"
            />
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <View style={styles.activityList}>
            {stats.recentActivity.map((activity: any, index: number) => (
              <View key={index} style={styles.activityItem}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color={COLORS_ADMIN.primary}
                />
                <Text style={styles.activityText}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.timestamp}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="inbox"
              size={40}
              color={COLORS_ADMIN.textSecondary}
            />
            <Text style={styles.emptyStateText}>No recent activity</Text>
          </View>
        )}
      </View>

      {/* System Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.statusLabel}>Database: Connected</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.statusLabel}>API: Online</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.statusLabel}>Services: Operational</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_ADMIN.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS_ADMIN.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  headerTitle: {
    fontSize: FONT.xl,
    fontWeight: "700",
    color: COLORS_ADMIN.text,
  },
  headerSubtitle: {
    fontSize: FONT.sm,
    color: COLORS_ADMIN.textSecondary,
    marginTop: 4,
  },
  headerIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#F0E6FF",
    borderRadius: RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButtonHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0E6FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
  },
  logoutTextHeader: {
    color: COLORS_ADMIN.primary,
    fontSize: FONT.sm,
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: "600",
    color: COLORS_ADMIN.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    gap: SPACING.md,
  },
  activityList: {
    backgroundColor: "#F8F8F8",
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  activityText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: FONT.sm,
    color: COLORS_ADMIN.text,
  },
  activityTime: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
  },
  emptyState: {
    paddingVertical: SPACING.xxl,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: RADIUS.md,
  },
  emptyStateText: {
    marginTop: SPACING.md,
    fontSize: FONT.sm,
    color: COLORS_ADMIN.textSecondary,
  },
  statusCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.md,
  },
  statusLabel: {
    fontSize: FONT.sm,
    color: COLORS_ADMIN.text,
  },
});
