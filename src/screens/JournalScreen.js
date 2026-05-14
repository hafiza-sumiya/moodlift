import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import { getDateKey } from "../utils/helpers";
import * as Sharing from "expo-sharing";
import { COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT } from "../styles/theme";
import { FadeSlideIn, ScaleIn, CalmButton, EmptyStateCard, NextStepBanner } from "../components/EmotionalComponents";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Gratitude prompts ────────────────────────────────────────────────────────
const GRATITUDE_PROMPTS = [
  "What's one small thing that went well today?",
  "Who made you feel seen or heard recently?",
  "What emotion did you feel most today, and why?",
  "What's something you did today that took courage?",
  "What's one thing your body did today that you're grateful for?",
  "What would you tell your past-self from 1 year ago?",
  "What's something that surprised you recently in a good way?",
  "Describe a moment today when you felt fully present.",
  "What's a small win you haven't celebrated yet?",
  "What's one thing you're looking forward to tomorrow?",
];

const MOOD_TAGS = [
  { label: "Calm", color: "#10B981", bg: "#D1FAE5" },
  { label: "Anxious", color: "#EF4444", bg: "#FEE2E2" },
  { label: "Hopeful", color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Tired", color: "#3B82F6", bg: "#DBEAFE" },
  { label: "Grateful", color: "#8E48BB", bg: "#F3E8FF" },
  { label: "Overwhelmed", color: "#F97316", bg: "#FFEDD5" },
  { label: "Proud", color: "#059669", bg: "#ECFDF5" },
  { label: "Sad", color: "#6366F1", bg: "#EEF2FF" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const getTodayPrompt = () => {
  const idx = new Date().getDay() + new Date().getDate();
  return GRATITUDE_PROMPTS[idx % GRATITUDE_PROMPTS.length];
};

// ─── Save Success Pulse ───────────────────────────────────────────────────────
function SaveSuccess({ onDone }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onDone?.());
  }, []);
  return (
    <Animated.View style={[saveSuccessStyles.wrap, { opacity }]}>
      <Animated.View style={[saveSuccessStyles.circle, { transform: [{ scale }] }]}>
        <MaterialCommunityIcons name="check" size={32} color="#fff" />
      </Animated.View>
      <Animated.Text style={saveSuccessStyles.text}>Entry saved 🌿</Animated.Text>
    </Animated.View>
  );
}
const saveSuccessStyles = StyleSheet.create({
  wrap: { alignItems: "center", marginVertical: SPACING.xl },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.success, justifyContent: "center", alignItems: "center", marginBottom: SPACING.sm, ...SHADOWS.md },
  text: { fontSize: FONT.base, fontWeight: WEIGHT.bold, color: COLORS.success },
});

