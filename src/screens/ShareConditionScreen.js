import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { storyService } from "../utils/storyService";
import typography from "../styles/typography";

const CONDITIONS = [
  "Anxiety",
  "Depression",
  "Burnout",
  "Stress",
  "Sleep Issues",
  "PTSD",
  "OCD",
  "Panic Disorder",
  "Other",
];

export default function ShareConditionScreen() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Anxiety");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setFetchingPosts(true);
      const response = await storyService.getStories({ limit: 20 });
      
      if (response && response.success && response.data && Array.isArray(response.data.stories)) {
        const storiesArray = response.data.stories;
        setPosts(storiesArray);
      } else {
        console.warn("Invalid response structure:", { success: response?.success, hasData: !!response?.data, isArray: Array.isArray(response?.data?.stories) });
        setPosts([]);
      }
    } catch (error) {
      console.error("Error loading stories:", error);
      setPosts([]);
    } finally {
      setFetchingPosts(false);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await storyService.createStory({
        title: title.trim(),
        condition,
        story: description.trim(),
        anonymous: isAnonymous,
      });

      if (response.success) {
        Alert.alert("Success", "Your story has been posted!");
        setTitle("");
        setDescription("");
        setCondition("Anxiety");
        setIsAnonymous(true);
        // Reload stories
        await loadStories();
      }
    } catch (error) {
      console.error("Error posting story:", error);
      Alert.alert("Error", error.message || "Failed to post story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.formCard}>
          <Text style={typography.heading}>Open Post</Text>
          <TextInput
            style={styles.input}
            placeholder="Title (condition name)"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />

          <Text style={styles.subLabel}>Condition Type</Text>
          <View style={styles.conditionRow}>
            {CONDITIONS.slice(0, 3).map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.conditionButton,
                  condition === cond && styles.conditionButtonActive,
                ]}
                onPress={() => setCondition(cond)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.conditionButtonText,
                    condition === cond && styles.conditionButtonTextActive,
                  ]}
                >
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.conditionRow}>
            {CONDITIONS.slice(3, 6).map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.conditionButton,
                  condition === cond && styles.conditionButtonActive,
                ]}
                onPress={() => setCondition(cond)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.conditionButtonText,
                    condition === cond && styles.conditionButtonTextActive,
                  ]}
                >
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your story..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            editable={!loading}
          />

          <View style={styles.anonymousToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isAnonymous && styles.toggleButtonActive,
              ]}
              onPress={() => setIsAnonymous(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.toggleText,
                  isAnonymous && styles.toggleTextActive,
                ]}
              >
                Anonymous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isAnonymous && styles.toggleButtonActive,
              ]}
              onPress={() => setIsAnonymous(false)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isAnonymous && styles.toggleTextActive,
                ]}
              >
                Show Name
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.postBtn, loading && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post Story</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.feed}>
          <Text style={typography.heading}>Public Feed</Text>
          {fetchingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8E48BB" />
            </View>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <View key={post._id} style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <View style={styles.feedHeaderLeft}>
                    <Text style={styles.feedTitle} numberOfLines={1}>
                      {post.title}
                    </Text>
                    <Text style={styles.feedCondition}>{post.condition}</Text>
                  </View>
                </View>
                <Text style={styles.feedAuthor}>
                  {post.anonymous ? "Anonymous" : post.author}
                </Text>
                <Text style={styles.feedDesc} numberOfLines={3}>
                  {post.story}
                </Text>
                <View style={styles.feedMeta}>
                  <Text style={styles.feedMint}>❤️ {post.likes} likes</Text>
                  <Text style={styles.feedMint}>👁️ {post.views} views</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No stories yet. Be the first to share!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#8E48BB",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: "#8E48BB",
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
    marginBottom: 24,
  },
  headerText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    color: "#111827",
    marginBottom: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 130,
    textAlignVertical: 'top',
  },
  subLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  emojiOption: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  emojiOptionSelected: {
    borderColor: "#8E48BB",
    backgroundColor: "#eef2ff",
  },
  emojiText: {
    fontSize: 20,
  },
  postBtn: {
    backgroundColor: "#8E48BB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  postBtnDisabled: {
    opacity: 0.6,
  },
  postBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  conditionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  conditionButtonActive: {
    borderColor: "#8E48BB",
    backgroundColor: "#eef2ff",
  },
  conditionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  conditionButtonTextActive: {
    color: "#8E48BB",
  },
  anonymousToggle: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  toggleButtonActive: {
    borderColor: "#8E48BB",
    backgroundColor: "#eef2ff",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  toggleTextActive: {
    color: "#8E48BB",
  },
  feed: {
    marginHorizontal: 20,
    marginTop: 8,
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  feedCard: {
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
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  feedHeaderLeft: {
    flex: 1,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  feedCondition: {
    fontSize: 12,
    color: "#8E48BB",
    marginTop: 2,
    fontWeight: "600",
  },
  feedAuthor: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  feedDesc: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 10,
  },
  feedMeta: {
    flexDirection: "row",
    gap: 16,
  },
  feedMint: {
    fontSize: 12,
    color: "#6b7280",
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
});
