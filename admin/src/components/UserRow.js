/**
 * UserRow Component - Display user in a list with actions
 * Used in User Management Screen
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS, RADIUS, FONT, WEIGHT } from "@/styles/theme";

export function UserRow({ user, onBlock, onDelete, onMakeAdmin, onRemoveAdmin }) {
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    Alert.alert(
      user.isBlocked ? "Unblock User?" : "Block User?",
      `Are you sure you want to ${user.isBlocked ? "unblock" : "block"} ${user.name}?`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: user.isBlocked ? "Unblock" : "Block",
          onPress: async () => {
            try {
              setLoading(true);
              await onBlock(user._id);
            } finally {
              setLoading(false);
            }
          },
          style: user.isBlocked ? "default" : "destructive",
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete User?",
      `Are you sure you want to permanently delete ${user.name}? This will also delete all their stories and comments.`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await onDelete(user._id);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleMakeAdmin = async () => {
    Alert.alert(
      "Make Admin?",
      `Are you sure you want to give ${user.name} admin privileges?`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Make Admin",
          onPress: async () => {
            try {
              setLoading(true);
              await onMakeAdmin(user._id);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveAdmin = async () => {
    Alert.alert(
      "Remove Admin?",
      `Are you sure you want to remove admin privileges from ${user.name}?`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Remove Admin",
          onPress: async () => {
            try {
              setLoading(true);
              await onRemoveAdmin(user._id);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={[styles.container, SHADOWS.small]}>
      <View style={styles.mainContent}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name={user.isAdmin ? "shield-account" : "account"}
              size={28}
              color={user.isAdmin ? COLORS.warning : COLORS.primary}
            />
          </View>
          <View style={styles.details}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.badges}>
              {user.isAdmin && (
                <View style={[styles.badge, { backgroundColor: COLORS.warningLight }]}>
                  <Text style={[styles.badgeText, { color: COLORS.warning }]}>ADMIN</Text>
                </View>
              )}
              {user.isBlocked && (
                <View style={[styles.badge, { backgroundColor: COLORS.dangerLight }]}>
                  <Text style={[styles.badgeText, { color: COLORS.danger }]}>BLOCKED</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Stories</Text>
            <Text style={styles.statValue}>{user.stats?.stories || 0}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Comments</Text>
            <Text style={styles.statValue}>{user.stats?.comments || 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <>
            {!user.isAdmin && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleMakeAdmin}>
                <MaterialCommunityIcons
                  name="shield-plus-outline"
                  size={20}
                  color={COLORS.info}
                />
              </TouchableOpacity>
            )}

            {user.isAdmin && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleRemoveAdmin}>
                <MaterialCommunityIcons
                  name="shield-off-outline"
                  size={20}
                  color={COLORS.warning}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={handleBlock}>
              <MaterialCommunityIcons
                name={user.isBlocked ? "lock-open-outline" : "lock-outline"}
                size={20}
                color={user.isBlocked ? COLORS.success : COLORS.warning}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.dangerBtn]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: FONT.base,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: FONT.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    marginTop: SPACING.xs,
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: FONT.xs,
    fontWeight: WEIGHT.bold,
  },
  stats: {
    flexDirection: "row",
    gap: SPACING.lg,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: FONT.base,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  dangerBtn: {
    backgroundColor: COLORS.dangerLight,
  },
});
