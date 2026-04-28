import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import { getGreeting } from "../utils/helpers";
import { storyService } from "../utils/storyService";
import motivationalData from "../data/motivationalQuotes.json";
import StoryCard from "../components/StoryCard";
import typography from "../styles/typography";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);
  const [streak, setStreak] = useState(0);
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);

  useEffect(() => {
    // loadUserData();
    setGreeting(getGreeting());
    loadMotivationalContent();
  }, []);

  // Load stories when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecoveryStories();
    }, []),
  );

  const loadRecoveryStories = async () => {
    try {
      setLoadingStories(true);
      const response = await storyService.getStories({ limit: 5 });

      if (
        response &&
        response.success &&
        response.data &&
        Array.isArray(response.data.stories)
      ) {
        const storiesArray = response.data.stories;
        const uniqueStories = Object.values(
          storiesArray.reduce((acc, story) => {
            if (story && story._id) acc[story._id] = story;
            return acc;
          }, {}),
        );
        setStories(uniqueStories);
      } else {
        console.warn("Invalid response structure:", {
          success: response?.success,
          hasData: !!response?.data,
          isArray: Array.isArray(response?.data?.stories),
        });
        setStories([]);
      }
    } catch (error) {
      console.error("Error loading stories:", error);
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

  const loadMotivationalContent = () => {
    const quotes = motivationalData.quotes;
    const tips = motivationalData.tips;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentQuote(randomQuote);
    setCurrentTip(randomTip);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Home</Text>

          <View style={styles.headerIcons}>
            {/* Reflection icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Journal")}
            >
              <MaterialCommunityIcons
                name="notebook-outline"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Reminder icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                Alert.alert(
                  "Daily Reminders",
                  "✓ Fill mood tracker\n✓ Do 2 min breathing",
                );
              }}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {greeting}
            {userName ? `, ${userName}` : ""}
          </Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak} day streak</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryAction]}
            onPress={() => navigation.navigate("MoodTracking")}
          >
            <MaterialCommunityIcons
              name="emoticon-happy"
              size={32}
              color="#fff"
            />
            <Text style={[styles.actionText, styles.primaryActionText]}>
              Track Mood
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("BreathingExercise")}
          >
            <MaterialCommunityIcons
              name="meditation"
              size={32}
              color="#1f2937"
            />
            <Text style={styles.actionText}>Breathe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("FocusTimer")}
          >
            <MaterialCommunityIcons name="timer" size={32} color="#1f2937" />
            <Text style={styles.actionText}>Focus</Text>
          </TouchableOpacity>
        </View>

        {/* Motivational Quote Card */}
        {currentQuote && (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
          </View>
        )}

        {/* Quick Tip Card */}
        {currentTip && (
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>💡 Quick Tip</Text>
            <Text style={styles.tipText}>{currentTip.text}</Text>
          </View>
        )}

        {/* Recovery Stories */}
        <View style={styles.sectionHeader}>
          <Text style={typography.heading}>Recovery Stories</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ShareCondition")}
          >
            <Text style={styles.linkText}>Share your condition →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesList}
          contentContainerStyle={styles.storiesContent}
          decelerationRate="fast"
          snapToInterval={292} // card width + margin
          snapToAlignment="start"
        >
          {loadingStories ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8E48BB" />
            </View>
          ) : stories.length > 0 ? (
            stories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                onPress={() => navigation.navigate("StoryDetails", { story })}
                onRequestPress={() => navigation.navigate("ShareCondition")}
                horizontal={true}
              />
            ))
          ) : (
            <View style={styles.emptyStories}>
              <Text style={styles.emptyText}>
                No stories yet. Share your journey!
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => navigation.navigate("ShareCondition")}
              >
                <Text style={styles.ctaButtonText}>Share Your Story</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Daily Reflection Card */}
        <TouchableOpacity
          style={styles.journalCard}
          onPress={() => navigation.navigate("Journal")}
        >
          <Text style={styles.journalEmoji}>📝</Text>
          <Text style={styles.journalText}>Daily Reflection</Text>
          <Text style={styles.journalSubtext}>
            Write about today's positive or negative moment
          </Text>
        </TouchableOpacity>

        {/* Daily Reminders */}
        <View style={styles.remindersCard}>
          <Text style={styles.remindersTitle}>📌 Daily Reminders</Text>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>✓ Fill mood tracker</Text>
          </View>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>✓ Do 2 min breathing</Text>
          </View>
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
    paddingTop: 0,
    paddingBottom: 32, // Fix tab bar overlap
  },
  header: {
    backgroundColor: "#8E48BB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "400",
    color: "#fff",
    letterSpacing: -0.5,
  },
  greetingSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  streakBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  streakText: {
    color: "#92400e",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    backgroundColor: "#8E48BB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: "row", // 🔥 important
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },

  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },

  iconButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 10,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryAction: {
    backgroundColor: "#8E48BB",
  },
  actionEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  primaryActionText: {
    color: "#fff",
  },
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 18,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#8E48BB",
  },
  quoteText: {
    fontSize: 17,
    fontStyle: "italic",
    color: "#374151",
    marginBottom: 12,
    lineHeight: 26,
    fontWeight: "500",
  },
  quoteAuthor: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "right",
    fontWeight: "500",
  },
  tipCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    marginHorizontal: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tipText: {
    fontSize: 15,
    color: "#047857",
    lineHeight: 24,
    fontWeight: "500",
  },
  journalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 18,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  journalEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  journalText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 6,
  },
  journalSubtext: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  remindersCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  linkText: {
    color: "#8E48BB",
    fontWeight: "700",
    fontSize: 14,
  },
  storiesList: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  storiesContent: {
    paddingRight: 20, // extra padding at end
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStories: {
    paddingVertical: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: "#8E48BB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  reminderItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  reminderText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 24,
  },
});