// ─── Entry Card ───────────────────────────────────────────────────────────────
function EntryCard({ item, searchQuery }) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = item.type === "positive" ? COLORS.success : COLORS.danger;
  const isLong = item.text.length > 160;
  const displayText = !expanded && isLong ? item.text.slice(0, 160) + "…" : item.text;

  // Highlight search match
  const highlighted = searchQuery
    ? displayText.replace(
      new RegExp(`(${searchQuery})`, "gi"),
      "[$1]"
    )
    : displayText;

  return (
    <View style={[ecStyles.card, { borderLeftColor: accentColor }]}>
      <View style={ecStyles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
          <Text style={ecStyles.dateText}>{formatDate(item.date)}</Text>
          {item.moodTag && (
            <View style={[ecStyles.tagBadge, { backgroundColor: item.moodTag.bg }]}>
              <Text style={[ecStyles.tagText, { color: item.moodTag.color }]}>{item.moodTag.label}</Text>
            </View>
          )}
        </View>
        <View style={[ecStyles.typePill, { backgroundColor: accentColor + "22" }]}>
          <Text style={[ecStyles.typeText, { color: accentColor }]}>
            {item.type === "positive" ? "😊 Positive" : "😔 Difficult"}
          </Text>
        </View>
      </View>
      <Text style={ecStyles.bodyText}>{displayText}</Text>
      {isLong && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={ecStyles.readMoreBtn}>
          <Text style={ecStyles.readMoreText}>{expanded ? "Show less" : "Read more →"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const ecStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.card,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING.sm, flexWrap: "wrap", gap: SPACING.xs },
  dateText: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: WEIGHT.medium },
  tagBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  tagText: { fontSize: 10, fontWeight: WEIGHT.bold },
  typePill: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  typeText: { fontSize: 11, fontWeight: WEIGHT.bold },
  bodyText: { fontSize: FONT.sm, color: COLORS.textSecondary, lineHeight: 22, fontWeight: WEIGHT.medium },
  readMoreBtn: { marginTop: SPACING.sm },
  readMoreText: { fontSize: FONT.xs, color: COLORS.primary, fontWeight: WEIGHT.bold },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JournalScreen() {
  const [entry, setEntry] = useState("");
  const [type, setType] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [savedEntries, setSavedEntries] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "positive" | "negative"
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [usedPrompt, setUsedPrompt] = useState(false);
  const todayPrompt = getTodayPrompt();

  useFocusEffect(
    useCallback(() => { loadEntries(); }, [])
  );

  const loadEntries = async () => {
    const entries = await storage.getJournalEntries();
    setSavedEntries(Array.isArray(entries) ? entries : []);
  };

  const handleSave = async () => {
    if (!entry.trim()) {
      Alert.alert("Empty Entry", "Write something first — even a few words count.");
      return;
    }
    if (!type) {
      Alert.alert("Tag this moment", "Was this a positive or difficult moment?");
      return;
    }
    const journalEntry = {
      id: Date.now().toString(),
      date: getDateKey(),
      timestamp: new Date().toISOString(),
      text: entry.trim(),
      type,
      moodTag: selectedTag,
    };
    await storage.saveJournalEntry(journalEntry);
    setShowSuccess(true);
    setEntry("");
    setType(null);
    setSelectedTag(null);
    setUsedPrompt(false);
    loadEntries();
  };

  const handleShare = async () => {
    if (!entry.trim()) {
      Alert.alert("Nothing to share", "Write something first.");
      return;
    }
    try {
      const text = `My journal entry — ${new Date().toLocaleDateString()}\n\n${entry.trim()}`;
      await Sharing.shareAsync(
        "data:text/plain;base64," + btoa(unescape(encodeURIComponent(text))),
        { mimeType: "text/plain", dialogTitle: "Share Journal Entry" }
      );
    } catch {
      Alert.alert("Share failed", "Could not share this entry.");
    }
  };

  const useGratitudePrompt = () => {
    setEntry(todayPrompt + "\n\n");
    setUsedPrompt(true);
  };

  // ── Filtered + searched entries
  const displayEntries = savedEntries
    .slice()
    .reverse()
    .filter((e) => {
      if (filter === "positive" && e.type !== "positive") return false;
      if (filter === "negative" && e.type !== "negative") return false;
      if (searchQuery && !e.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .slice(0, 20);

  const positiveCount = savedEntries.filter((e) => e.type === "positive").length;
  const negativeCount = savedEntries.filter((e) => e.type !== "positive").length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Daily Journal</Text>
              <Text style={styles.headerSub}>Every feeling deserves space</Text>
            </View>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => setShowSearch(!showSearch)}
            >
              <MaterialCommunityIcons
                name={showSearch ? "close" : "magnify"}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Writing stats */}
          {savedEntries.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statNum}>{savedEntries.length}</Text>
                <Text style={styles.statLbl}>entries</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={[styles.statNum, { color: COLORS.success }]}>{positiveCount}</Text>
                <Text style={styles.statLbl}>positive</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={[styles.statNum, { color: COLORS.danger }]}>{negativeCount}</Text>
                <Text style={styles.statLbl}>difficult</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Search ──────────────────────────────────────────────────────── */}
        {showSearch && (
          <FadeSlideIn style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your entries…"
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </FadeSlideIn>
        )}

        {/* ── Gratitude Prompt ─────────────────────────────────────────────── */}
        {!usedPrompt && (
          <FadeSlideIn style={styles.promptCard}>
            <MaterialCommunityIcons name="lightbulb-outline" size={18} color={COLORS.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.promptLabel}>Today's prompt</Text>
              <Text style={styles.promptText}>{todayPrompt}</Text>
            </View>
            <TouchableOpacity onPress={useGratitudePrompt} style={styles.usePromptBtn}>
              <Text style={styles.usePromptText}>Use</Text>
            </TouchableOpacity>
          </FadeSlideIn>
        )}

        {/* ── Type Selector ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>This moment is…</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === "positive" && styles.typeBtnPositive]}
            onPress={() => setType("positive")}
            activeOpacity={0.8}
          >
            <Text style={styles.typeBtnEmoji}>😊</Text>
            <Text style={[styles.typeBtnText, type === "positive" && { color: COLORS.success, fontWeight: WEIGHT.bold }]}>
              Positive
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === "negative" && styles.typeBtnNegative]}
            onPress={() => setType("negative")}
            activeOpacity={0.8}
          >
            <Text style={styles.typeBtnEmoji}>😔</Text>
            <Text style={[styles.typeBtnText, type === "negative" && { color: COLORS.danger, fontWeight: WEIGHT.bold }]}>
              Difficult
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Mood Tags ─────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>How are you feeling?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          {MOOD_TAGS.map((tag) => {
            const isSelected = selectedTag?.label === tag.label;
            return (
              <TouchableOpacity
                key={tag.label}
                style={[
                  styles.tag,
                  { backgroundColor: tag.bg, borderColor: isSelected ? tag.color : "transparent" },
                ]}
                onPress={() => setSelectedTag(isSelected ? null : tag)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Text Input ────────────────────────────────────────────────────── */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Write freely — this is your safe space…"
            placeholderTextColor={COLORS.textMuted}
            multiline
            value={entry}
            onChangeText={setEntry}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{entry.length} chars</Text>
        </View>

        {/* ── Save Animation ────────────────────────────────────────────────── */}
        {showSuccess && (
          <SaveSuccess onDone={() => setShowSuccess(false)} />
        )}

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        {!showSuccess && (
          <View style={styles.btnRow}>
            <CalmButton label="Save Entry" onPress={handleSave} icon="content-save" style={{ flex: 1 }} />
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <MaterialCommunityIcons name="share-variant-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Next Step Suggestion ─────────────────────────────────────────── */}
        {savedEntries.length > 0 && (
          <View style={styles.nextWrap}>
            <NextStepBanner
              icon="meditation"
              title="Follow up with Breathing"
              subtitle="Writing can unlock tension — release it gently"
              onPress={() => { }}
              color="#059669"
            />
          </View>
        )}

        {/* ── Entries List ─────────────────────────────────────────────────── */}
        {savedEntries.length > 0 ? (
          <View style={styles.entriesSection}>
            {/* Filter pills */}
            <View style={styles.filterRow}>
              <Text style={styles.entriesTitle}>Past Entries</Text>
              <View style={styles.filterPills}>
                {["all", "positive", "negative"].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterPill, filter === f && styles.filterPillActive]}
                    onPress={() => setFilter(f)}
                  >
                    <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {displayEntries.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No entries match your filter.</Text>
              </View>
            ) : (
              displayEntries.map((item) => (
                <EntryCard key={item.id} item={item} searchQuery={showSearch ? searchQuery : ""} />
              ))
            )}
          </View>
        ) : (
          <EmptyStateCard
            emoji="📓"
            title="Your emotional journey starts here"
            subtitle="Every feeling you write down is a step towards understanding yourself better."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.bgBase },
  content: { paddingBottom: 60 },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    // paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
    paddingBottom: SPACING.lg,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: "#fff", letterSpacing: -0.5 },
  headerSub: { fontSize: FONT.xs, color: "rgba(255,255,255,0.75)", marginTop: 2, fontWeight: WEIGHT.medium },
  searchBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
  statChip: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, alignItems: "center" },
  statNum: { fontSize: FONT.md, fontWeight: WEIGHT.extrabold, color: "#fff" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: WEIGHT.medium },

  // Search
  searchWrap: { marginHorizontal: SPACING.xl, marginTop: SPACING.lg },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT.base,
    color: COLORS.textPrimary,
    ...SHADOWS.sm,
  },

  // Prompt
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  promptLabel: { fontSize: 10, fontWeight: WEIGHT.bold, color: COLORS.warning, textTransform: "uppercase", letterSpacing: 0.5 },
  promptText: { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: WEIGHT.medium, marginTop: 2 },
  usePromptBtn: { backgroundColor: COLORS.warning, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  usePromptText: { fontSize: FONT.xs, fontWeight: WEIGHT.bold, color: "#fff" },

  // Type selector
  sectionLabel: { fontSize: FONT.sm, fontWeight: WEIGHT.bold, color: COLORS.textMuted, marginHorizontal: SPACING.xl, marginTop: SPACING.xl, marginBottom: SPACING.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  typeRow: { flexDirection: "row", gap: SPACING.md, marginHorizontal: SPACING.xl },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  typeBtnPositive: { borderColor: COLORS.success, backgroundColor: "#ECFDF5" },
  typeBtnNegative: { borderColor: COLORS.danger, backgroundColor: "#FEF2F2" },
  typeBtnEmoji: { fontSize: 22 },
  typeBtnText: { fontSize: FONT.base, fontWeight: WEIGHT.medium, color: COLORS.textSecondary },

  // Tags
  tagsRow: { paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    ...SHADOWS.sm,
  },
  tagText: { fontSize: FONT.xs, fontWeight: WEIGHT.bold },

  // Input
  inputWrap: { marginHorizontal: SPACING.xl, marginTop: SPACING.md },
  input: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT.base,
    color: COLORS.textPrimary,
    minHeight: 180,
    textAlignVertical: "top",
    lineHeight: 24,
    fontWeight: WEIGHT.medium,
    ...SHADOWS.card,
  },
  charCount: { fontSize: 10, color: COLORS.textMuted, textAlign: "right", marginTop: SPACING.xs },

  // Buttons
  btnRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    alignItems: "center",
  },
  shareBtn: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },

  // Next step
  nextWrap: { marginHorizontal: SPACING.xl, marginTop: SPACING.lg },

  // Entries
  entriesSection: { marginTop: SPACING.xl, paddingHorizontal: SPACING.xl },
  filterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  entriesTitle: { fontSize: FONT.md, fontWeight: WEIGHT.bold, color: COLORS.textPrimary },
  filterPills: { flexDirection: "row", gap: SPACING.sm },
  filterPill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterPillText: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: WEIGHT.medium },
  filterPillTextActive: { color: "#fff", fontWeight: WEIGHT.bold },
  noResults: { alignItems: "center", paddingVertical: SPACING.xl },
  noResultsText: { fontSize: FONT.base, color: COLORS.textMuted },
});
