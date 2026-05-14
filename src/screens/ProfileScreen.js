import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Animated, Dimensions, Platform, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import AchievementModal from "../components/AchievementModal";
import { useAuth } from "../utils/AuthContext";
import { COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT, MOOD, POSITIVE_MOODS } from "../styles/theme";
import { FadeSlideIn, ScaleIn } from "../components/EmotionalComponents";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Achievement definitions ──────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: "streak1", emoji: "🔥", locked: "🔒", label: "First Flame", desc: "1-day streak", check: (s, e) => s >= 1 },
  { id: "streak7", emoji: "🏆", locked: "🔒", label: "Week Warrior", desc: "7-day streak", check: (s, e) => s >= 7 },
  { id: "streak30", emoji: "👑", locked: "🔒", label: "Monthly Master", desc: "30-day streak", check: (s, e) => s >= 30 },
  { id: "streak180", emoji: "🌟", locked: "🔒", label: "Half-Year Hero", desc: "6-month streak", check: (s, e) => s >= 180 },
  { id: "entries10", emoji: "⭐", locked: "🔒", label: "10 Reflections", desc: "10 mood entries", check: (s, e) => e >= 10 },
  { id: "entries30", emoji: "✨", locked: "🔒", label: "30 Reflections", desc: "30 mood entries", check: (s, e) => e >= 30 },
];

// ─── Animated Achievement Badge ───────────────────────────────────────────────
function AchievementBadge({ achievement, unlocked, onPress }) {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [unlocked]);

  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.55] });

  return (
    <TouchableOpacity onPress={unlocked ? onPress : undefined} activeOpacity={unlocked ? 0.8 : 1}>
      <Animated.View
        style={[
          abStyles.badge,
          unlocked && abStyles.unlocked,
          unlocked && { shadowOpacity },
        ]}
      >
        <Text style={abStyles.emoji}>{unlocked ? achievement.emoji : achievement.locked}</Text>
        <Text style={[abStyles.label, !unlocked && { color: COLORS.textMuted }]}>{achievement.label}</Text>
        <Text style={abStyles.desc}>{achievement.desc}</Text>
        {unlocked && <View style={abStyles.checkDot}><Text style={{ fontSize: 8, color: "#fff" }}>✓</Text></View>}
      </Animated.View>
    </TouchableOpacity>
  );
}
const abStyles = StyleSheet.create({
  badge: {
    width: (SCREEN_W - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
    position: "relative",
  },
  unlocked: {
    borderColor: "#fbbf24",
    backgroundColor: "#fefce8",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: { fontSize: 32, marginBottom: SPACING.sm },
  label: { fontSize: FONT.sm, fontWeight: WEIGHT.bold, color: COLORS.textPrimary, textAlign: "center" },
  desc: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, textAlign: "center" },
  checkDot: {
    position: "absolute", top: 10, right: 10,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.success, justifyContent: "center", alignItems: "center",
  },
});

// ─── Mini Ring ────────────────────────────────────────────────────────────────
function MiniRing({ value, max, color, label, emoji }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <View style={ringStyles.wrap}>
      <View style={[ringStyles.outer, { borderColor: color + "33" }]}>
        <View style={[ringStyles.inner, { borderColor: color }]}>
          <Text style={[ringStyles.val, { color }]}>{value}</Text>
        </View>
      </View>
      <Text style={ringStyles.emoji}>{emoji}</Text>
      <Text style={ringStyles.label}>{label}</Text>
    </View>
  );
}
const ringStyles = StyleSheet.create({
  wrap: { alignItems: "center", flex: 1 },
  outer: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  inner: { width: 58, height: 58, borderRadius: 29, borderWidth: 4, justifyContent: "center", alignItems: "center" },
  val: { fontSize: FONT.md, fontWeight: WEIGHT.extrabold },
  emoji: { fontSize: 16, marginTop: SPACING.xs },
  label: { fontSize: 10, color: COLORS.textMuted, fontWeight: WEIGHT.medium, textAlign: "center", marginTop: 2 },
});

