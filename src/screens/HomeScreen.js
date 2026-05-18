import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Platform, StatusBar, Dimensions, ActivityIndicator, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import { storyService } from "../utils/storyService";
import motivationalData from "../data/motivationalQuotes.json";
import StoryCard from "../components/StoryCard";
import LogoLoader, { LogoImage } from "../components/LogoLoader";
import { COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT, MOOD, POSITIVE_MOODS } from "../styles/theme";
import { FadeSlideIn } from "../components/EmotionalComponents";
import { useProtectedAction } from "../hooks/useProtectedAction";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { hi: "Good Morning", big: "A great day to\ncheck your mood ☀️" };
  if (h >= 12 && h < 17) return { hi: "Good Afternoon", big: "How's the afternoon\ntreating you? 🌤️" };
  if (h >= 17 && h < 21) return { hi: "Good Evening", big: "Wind down and\ncheck your mood 🌅" };
  return { hi: "Good Night", big: "Reflect before\nyou sleep 🌙" };
};

const getTodayKey = () => new Date().toISOString().split("T")[0];

// ─── "How's the day" moods ────────────────────────────────────────────────────
const DAY_MOODS = [
  { emoji: "❤️", label: "Awesome", value: "awesome", color: "#EF4444" },
  { emoji: "✨", label: "Great", value: "great", color: "#F59E0B" },
  { emoji: "🫧", label: "Alright", value: "alright", color: "#3B82F6" },
  { emoji: "☁️", label: "Not Great", value: "notgreat", color: "#6B7280" },
  { emoji: "🔥", label: "Terrible", value: "terrible", color: "#F97316" },
];

// ─── Calendar mood colors mapped from MOOD ────────────────────────────────────
const QUICK_ACTIONS = [
  { key: "journal", icon: "notebook-outline", label: "Journal", route: "Journal", bg: "#EDE0FA", iconColor: COLORS.primary },
  { key: "breathe", icon: "meditation", label: "Breathe", route: "BreathingExercise", bg: "#D1FAE5", iconColor: "#059669" },
  { key: "focus", icon: "timer-outline", label: "Focus", route: "FocusTimer", bg: "#DBEAFE", iconColor: "#2563EB" },
  { key: "community", icon: "account-group", label: "Community", route: "ShareCondition", bg: "#FFEDD5", iconColor: "#EA580C" },
];

