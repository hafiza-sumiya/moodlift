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

export function CommentRow({ comment, onBlock, onDelete, onApprove }) {
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    Alert.alert(
      comment.isBlocked ? "Unblock Comment?" : "Block Comment?",
      `Are you sure you want to ${comment.isBlocked ? "unblock" : "block"} this comment?`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: comment.isBlocked ? "Unblock" : "Block",
          onPress: async () => {
            try {
              setLoading(true);
              await onBlock(comment._id);
            } finally {
              setLoading(false);
            }
          },
          style: comment.isBlocked ? "default" : "destructive",
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Comment?",
      "Are you sure you want to permanently delete this comment?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await onDelete(comment._id);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await onApprove(comment._id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, SHADOWS.small]}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name={comment.anonymous ? "incognito" : "account"}
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.authorDetails}>
              <Text style={styles.author}>{comment.author || "Anonymous User"}</Text>
              {comment.user?.email && (
                <Text style={styles.email}>{comment.user.email}</Text>
              )}
            </View>
          </View>
          <View style={styles.badges}>
            {comment.isBlocked && (
              <View style={[styles.badge, { backgroundColor: COLORS.dangerLight }]}>
                <Text style={[styles.badgeText, { color: COLORS.danger }]}>BLOCKED</Text>
              </View>
            )}
            {!comment.isApproved && (
              <View style={[styles.badge, { backgroundColor: COLORS.warningLight }]}>
                <Text style={[styles.badgeText, { color: COLORS.warning }]}>PENDING</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.storyRef}>
            <MaterialCommunityIcons name="bookmark" size={12} color={COLORS.textMuted} /> On:{" "}
            <Text style={styles.storyTitle}>{comment.storyId?.title}</Text>
          </Text>
          <Text style={styles.commentText} numberOfLines={3}>
            {comment.text}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="heart" size={12} color={COLORS.danger} />
              <Text style={styles.statText}>{comment.likes}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <>
            {!comment.isApproved && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleApprove}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color={COLORS.success}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={handleBlock}>
              <MaterialCommunityIcons
                name={comment.isBlocked ? "lock-open-outline" : "lock-outline"}
                size={20}
                color={comment.isBlocked ? COLORS.success : COLORS.warning}
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  mainContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  authorDetails: {
    flex: 1,
  },
  author: {
    fontSize: FONT.sm,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badges: {
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
  contentSection: {
    marginBottom: SPACING.md,
  },
  storyRef: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  storyTitle: {
    fontWeight: WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  commentText: {
    fontSize: FONT.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  date: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
  },
  stats: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
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