// ─── Emotional Summary Card ───────────────────────────────────────────────────
function EmotionalSummaryCard({ moodData }) {
  if (!moodData.length) return null;
  const positiveCount = moodData.filter(e => POSITIVE_MOODS.includes(e.color)).length;
  const pct = Math.round((positiveCount / moodData.length) * 100);
  const moodCounts = {};
  moodData.forEach(e => { moodCounts[e.color] = (moodCounts[e.color] || 0) + 1; });
  const top = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];
  const topMood = MOOD[top];
  const recentSlice = moodData.slice(-7);
  const recentPositive = recentSlice.filter(e => POSITIVE_MOODS.includes(e.color)).length;
  const trend = recentPositive >= 4 ? "↑ Improving" : recentPositive <= 2 ? "↓ Needs care" : "→ Stable";
  const trendColor = recentPositive >= 4 ? COLORS.success : recentPositive <= 2 ? COLORS.danger : COLORS.warning;

  return (
    <FadeSlideIn style={esStyles.card}>
      <Text style={esStyles.title}>Your Emotional Snapshot</Text>
      <View style={esStyles.row}>
        <View style={esStyles.stat}>
          <Text style={[esStyles.statVal, { color: COLORS.primary }]}>{pct}%</Text>
          <Text style={esStyles.statLabel}>Positivity</Text>
        </View>
        <View style={esStyles.divider} />
        <View style={esStyles.stat}>
          <Text style={esStyles.statVal}>{topMood?.emoji || "😊"}</Text>
          <Text style={esStyles.statLabel}>{topMood?.label || "Mixed"}</Text>
        </View>
        <View style={esStyles.divider} />
        <View style={esStyles.stat}>
          <Text style={[esStyles.statVal, { color: trendColor, fontSize: FONT.md }]}>{trend}</Text>
          <Text style={esStyles.statLabel}>7-day trend</Text>
        </View>
      </View>
    </FadeSlideIn>
  );
}
const esStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginHorizontal: SPACING.xl, marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  title: { fontSize: FONT.sm, fontWeight: WEIGHT.bold, color: COLORS.textMuted, marginBottom: SPACING.md, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  stat: { alignItems: "center", flex: 1 },
  statVal: { fontSize: FONT.lg, fontWeight: WEIGHT.extrabold, color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: WEIGHT.medium },
  divider: { width: 1, height: 40, backgroundColor: COLORS.divider },
});

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingRow({ icon, label, subtitle, onPress, danger, color }) {
  return (
    <TouchableOpacity
      style={[srStyles.row, danger && srStyles.danger]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[srStyles.iconWrap, { backgroundColor: (color || COLORS.primary) + "18" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color || COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[srStyles.label, danger && { color: COLORS.danger }]}>{label}</Text>
        {subtitle && <Text style={srStyles.sub}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}
const srStyles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: "#fff", borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  danger: { borderLeftWidth: 3, borderLeftColor: COLORS.danger },
  iconWrap: { width: 36, height: 36, borderRadius: RADIUS.sm, justifyContent: "center", alignItems: "center" },
  label: { fontSize: FONT.base, fontWeight: WEIGHT.semibold, color: COLORS.textPrimary },
  sub: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 1 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const [userName, setUserName] = useState("User");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [streak, setStreak] = useState(0);
  const [moodData, setMoodData] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedStreakForModal, setSelectedStreakForModal] = useState(0);
  const { logout } = useAuth();

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const [name, s, moods, journal] = await Promise.all([
      storage.getUserName(),
      storage.getStreakCount(),
      storage.getMoodData(),
      storage.getJournalEntries(),
    ]);
    setUserName(name || "User");
    setStreak(s || 0);
    setMoodData(Array.isArray(moods) ? moods : []);
    setJournalEntries(Array.isArray(journal) ? journal : []);
  };

  const saveUserName = async () => {
    if (!editedName.trim()) { Alert.alert("Invalid Name", "Please enter a valid name."); return; }
    await storage.saveUserName(editedName.trim());
    setUserName(editedName.trim());
    setIsEditingName(false);
  };

  const clearAllData = () => {
    Alert.alert("Clear All Data", "Delete all mood data? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await storage.clearAllData();
          setUserName("User"); setStreak(0); setMoodData([]); setJournalEntries([]);
          Alert.alert("Cleared", "All data has been removed.");
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: logout },
    ]);
  };

  const totalEntries = moodData.length;
  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* ── Avatar + Name ────────────────────────────────────────────── */}
        <ScaleIn>
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            {!isEditingName ? (
              <>
                <Text style={styles.userName}>{userName}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => { setEditedName(userName); setIsEditingName(true); }}>
                  <MaterialCommunityIcons name="pencil" size={14} color={COLORS.primary} />
                  <Text style={styles.editBtnText}>Edit name</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.nameEdit}>
                <TextInput
                  style={styles.nameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Your name"
                  autoFocus
                />
                <View style={styles.nameEditBtns}>
                  <TouchableOpacity style={styles.saveBtnSmall} onPress={saveUserName}>
                    <Text style={{ color: "#fff", fontWeight: WEIGHT.bold, fontSize: FONT.sm }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtnSmall} onPress={() => setIsEditingName(false)}>
                    <Text style={{ color: COLORS.textMuted, fontWeight: WEIGHT.medium, fontSize: FONT.sm }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScaleIn>

        {/* ── Progress Rings ───────────────────────────────────────────── */}
        <FadeSlideIn delay={100}>
          <View style={styles.ringsCard}>
            <MiniRing value={streak} max={30} color={COLORS.primary} label="Streak" emoji="🔥" />
            <View style={styles.ringDiv} />
            <MiniRing value={totalEntries} max={30} color={COLORS.success} label="Moods" emoji="📊" />
            <View style={styles.ringDiv} />
            <MiniRing value={journalEntries.length} max={20} color="#F59E0B" label="Journals" emoji="📓" />
          </View>
        </FadeSlideIn>

        {/* ── Emotional Snapshot ───────────────────────────────────────── */}
        <EmotionalSummaryCard moodData={moodData} />

        {/* ── Achievements ─────────────────────────────────────────────── */}
        <FadeSlideIn delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievGrid}>
              {ACHIEVEMENTS.map((a) => {
                const unlocked = a.check(streak, totalEntries);
                return (
                  <AchievementBadge
                    key={a.id}
                    achievement={a}
                    unlocked={unlocked}
                    onPress={() => { setSelectedStreakForModal(streak); setAchievementModalVisible(true); }}
                  />
                );
              })}
            </View>
          </View>
        </FadeSlideIn>

        {/* ── Settings ─────────────────────────────────────────────────── */}
        <FadeSlideIn delay={280}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <SettingRow icon="bell-outline" label="Notifications" subtitle="Daily mood reminders" onPress={() => Alert.alert("Coming soon", "Notification settings will be available soon.")} />
            <SettingRow icon="download-outline" label="Export Data" subtitle="Download your journal & moods" onPress={() => Alert.alert("Coming soon", "Export feature coming soon.")} />
            <SettingRow icon="shield-outline" label="Privacy" subtitle="Your data stays on your device" onPress={() => Alert.alert("Privacy", "All data is stored locally on your device only.")} />
            <SettingRow icon="trash-can-outline" label="Clear All Data" danger onPress={clearAllData} color={COLORS.danger} />
          </View>
        </FadeSlideIn>

        {/* ── Logout ───────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialCommunityIcons name="logout" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ── App Info ─────────────────────────────────────────────────── */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>MoodLift 💜</Text>
          <Text style={styles.appVersion}>Version 1.0.0 · Your emotional wellness companion</Text>
        </View>
      </ScrollView>

      <AchievementModal
        visible={achievementModalVisible}
        onClose={() => setAchievementModalVisible(false)}
        streak={selectedStreakForModal}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.bgBase },
  content: { paddingBottom: 48 },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
    paddingBottom: SPACING.lg,
  },
  headerTitle: { fontSize: FONT.xl, fontWeight: WEIGHT.extrabold, color: "#fff", letterSpacing: -0.5 },

  avatarSection: { alignItems: "center", paddingVertical: SPACING.xxl, backgroundColor: COLORS.primary, paddingBottom: SPACING.xxxl },
  avatarRing: {
    width: 108, height: 108, borderRadius: 54,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center", alignItems: "center", marginBottom: SPACING.lg,
  },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 38, fontWeight: WEIGHT.extrabold, color: "#fff" },
  userName: { fontSize: FONT.xl, fontWeight: WEIGHT.bold, color: "#fff", marginBottom: SPACING.sm },
  editBtn: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  editBtnText: { color: "#fff", fontSize: FONT.xs, fontWeight: WEIGHT.semibold },
  nameEdit: { alignItems: "center", width: "80%" },
  nameInput: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT.md, color: "#fff", width: "100%", textAlign: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", marginBottom: SPACING.sm },
  nameEditBtns: { flexDirection: "row", gap: SPACING.md },
  saveBtnSmall: { backgroundColor: "#fff", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  cancelBtnSmall: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },

  ringsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.xl,
    marginTop: -SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.lg,
    marginBottom: SPACING.lg,
  },
  ringDiv: { width: 1, height: 60, backgroundColor: COLORS.divider, alignSelf: "center" },

  section: { marginHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONT.md, fontWeight: WEIGHT.bold, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  achievGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, justifyContent: "space-between" },

  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    marginHorizontal: SPACING.xl, padding: SPACING.md, ...SHADOWS.md, marginBottom: SPACING.lg,
  },
  logoutText: { color: "#fff", fontWeight: WEIGHT.bold, fontSize: FONT.base },

  appInfo: { alignItems: "center", paddingBottom: SPACING.xl },
  appName: { fontSize: FONT.base, fontWeight: WEIGHT.bold, color: COLORS.primary },
  appVersion: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 4, textAlign: "center" },
});