// ─── AnimatedCard ─────────────────────────────────────────────────────────────
function AnimatedCard({ children, style, delay = 0 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: ty }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── "How's the day" quick-pick row ──────────────────────────────────────────
function HowsTheDayRow({ todayAnswer, onSelect }) {
  return (
    <View style={htd.wrap}>
      <Text style={htd.heading}>How's the day. . .</Text>
      <View style={htd.row}>
        {DAY_MOODS.map((m) => {
          const selected = todayAnswer === m.value;
          return (
            <TouchableOpacity
              key={m.value}
              style={[htd.chip, selected && { backgroundColor: m.color + "22", borderColor: m.color }]}
              onPress={() => onSelect(m)}
              activeOpacity={0.8}
            >
              <View style={[htd.emojiWrap, selected && { backgroundColor: m.color + "33" }]}>
                <Text style={htd.emoji}>{m.emoji}</Text>
              </View>
              <Text style={[htd.label, selected && { color: m.color, fontWeight: WEIGHT.bold }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
const htd = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.xl, marginVertical: SPACING.lg },
  heading: { fontSize: FONT.md, fontWeight: WEIGHT.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  row: { flexDirection: "row", justifyContent: "space-between" },
  chip: { alignItems: "center", borderRadius: RADIUS.lg, padding: SPACING.sm, borderWidth: 1.5, borderColor: "transparent", width: (SCREEN_W - SPACING.xl * 2 - 16) / 5 },
  emojiWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#ffffffff", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  emoji: { fontSize: 20 },
  label: { fontSize: 8, color: COLORS.textPrimary, fontWeight: WEIGHT.medium, textAlign: "center" },
});

// ─── Mood Calendar (like image: pill cards with day+date+emoji) ───────────────
function MoodCalendar({ moodData }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getMoodForDay = (date) => {
    const key = date.toISOString().split("T")[0];
    const entries = moodData.filter((e) => e.date && e.date.startsWith(key));
    if (!entries.length) return null;
    return entries[entries.length - 1].color;
  };

  return (
    <View style={cal.wrap}>
      <Text style={cal.title}>📅 Mood Calendar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cal.row}>
        {days.map((d, i) => {
          const moodColor = getMoodForDay(d);
          const moodInfo = moodColor ? MOOD[moodColor] : null;
          const isToday = i === 6;
          const isPast = i < 6;
          return (
            <View
              key={i}
              style={[
                cal.pill,
                isToday && { backgroundColor: "#4ADE80" },
                !isToday && isPast && moodInfo ? { backgroundColor: "#1F2937" } : !isToday && { backgroundColor: "#E5E7EB" },
              ]}
            >
              <Text style={[cal.dayText, !isToday && !moodInfo && { color: "#9CA3AF" }]}>
                {DAYS_SHORT[d.getDay()]}
              </Text>
              <Text style={[cal.dateText, !isToday && !moodInfo && { color: "#9CA3AF" }]}>
                {String(d.getDate()).padStart(2, "0")}
              </Text>
              <Text style={cal.emojiText}>
                {moodInfo ? moodInfo.emoji : isToday ? "😊" : ""}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
const cal = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  title: { fontSize: FONT.md, fontWeight: WEIGHT.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  row: { gap: SPACING.sm, paddingRight: SPACING.sm },
  pill: {
    width: 52, borderRadius: 24, alignItems: "center",
    paddingVertical: SPACING.md, backgroundColor: "#E5E7EB",
  },
  dayText: { fontSize: 10, fontWeight: WEIGHT.bold, color: "#fff", marginBottom: 2 },
  dateText: { fontSize: 16, fontWeight: WEIGHT.extrabold, color: "#fff", marginBottom: 4 },
  emojiText: { fontSize: 20 },
});

// ─── "Continue filling" popup ─────────────────────────────────────────────────
function ContinueModal({ visible, selectedDayMood, onContinue, onDismiss }) {
  if (!selectedDayMood) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={modal.overlay}>
        <View style={modal.card}>
          <Text style={modal.emoji}>{selectedDayMood.emoji}</Text>
          <Text style={modal.title}>Feeling {selectedDayMood.label}?</Text>
          <Text style={modal.sub}>
            Log this to your mood tracker for a fuller picture of your day 🌿
          </Text>
          <TouchableOpacity style={modal.btn} onPress={onContinue} activeOpacity={0.85}>
            <Text style={modal.btnText}>Continue filling →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} style={modal.dismissBtn}>
            <Text style={modal.dismissText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  card: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SPACING.xxl, alignItems: "center",
  },
  emoji: { fontSize: 56, marginBottom: SPACING.md },
  title: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  sub: { fontSize: FONT.base, color: COLORS.textMuted, textAlign: "center", lineHeight: 22, marginBottom: SPACING.xl },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl, width: "100%", alignItems: "center", ...SHADOWS.md, marginBottom: SPACING.md },
  btnText: { color: "#fff", fontWeight: WEIGHT.bold, fontSize: FONT.base },
  dismissBtn: { padding: SPACING.sm },
  dismissText: { color: COLORS.textMuted, fontWeight: WEIGHT.medium, fontSize: FONT.sm },
});

// ─── Floating Action Button ───────────────────────────────────────────────────
function FAB({ onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 5 }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={[fab.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity style={fab.btn} onPress={handlePress} activeOpacity={0.9}>
        <Text style={fab.plus}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const fab = StyleSheet.create({
  wrap: { position: "absolute", bottom: 10, alignSelf: "center" },
  btn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
    ...SHADOWS.lg,
    borderWidth: 3,
    borderColor: "rgba(142,72,187,0.25)",
  },
  plus: { fontSize: 32, color: "#fff", fontWeight: WEIGHT.bold, lineHeight: 36 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation();
  const requireAuth = useProtectedAction();

  const [userName, setUserName] = useState("");
  const [streak, setStreak] = useState(0);
  const [moodData, setMoodData] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [todayAnswer, setTodayAnswer] = useState(null); // quick "how's the day" pick
  const [modalMood, setModalMood] = useState(null); // selected mood for popup
  const [showModal, setShowModal] = useState(false);
  const [todayFilled, setTodayFilled] = useState(false); // mood tracking filled today?

  const greeting = getTimeGreeting();

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadRecoveryStories();
    }, [])
  );

  useEffect(() => { loadQuote(); }, []);

  const loadData = async () => {
    const [name, moods, streakCount] = await Promise.all([
      storage.getUserName(),
      storage.getMoodData(),
      storage.getStreakCount(),
    ]);
    if (name) setUserName(name.split(" ")[0]);
    setStreak(streakCount || 0);
    const moodArr = Array.isArray(moods) ? moods : [];
    setMoodData(moodArr);
    const todayKey = getTodayKey();
    const filledToday = moodArr.some((e) => e.date && e.date.startsWith(todayKey));
    setTodayFilled(filledToday);
  };

  const loadQuote = () => {
    const quotes = motivationalData?.quotes || [];
    if (quotes.length) setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  const loadRecoveryStories = async () => {
    try {
      setLoadingStories(true);
      const response = await storyService.getStories({ limit: 5 });
      if (response?.success && Array.isArray(response?.data?.stories)) {
        const unique = Object.values(
          response.data.stories.reduce((acc, s) => { if (s?._id) acc[s._id] = s; return acc; }, {})
        );
        setStories(unique);
      } else {
        setStories([]);
      }
    } catch { setStories([]); }
    finally { setLoadingStories(false); }
  };

  const handleDayMoodSelect = (moodObj) => {
    setTodayAnswer(moodObj.value);
    setModalMood(moodObj);
    // Only show popup if today's full tracking not already filled
    if (!todayFilled) {
      setShowModal(true);
    }
  };

  const handleModalContinue = () => {
    setShowModal(false);
    requireAuth(() => navigation.navigate("MoodTracking"));
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={["top"]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <LogoImage size={38} style={{ borderRadius: 10 }} />
            </View>

            <View style={s.headerRight}>

              <View style={s.streakChip}>
                <Text style={s.streakFire}>🔥</Text>
                <Text style={s.streakCount}>{streak}</Text>
              </View>

              <TouchableOpacity
                style={s.iconBtn}
                onPress={() => requireAuth(() => navigation.navigate('Journal'))}
              >
                <MaterialCommunityIcons name="notebook-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={s.iconBtn}
                onPress={() => requireAuth(() => 
                  Alert.alert("Daily Reminders", "✓ Fill mood tracker\n✓ Do 2 min breathing")
                )}
              >
                <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Hero Greeting ───────────────────────────────────────────────── */}
          <AnimatedCard delay={0}>
            <View style={s.hero}>
              <Text style={s.heroHi}>Hello, <Text style={s.heroName}>{userName || "there"} 👋</Text></Text>
              <Text style={s.heroBig}>{greeting.big}</Text>
            </View>
          </AnimatedCard>

          {/* ── How's the day ───────────────────────────────────────────────── */}
          <AnimatedCard delay={80}>
            <HowsTheDayRow todayAnswer={todayAnswer} onSelect={handleDayMoodSelect} />
          </AnimatedCard>

          {/* ── Mood Calendar ───────────────────────────────────────────────── */}
          <AnimatedCard delay={160}>
            <MoodCalendar moodData={moodData} />
          </AnimatedCard>

          {/* ── Quick Actions ───────────────────────────────────────────────── */}
          <AnimatedCard delay={240}>
            <View style={s.qaSection}>
              <View style={s.qaGrid}>
                {QUICK_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.key}
                    style={[s.qaCard, { backgroundColor: action.bg }]}
                    onPress={() => requireAuth(() => navigation.navigate(action.route))}
                    activeOpacity={0.8}
                  >
                    <View style={[s.qaIcon, { backgroundColor: action.iconColor + "22" }]}>
                      <MaterialCommunityIcons name={action.icon} size={24} color={action.iconColor} />
                    </View>
                    <Text style={[s.qaLabel, { color: action.iconColor }]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AnimatedCard>

          {/* ── Quote ───────────────────────────────────────────────────────── */}
          {currentQuote && (
            <AnimatedCard delay={320}>
              <View style={s.quoteCard}>
                <Text style={s.quoteText}>{currentQuote.text}</Text>
              </View>
            </AnimatedCard>
          )}

          {/* ── Recovery Stories ─────────────────────────────────────────────── */}
          <AnimatedCard delay={400}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Recovery Stories</Text>
              <TouchableOpacity onPress={() => requireAuth(() => navigation.navigate("ShareCondition"))}>
                <Text style={s.sectionLink}>Share yours →</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.storiesList}
            decelerationRate="fast"
            snapToInterval={292}
            snapToAlignment="start"
          >
            {loadingStories ? (
              <View style={s.storiesCenter}>
                <LogoLoader size={56} showText={false} style={s.storyLoader} />
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
              <View style={s.storiesEmpty}>
                <Text style={s.storiesEmptyEmoji}>💬</Text>
                <Text style={s.storiesEmptyText}>No stories yet. Share your journey!</Text>
                <TouchableOpacity style={s.storiesCta} onPress={() => requireAuth(() => navigation.navigate("ShareCondition"))}>
                  <Text style={s.storiesCtaText}>Share Your Story</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Bottom spacer for FAB */}
          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <FAB onPress={() => requireAuth(() => navigation.navigate("MoodTracking"))} />

      {/* ── Continue Modal ───────────────────────────────────────────────── */}
      <ContinueModal
        visible={showModal}
        selectedDayMood={modalMood}
        onContinue={handleModalContinue}
        onDismiss={() => setShowModal(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#ffe6efff" },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },

  // Header — white bar, on light bg
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffee3ff",
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: SPACING.md,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  headerRight: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primarySoft, justifyContent: "center", alignItems: "center",
  },
  streakChip: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#FFF3CD",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
  },
  streakFire: { fontSize: 15 },
  streakCount: { fontSize: FONT.sm, fontWeight: WEIGHT.extrabold, color: "#B45309" },

  // Hero
  hero: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl, backgroundColor: "#fffee3ff" },
  heroHi: { fontSize: FONT.md, color: COLORS.textSecondary, fontWeight: WEIGHT.medium, marginBottom: 4 },
  heroName: { fontWeight: WEIGHT.bold, color: COLORS.textPrimary },
  heroBig: { fontSize: 28, color: COLORS.textPrimary, lineHeight: 34 },

  // Quick actions
  qaSection: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  qaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  qaCard: {
    width: (SCREEN_W - SPACING.xl * 2 - SPACING.md) / 2,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  qaIcon: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    justifyContent: "center", alignItems: "center", marginBottom: SPACING.sm,
  },
  qaLabel: { fontSize: FONT.base, fontWeight: WEIGHT.bold },

  // Quote
  quoteCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: "#fffee3ff",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  quoteText: { fontSize: FONT.sm, fontStyle: "italic", color: COLORS.textSecondary, lineHeight: 20 },

  // Stories
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: SPACING.xl, marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT.md, fontWeight: WEIGHT.bold, color: COLORS.textPrimary },
  sectionLink: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: WEIGHT.semibold },
  storiesList: { paddingLeft: SPACING.xl, paddingRight: SPACING.lg },
  storiesCenter: { width: SCREEN_W - SPACING.xl * 2, justifyContent: "center", alignItems: "center", paddingVertical: 20 },
  storyLoader: { flex: 0, backgroundColor: "transparent", width: 80, height: 80 },
  storiesEmpty: { width: SCREEN_W - SPACING.xl * 2, alignItems: "center", paddingVertical: 32 },
  storiesEmptyEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  storiesEmptyText: { fontSize: FONT.sm, color: COLORS.textMuted, marginBottom: SPACING.md },
  storiesCta: {
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.full, ...SHADOWS.md,
  },
  storiesCtaText: { color: "#fff", fontWeight: WEIGHT.bold, fontSize: FONT.sm },
});
