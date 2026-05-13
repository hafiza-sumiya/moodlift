import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { storyService } from "../utils/storyService";
import { storage } from "../utils/storage";

const CONDITION_COLORS = {
  Anxiety: "#f59e0b",
  Depression: "#6366f1",
  Burnout: "#ef4444",
  Stress: "#f97316",
  "Sleep Issues": "#3b82f6",
  PTSD: "#8b5cf6",
  OCD: "#ec4899",
  "Panic Disorder": "#14b8a6",
  Other: "#6b7280",
};

export default function StoryCard({ story, onPress, horizontal = false }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(story.likes || 0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    checkIfLiked();
  }, [story._id]);

  const checkIfLiked = async () => {
    const isLiked = await storage.isStoryLiked(story._id);
    setLiked(isLiked);
  };

  const handleLike = async () => {
    if (liked || liking) return;
    setLiking(true);
    try {
      const response = await storyService.likeStory(story._id);
      if (response.success) {
        // Like endpoint returns { success, liked, likes } — no data wrapper
        setLikes(response.likes);
        setLiked(true);
        await storage.addLikedStory(story._id);
      }
    } catch (error) {
      console.error("Error liking story:", error);
    } finally {
      setLiking(false);
    }
  };

  const conditionColor = CONDITION_COLORS[story.condition] || "#8E48BB";
  const cardStyle = [styles.card, horizontal && styles.horizontalCard];
  const preview = story.story || story.content || "";

  return (
    <View style={cardStyle}>
      {/* Condition badge */}
      <View style={[styles.conditionBadge, { backgroundColor: conditionColor + "18" }]}>
        <View style={[styles.conditionDot, { backgroundColor: conditionColor }]} />
        <Text style={[styles.conditionText, { color: conditionColor }]}>
          {story.condition}
        </Text>
      </View>

      {/* Author */}
      <Text style={styles.userName}>
        {story.anonymous ? "Anonymous" : (story.userName || story.author || "User")}
      </Text>

      {/* Story preview */}
      <Text style={styles.preview} numberOfLines={3}>
        {preview}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.likeBtn, liked && styles.likedBtn]}
          onPress={handleLike}
          disabled={liked || liking}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={14}
            color={liked ? "#ef4444" : "#9ca3af"}
          />
          <Text style={[styles.likeText, liked && styles.likedText]}>
            {likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.readMoreBtn} onPress={onPress}>
          <Text style={styles.readMoreText}>Read Story</Text>
          <Ionicons name="arrow-forward" size={13} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#8E48BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  horizontalCard: {
    marginBottom: 0,
    marginRight: 14,
    width: 240,
  },
  conditionBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
    gap: 5,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  preview: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  likedBtn: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  likeText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
  },
  likedText: {
    color: "#ef4444",
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#8E48BB",
    borderRadius: 12,
  },
  readMoreText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
