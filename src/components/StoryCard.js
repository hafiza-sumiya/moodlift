import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storyService } from "../utils/storyService";
import { storage } from "../utils/storage";

export default function StoryCard({ story, onPress, onRequestPress, horizontal = false }) {
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
    if (liked || liking) return; // already liked or in-progress

    setLiking(true);
    try {
      const response = await storyService.likeStory(story._id);
      if (response.success) {
        setLikes(response.data.likes);
        setLiked(true);
        await storage.addLikedStory(story._id);
      }
    } catch (error) {
      console.error('Error liking story:', error);
    } finally {
      setLiking(false);
    }
  };
  const cardStyle = [
    styles.card,
    horizontal && styles.horizontalCard,
  ];

  return (
    <View style={cardStyle}>
      <View style={styles.header}>
        <Text style={styles.userName}>
          {story.anonymous ? "Anonymous" : story.userName}
        </Text>
        <Text style={styles.condition}>{story.condition}</Text>
      </View>
      <Text style={styles.preview} numberOfLines={3}>
        {story.story}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.likeBtn, liked && styles.likedBtn]}
          onPress={handleLike}
          disabled={liked || liking}
        >
          <MaterialCommunityIcons
            name={liked ? "heart" : "heart-outline"}
            size={16}
            color={liked ? "#ef4444" : "#6b7280"}
          />
          <Text style={[styles.likeText, liked && styles.likedText]}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.readMoreBtn} onPress={onPress}>
          <Text style={styles.readMoreText}>Read More</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.requestBtn} onPress={onRequestPress}>
          <Text style={styles.requestText}>Request Personal Chat</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalCard: {
    marginBottom: 0,
    marginRight: 12,
    width: 220,
  },
  header: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  condition: {
    fontSize: 13,
    color: "#8E48BB",
    marginTop: 2,
  },
  preview: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  likedBtn: {
    backgroundColor: "#fef2f2",
  },
  likeText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
    fontWeight: "600",
  },
  likedText: {
    color: "#ef4444",
  },
  readMoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#8E48BB",
    borderRadius: 10,
  },
  readMoreText: {
    color: "#fff",
    fontWeight: "700",
  },
  requestBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
  },
  requestText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 12,
  },
});
