/**
 * StoryRow Component - Display story in a list with actions
 * Used in Story Management Screen
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

export function StoryRow({ story, onBlock, onDelete, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleBlock = async () => {
    Alert.alert(
      story.isBlocked ? "Unblock Story?" : "Block Story?",
      `Are you sure you want to ${story.isBlocked ? "unblock" : "block"} this story?`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: story.isBlocked ? "Unblock" : "Block",
          onPress: async () => {
            try {
              setLoading(true);
              await onBlock(story._id);
            } finally {
              setLoading(false);
            }
          },
          style: story.isBlocked ? "default" : "destructive",
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Story?",
      "Are you sure you want to permanently delete this story and all its comments?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await onDelete(story._id);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false);
    try {
      setLoading(true);
      await onStatusChange(story._id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      Anxiety: COLORS.danger,
      Depression: COLORS.info,
      Burnout: COLORS.warning,
      Stress: COLORS.warning,
      "Sleep Issues": COLORS.info,
      PTSD: COLORS.danger,
      OCD: COLORS.warning,
      "Panic Disorder": COLORS.danger,
      Other: COLORS.textMuted,
    };
    return colors[condition] || COLORS.primary;
  };

  const getStatusColor = (status) => {
    const colors = {
      published: COLORS.success,
      draft: COLORS.textMuted,
      flagged: COLORS.danger,
    };
    return colors[status] || COLORS.primary;
  };

  return (
    <View style={[styles.container, SHADOWS.small]}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {story.title}
          </Text>
          <View style={styles.headerBadges}>
            {story.isBlocked && (
              <View style={[styles.badge, { backgroundColor: COLORS.dangerLight }]}>
                <Text style={[styles.badgeText, { color: COLORS.danger }]}>BLOCKED</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{story.user?.name || "Unknown"}</Text>
          </View>

          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="tag" size={14} color={COLORS.textMuted} />
            <Text
              style={[styles.metaText, { color: getConditionColor(story.condition) }]}
            >
              {story.condition}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="message-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{story.stats?.commentsCount || 0} comments</Text>
          </View>
        </View>

        <View style={styles.statusBar}>
          <Text style={[styles.statusBadge, { color: getStatusColor(story.status) }]}>
            {story.status.toUpperCase()}
          </Text>
          <Text style={styles.date}>
            {new Date(story.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setShowStatusMenu(!showStatusMenu)}
            >
              <MaterialCommunityIcons
                name="checkbox-marked-circle-outline"
                size={20}
                color={COLORS.info}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleBlock}>
              <MaterialCommunityIcons
                name={story.isBlocked ? "lock-open-outline" : "lock-outline"}
                size={20}
                color={story.isBlocked ? COLORS.success : COLORS.warning}
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

      {showStatusMenu && (
        <View style={styles.statusMenu}>
          {["published", "draft", "flagged"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusOption,
                story.status === status && styles.statusOptionActive,
              ]}
              onPress={() => handleStatusChange(status)}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  story.status === status && styles.statusOptionTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  mainContent: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONT.base,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  headerBadges: {
    flexDirection: "row",
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
  metadata: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusBadge: {
    fontSize: FONT.xs,
    fontWeight: WEIGHT.bold,
  },
  date: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.sm,
    justifyContent: "flex-end",
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
  statusMenu: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    gap: SPACING.sm,
  },
  statusOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgMuted,
    alignItems: "center",
  },
  statusOptionActive: {
    backgroundColor: COLORS.primary,
  },
  statusOptionText: {
    fontSize: FONT.xs,
    fontWeight: WEIGHT.medium,
    color: COLORS.textPrimary,
  },
  statusOptionTextActive: {
    color: COLORS.textInverse,
  },
});
