import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Platform, StatusBar, Alert,
  ActivityIndicator, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { storyService, commentService } from "../utils/storyService";
import { storage } from "../utils/storage";
import CommentsList from "../components/CommentsList";
import { useProtectedAction } from "../hooks/useProtectedAction";

const CONDITION_COLORS = {
  Anxiety: "#f59e0b", Depression: "#6366f1", Burnout: "#ef4444",
  Stress: "#f97316", "Sleep Issues": "#3b82f6", PTSD: "#8b5cf6",
  OCD: "#ec4899", "Panic Disorder": "#14b8a6", Other: "#6b7280",
};

export default function StoryDetailsScreen({ route }) {
  const { story: initialStory } = route.params;
  const [story, setStory] = useState(initialStory);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const requireAuth = useProtectedAction();
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { _id, author }
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadDetails();
    storage.getUserName().then(n => setUserName(n || "User"));
    storage.getUserId().then(id => setUserId(id || ""));
  }, []);

  useEffect(() => {
    storage.isStoryLiked(story._id).then(setLiked);
  }, [story._id]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const [storyRes, commentsRes] = await Promise.all([
        storyService.getStoryDetail(initialStory._id),
        commentService.getComments(initialStory._id),
      ]);
      if (storyRes.success) setStory(storyRes.data);
      if (commentsRes.success) setComments(commentsRes.data.comments || []);
    } catch (e) {
      Alert.alert("Error", "Failed to load story");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    requireAuth(async () => {
      if (liked || liking) return;
      setLiking(true);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 30 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    try {
      const response = await storyService.likeStory(story._id);
      if (response.success) {
        setStory(prev => ({ ...prev, likes: response.likes }));
        setLiked(true);
        await storage.addLikedStory(story._id);
      }
    } catch (e) {
      console.error("Like error:", e);
      } finally {
        setLiking(false);
      }
    });
  };

  const addComment = () => {
    requireAuth(async () => {
      if (!commentText.trim()) return;
      setPosting(true);
    try {
      const response = await commentService.createComment(story._id, {
        author: isAnonymous ? "Anonymous User" : userName,
        text: commentText.trim(),
        anonymous: isAnonymous,
        parentId: replyingTo?._id || null,
      });
      if (response.success) {
        setComments(prev => [response.data, ...prev]);
        setCommentText("");
        setReplyingTo(null);
      }
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to post");
      } finally {
        setPosting(false);
      }
    });
  };

  // Called by CommentsList when user deletes their comment
  const handleDeleted = (commentId) => {
    setComments(prev => prev.filter(
      c => c._id !== commentId && c.parentId?.toString() !== commentId
    ));
  };

  // Called by CommentsList when user edits their comment
  const handleEdited = (commentId, newText) => {
    setComments(prev =>
      prev.map(c => c._id === commentId ? { ...c, text: newText, edited: true } : c)
    );
  };

  const conditionColor = CONDITION_COLORS[story.condition] || "#8E48BB";
  const storyContent = story.story || story.content || "";
  const authorLabel = story.anonymous
    ? "Anonymous"
    : (story.user?.name || story.author || "User");

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#8E48BB" />
          <Text style={styles.loadingText}>Loading story…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={[styles.conditionPill, { backgroundColor: conditionColor + "30" }]}>
              <View style={[styles.conditionDot, { backgroundColor: conditionColor }]} />
              <Text style={[styles.conditionLabel, { color: conditionColor }]}>{story.condition}</Text>
            </View>
            <View style={styles.viewsBadge}>
              <Ionicons name="eye-outline" size={12} color="#ffffffff" />
              <Text style={styles.viewsText}>{story.views || 0}</Text>
            </View>
          </View>
          <Text style={styles.headerAuthor}>By {authorLabel}</Text>
        </View>

        {/* Story card */}
        <View style={styles.storyCard}>
          <Text style={styles.storyTitle}>{story.title}</Text>
          <Text style={storyContent ? styles.storyBody : styles.storyBodyMuted}>
            {storyContent || "Story content not available."}
          </Text>

          {/* Like button */}
          <TouchableOpacity
            style={[styles.likeRow, liked && styles.likeRowActive]}
            onPress={handleLike}
            disabled={liked || liking}
            activeOpacity={0.85}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#ef4444" : "#9ca3af"} />
            </Animated.View>
            <Text style={[styles.likeRowText, liked && styles.likeRowTextActive]}>
              {liked ? `${story.likes} people found this helpful` : `${story.likes} — Tap to show support`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments section */}
        <View style={styles.commentsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={18} color="#8E48BB" />
            <Text style={styles.sectionTitle}>Comments{comments.length > 0 ? ` (${comments.length})` : ""}</Text>
          </View>

          {/* Composer */}
          <View style={styles.composer}>
            {/* Reply banner */}
            {replyingTo && (
              <View style={styles.replyBanner}>
                <Ionicons name="return-down-forward-outline" size={14} color="#8E48BB" />
                <Text style={styles.replyBannerText} numberOfLines={1}>
                  Replying to <Text style={{ fontWeight: "700" }}>{replyingTo.anonymous ? "Anonymous" : replyingTo.author}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close-circle" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            )}

            {/* Anonymous / Show Name toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.togglePill, isAnonymous && styles.togglePillActive]}
                onPress={() => setIsAnonymous(true)}
              >
                <Ionicons name="eye-off-outline" size={12} color={isAnonymous ? "#8E48BB" : "#9ca3af"} />
                <Text style={[styles.toggleText, isAnonymous && styles.toggleTextActive]}>Anonymous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.togglePill, !isAnonymous && styles.togglePillActive]}
                onPress={() => setIsAnonymous(false)}
              >
                <Ionicons name="person-outline" size={12} color={!isAnonymous ? "#8E48BB" : "#9ca3af"} />
                <Text style={[styles.toggleText, !isAnonymous && styles.toggleTextActive]}>Show Name</Text>
              </TouchableOpacity>

              {/* Show real name badge (no input field) */}
              {!isAnonymous && (
                <View style={styles.nameBadge}>
                  <Text style={styles.nameBadgeText} numberOfLines={1}>as {userName}</Text>
                </View>
              )}
            </View>

            {/* Textarea + inline send */}
            <View style={styles.inputBubble}>
              <TextInput
                style={styles.textarea}
                placeholder={replyingTo ? "Write a reply…" : "Share your thoughts…"}
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                editable={!posting}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!commentText.trim() || posting) && styles.sendBtnDisabled]}
                onPress={addComment}
                disabled={!commentText.trim() || posting}
              >
                {posting ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments list */}
          <CommentsList
            comments={comments}
            currentUserId={userId}
            storyId={story._id}
            onDeleted={handleDeleted}
            onEdited={handleEdited}
            onReply={(comment) => setReplyingTo(comment)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#8E48BB" },
  scroll: { flex: 1, backgroundColor: "#f5f3ff" },
  scrollContent: { paddingBottom: 40 },
  loadingWrap: { flex: 1, backgroundColor: "#f5f3ff", justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#8E48BB", fontSize: 14, fontWeight: "600" },
  header: { backgroundColor: "#8E48BB", paddingHorizontal: 20, paddingBottom: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  conditionPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  conditionDot: { width: 7, height: 7, borderRadius: 4 },
  conditionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  viewsBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewsText: { color: "#e9d5ff", fontSize: 12, fontWeight: "600" },
  headerAuthor: { color: "#ffffffff", fontSize: 12, fontWeight: "500" },
  storyCard: {
    backgroundColor: "#fff", marginHorizontal: 16, marginTop: -16,
    borderRadius: 24, padding: 22,
    shadowColor: "#8E48BB", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8, marginBottom: 16,
  },
  storyTitle: { fontSize: 22, fontWeight: "800", color: "#111827", letterSpacing: -0.3, marginBottom: 14, lineHeight: 30 },
  storyBody: { fontSize: 15, lineHeight: 26, color: "#374151", marginBottom: 20 },
  storyBodyMuted: { fontSize: 14, color: "#9ca3af", fontStyle: "italic", marginBottom: 20 },
  likeRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#f9fafb", borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: "#e5e7eb",
  },
  likeRowActive: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  likeRowText: { fontSize: 13, color: "#9ca3af", fontWeight: "600", flex: 1 },
  likeRowTextActive: { color: "#ef4444" },
  commentsCard: {
    backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 24,
    padding: 20, shadowColor: "#8E48BB", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  composer: { gap: 10, marginBottom: 20, backgroundColor: "#f9fafb", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#f3f4f6" },
  replyBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f5f3ff", borderRadius: 10, padding: 8 },
  replyBannerText: { flex: 1, fontSize: 12, color: "#8E48BB" },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  togglePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: "#e5e7eb", backgroundColor: "#fff" },
  togglePillActive: { borderColor: "#8E48BB", backgroundColor: "#f5f3ff" },
  toggleText: { fontSize: 12, fontWeight: "600", color: "#9ca3af" },
  toggleTextActive: { color: "#8E48BB" },
  nameBadge: { flex: 1, backgroundColor: "#f5f3ff", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  nameBadgeText: { fontSize: 12, color: "#8E48BB", fontWeight: "700" },
  inputBubble: { flexDirection: "row", alignItems: "flex-end", backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", paddingLeft: 14, paddingRight: 8, paddingVertical: 8, gap: 8 },
  textarea: { flex: 1, fontSize: 14, color: "#111827", minHeight: 44, maxHeight: 120, paddingVertical: 4, lineHeight: 22 },
  sendBtn: { backgroundColor: "#8E48BB", borderRadius: 12, padding: 10, justifyContent: "center", alignItems: "center", marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: "#d1d5db" },
});
