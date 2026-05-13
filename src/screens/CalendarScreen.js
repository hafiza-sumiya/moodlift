import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import {
  getWeekDates,
  getDayName,
  getDateKey,
  getColorForMood,
  getMoodLabel,
} from "../utils/helpers";
import api from "../utils/api";

export default function CalendarScreen() {
  const [moodData, setMoodData] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    setLoading(true);
    const data = await storage.getMoodData();
    setMoodData(data);
    setLoading(false);
  };

  const fetchFromBackend = async () => {
    try {
      const res = await api.request("/moods", { method: "GET" });
      setMoodData(res.data || []);
    } catch (err) {
      console.log("Backend fetch failed");
    }
  };

  const getMoodForDate = (date) => {
    const dateKey = getDateKey(date);
    return moodData.find((entry) => entry.date === dateKey);
  };

  const getWeekDatesForView = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + selectedWeek * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDatesForView();
  const today = new Date();
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Mood Calendar</Text>
        </View>

        {/* Week Navigation */}
        <View style={[styles.weekNavigation, { paddingHorizontal: 20 }]}>
          <TouchableOpacity onPress={() => setSelectedWeek(0)}>
            <Text style={{ color: "#8E48BB", fontWeight: "700" }}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSelectedWeek(selectedWeek - 1)}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#8E48BB"
            />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSelectedWeek(selectedWeek + 1)}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#8E48BB"
            />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={[styles.calendarGrid, { paddingHorizontal: 20 }]}>
          {weekDates.map((date, index) => {
            const mood = getMoodForDate(date);
            const isToday = getDateKey(date) === getDateKey(today);
            const isFuture = date > today;
            const dayName = getDayName(date);
            const dayNumber = date.getDate();

            return (
              <View key={index} style={styles.dayContainer}>
                <Text style={[styles.dayName, isToday && styles.todayText]}>
                  {dayName}
                </Text>
                <Text style={[styles.dayNumber, isToday && styles.todayText]}>
                  {dayNumber}
                </Text>
                {mood ? (
                  <View
                    style={[
                      styles.moodCircle,
                      { backgroundColor: getColorForMood(mood.color) },
                      isToday && styles.todayCircle,
                    ]}
                  >
                    <Text style={styles.moodEmoji}>
                      {mood.color === "green" && "😌"}
                      {mood.color === "yellow" && "😊"}
                      {mood.color === "blue" && "😴"}
                      {mood.color === "orange" && "🔥"}
                      {mood.color === "red" && "😰"}
                      {mood.color === "purple" && "😕"}
                    </Text>
                  </View>
                ) : isFuture || isToday ? (
                  <View style={[styles.moodCircle, styles.emptyCircle]} />
                ) : (
                  <View
                    style={[
                      styles.moodCircle,
                      {
                        backgroundColor: "#fee2e2",
                        borderWidth: 1,
                        borderColor: "#ef4444",
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>❌</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Mood Guide</Text>

          <View style={styles.legendGrid}>
            {[
              { color: "#10b981", label: "Calm 😌" },
              { color: "#f59e0b", label: "Okay 😊" },
              { color: "#ef4444", label: "Stressed 😰" },
              { color: "#3b82f6", label: "Tired 😴" },
              { color: "#f97316", label: "Motivated 🔥" },
              { color: "#a855f7", label: "Confused 😕" },
            ].map((item, index) => (
              <View key={index} style={styles.legendItemNew}>
                <View
                  style={[
                    styles.legendCircleNew,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text style={styles.legendTextNew}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={{ textAlign: "center", marginBottom: 10 }}>
          Total Entries: {moodData.length}
        </Text>

        {/* Recent Moods */}
        <View style={[styles.recentSection, { marginHorizontal: 20 }]}>
          <Text style={styles.recentTitle}>Recent Moods</Text>
          {moodData
            .slice(-7)
            .reverse()
            .map((entry, index) => (
              <View key={index} style={styles.recentItem}>
                <View
                  style={[
                    styles.recentMoodCircle,
                    { backgroundColor: getColorForMood(entry.color) },
                  ]}
                />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentDate}>{entry.date}</Text>
                  <Text style={styles.recentMood}>
                    {getMoodLabel(entry.color)} • {entry.feeling}
                  </Text>
                  {entry.groundingExercise &&
                    Object.keys(entry.groundingExercise).length > 0 && (
                      <View style={styles.groundingBadge}>
                        <Text style={styles.groundingBadgeText}>
                          🧘 Grounding Exercise Completed
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            ))}
          {moodData.length === 0 && (
            <Text style={styles.emptyText}>
              No mood data yet. Start tracking your mood!
            </Text>
          )}
        </View>

        {/* Grounding Exercise Details */}
        {moodData.some(
          (entry) =>
            entry.groundingExercise &&
            Object.keys(entry.groundingExercise).length > 0,
        ) && (
          <View style={[styles.groundingSection, { marginHorizontal: 20 }]}>
            <Text style={styles.groundingSectionTitle}>
              Grounding Exercise History
            </Text>
            {moodData
              .filter(
                (entry) =>
                  entry.groundingExercise &&
                  Object.keys(entry.groundingExercise).length > 0,
              )
              .slice(-5)
              .reverse()
              .map((entry, index) => (
                <View key={index} style={styles.groundingCard}>
                  <Text style={styles.groundingCardDate}>{entry.date}</Text>
                  <View style={styles.groundingResponses}>
                    {Object.entries(entry.groundingExercise).map(
                      ([step, response]) => {
                        const stepNumber = parseInt(step);
                        const stepInfo = [
                          { number: 5, sense: "things you can see" },
                          { number: 4, sense: "things you can touch" },
                          { number: 3, sense: "things you can hear" },
                          { number: 2, sense: "things you can smell" },
                          { number: 1, sense: "thing you can taste" },
                        ][stepNumber - 1];

                        return (
                          <View key={step} style={styles.groundingResponseItem}>
                            <Text style={styles.groundingResponseLabel}>
                              {stepInfo.number} {stepInfo.sense}:
                            </Text>
                            <Text style={styles.groundingResponseText}>
                              {response || "(Not filled)"}
                            </Text>
                          </View>
                        );
                      },
                    )}
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calendarWrapper: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

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
    paddingBottom: 32,
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
  weekNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navButtonText: {
    color: "#8E48BB",
    fontWeight: "700",
    fontSize: 15,
  },
  weekLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
  },
  calendarGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  dayContainer: {
    alignItems: "center",
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  dayNumber: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  todayText: {
    color: "#8E48BB",
    fontWeight: "bold",
  },
  moodCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
  },
  todayCircle: {},
  emptyCircle: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 60,
  },
  legend: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 18,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  todayBadge: {
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#6366f1",
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  recentSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 18,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  recentMoodCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  recentMood: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    padding: 20,
  },
  groundingBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  groundingBadgeText: {
    fontSize: 12,
    color: "#065f46",
    fontWeight: "500",
  },
  groundingSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groundingSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  groundingCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8E48BB",
  },
  groundingCardDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E48BB",
    marginBottom: 12,
  },
  groundingResponses: {
    gap: 8,
  },
  groundingResponseItem: {
    marginBottom: 8,
  },
  groundingResponseLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  groundingResponseText: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
    fontStyle: "italic",
  },
  legendCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  legendItemNew: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  legendCircleNew: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },

  legendTextNew: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});
