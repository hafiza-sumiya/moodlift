import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { commentService } from "../utils/storyService";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name) {
  if (!name || name === "Anonymous" || name === "Anonymous User") return "?";
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ["#8E48BB","#6366f1","#f59e0b","#10b981","#3b82f6","#ef4444","#ec4899","#14b8a6"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CommentsList({ comments = [], currentUserId, storyId, onDeleted, onEdited, onReply }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  // Group: top-level vs replies
  const topLevel = comments.filter(c => !c.parentId);
  const repliesMap = {};
  comments.filter(c => c.parentId).forEach(r => {
    const key = r.parentId?.toString?.() || String(r.parentId);
    if (!repliesMap[key]) repliesMap[key] = [];
    repliesMap[key].push(r);
  });

  // ── Actions ──────────────────────────────────────────────────────────────────
  const openMenu = (comment) => {
    Alert.alert("Comment", undefined, [
      {
        text: "Edit",
        onPress: () => { setEditingId(comment._id); setEditText(comment.text); },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          Alert.alert("Delete comment?", "This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete", style: "destructive",
              onPress: async () => {
                try {
                  await commentService.deleteComment(storyId, comment._id);
                  onDeleted(comment._id);
                } catch {
                  Alert.alert("Error", "Could not delete comment.");
                }
              },
            },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const saveEdit = async (commentId) => {
    if (!editText.trim() || editText.trim().length < 2) return;
    setSaving(true);
    try {
      const res = await commentService.updateComment(storyId, commentId, editText.trim());
      if (res.success) {
        onEdited(commentId, editText.trim());
        setEditingId(null);
      }
    } catch {
      Alert.alert("Error", "Could not update comment.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render one comment card ───────────────────────────────────────────────────
  const renderComment = (comment, isReply = false) => {
    const isOwn = !!(currentUserId && comment.user?.toString() === currentUserId);
    const displayName = comment.anonymous ? "Anonymous" : (comment.author || "User");
    const initials = comment.anonymous ? "?" : getInitials(displayName);
    const color = comment.anonymous ? "#9ca3af" : avatarColor(displayName);
    const isEditing = editingId === comment._id;
    const nested = !isReply ? (repliesMap[comment._id?.toString()] || []) : [];

    return (
      <View key={comment._id} style={isReply ? styles.replyOuter : styles.commentOuter}>
        {/* Indent line for replies */}
        {isReply && <View style={styles.indentLine} />}

        <View style={[styles.card, isReply && styles.replyCard]}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: color + "22", borderColor: color + "55" }]}>
              <Text style={[styles.avatarText, { color }]}>{initials}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.authorName}>{displayName}</Text>
              <View style={styles.metaRow}>
                {comment.createdAt ? <Text style={styles.timeText}>{timeAgo(comment.createdAt)}</Text> : null}
                {comment.edited ? <Text style={styles.editedTag}> · edited</Text> : null}
              </View>
            </View>
            {/* Three dots — only own comments */}
            {isOwn && (
              <TouchableOpacity style={styles.dotsBtn} onPress={() => openMenu(comment)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.dotsIcon}>⋯</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Body — edit mode or read mode */}
          {isEditing ? (
            <View style={styles.editWrap}>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingId(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={() => saveEdit(comment._id)}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.bodyText}>{comment.text}</Text>
          )}

          {/* Reply button — top-level only */}
          {!isReply && (
            <TouchableOpacity style={styles.replyBtn} onPress={() => onReply(comment)}>
              <Ionicons name="return-down-forward-outline" size={12} color="#8E48BB" />
              <Text style={styles.replyBtnText}>Reply</Text>
              {nested.length > 0 && (
                <Text style={styles.replyCount}>{nested.length}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Nested replies */}
        {nested.length > 0 && (
          <View style={styles.repliesWrap}>
            {nested.map(r => renderComment(r, true))}
          </View>
        )}
      </View>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (comments.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>No comments yet</Text>
        <Text style={styles.emptySubtitle}>Be the first to share your thoughts!</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {topLevel.map(c => renderComment(c, false))}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  list: { gap: 12 },

  commentOuter: { gap: 8 },
  replyOuter: { flexDirection: "row", marginLeft: 16, marginTop: 8 },
  indentLine: { width: 2, backgroundColor: "#e9d5ff", borderRadius: 2, marginRight: 10, marginTop: 4 },
  repliesWrap: { gap: 4 },

  card: {
    backgroundColor: "#f9fafb", borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: "#f3f4f6",
  },
  replyCard: { backgroundColor: "#faf5ff", borderColor: "#e9d5ff", flex: 1 },

  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "800" },
  metaCol: { flex: 1 },
  authorName: { fontSize: 13, fontWeight: "700", color: "#111827" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 1 },
  timeText: { fontSize: 11, color: "#9ca3af" },
  editedTag: { fontSize: 11, color: "#9ca3af", fontStyle: "italic" },

  dotsBtn: { padding: 4 },
  dotsIcon: { fontSize: 20, color: "#9ca3af", letterSpacing: 1 },

  bodyText: { fontSize: 14, color: "#374151", lineHeight: 22 },

  editWrap: { gap: 8 },
  editInput: {
    backgroundColor: "#fff", borderRadius: 10, padding: 10,
    fontSize: 14, color: "#111827", borderWidth: 1, borderColor: "#8E48BB",
    minHeight: 60, textAlignVertical: "top",
  },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  cancelBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb" },
  cancelBtnText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  saveBtn: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#8E48BB" },
  saveBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },

  replyBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginTop: 10, alignSelf: "flex-start",
    paddingVertical: 4, paddingHorizontal: 10,
    backgroundColor: "#f5f3ff", borderRadius: 20,
  },
  replyBtnText: { fontSize: 12, color: "#8E48BB", fontWeight: "600" },
  replyCount: {
    fontSize: 11, color: "#fff", fontWeight: "700",
    backgroundColor: "#8E48BB", borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1, overflow: "hidden",
  },

  empty: { paddingVertical: 28, alignItems: "center", gap: 4 },
  emptyIcon: { fontSize: 28, marginBottom: 6 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#9ca3af" },
});
