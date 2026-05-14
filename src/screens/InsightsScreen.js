import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import {
  COLORS, SHADOWS, SPACING, RADIUS, FONT, WEIGHT,
  MOOD, POSITIVE_MOODS, NEGATIVE_MOODS,
} from "../styles/theme";
import { FadeSlideIn, NextStepBanner } from "../components/EmotionalComponents";

const { width: SCREEN_W } = Dimensions.get("window");
const BAR_MAX_H = 80;
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Pure analytics computation ───────────────────────────────────────────────
function computeInsights(data) {
  if (!data.length) return null;

  // ── Mood score map (1–5)
  const scoreOf = (color) => MOOD[color]?.score ?? 3;

  // ── Most common mood
  const moodCounts = {};
  data.forEach((e) => { moodCounts[e.color] = (moodCounts[e.color] || 0) + 1; });
  const mostCommonMood = Object.keys(moodCounts).reduce((a, b) =>
    moodCounts[a] > moodCounts[b] ? a : b
  );

  // ── Positive / Negative split
  const positiveCount = data.filter((e) => POSITIVE_MOODS.includes(e.color)).length;
  const negativeCount = data.filter((e) => NEGATIVE_MOODS.includes(e.color)).length;
  const balancePct = Math.round((positiveCount / data.length) * 100);

  // ── Stress frequency (red + purple)
  const stressCount = data.filter((e) => e.color === "red" || e.color === "purple").length;
  const stressPct = Math.round((stressCount / data.length) * 100);

  // ── Mood stability score (lower variance = higher stability)
  const scores = data.map((e) => scoreOf(e.color));
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  const variance =
    scores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / scores.length;
  // Map variance 0–4 to stability 0–100 (lower variance → higher stability)
  const stabilityScore = Math.round(Math.max(0, Math.min(100, ((4 - variance) / 4) * 100)));

  // ── Weekly trend (last 7 days avg score per day)
  const today = new Date();
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const entries = data.filter((e) => e.date && e.date.startsWith(key));
    const dayAvg = entries.length
      ? entries.reduce((s, e) => s + scoreOf(e.color), 0) / entries.length
      : 0;
    return { day: DAYS_SHORT[d.getDay()], avg: dayAvg, count: entries.length };
  });

  // ── Best day of week (highest avg score across all history)
  const dayScores = {};
  data.forEach((e) => {
    const day = new Date(e.date).toLocaleDateString("en-US", { weekday: "short" });
    if (!dayScores[day]) dayScores[day] = { total: 0, count: 0 };
    dayScores[day].total += scoreOf(e.color);
    dayScores[day].count += 1;
  });
  let bestDay = null, bestDayScore = 0;
  Object.keys(dayScores).forEach((day) => {
    const avg = dayScores[day].total / dayScores[day].count;
    if (avg > bestDayScore) { bestDayScore = avg; bestDay = day; }
  });

  // ── Stress trend (last 7 days vs rest)
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 7);
  const recentEntries = data.filter((e) => new Date(e.date) >= recentCutoff);
  const olderEntries  = data.filter((e) => new Date(e.date) <  recentCutoff);
  const recentStressPct = recentEntries.length
    ? (recentEntries.filter((e) => e.color === "red" || e.color === "purple").length / recentEntries.length) * 100
    : 0;
  const olderStressPct = olderEntries.length
    ? (olderEntries.filter((e) => e.color === "red" || e.color === "purple").length / olderEntries.length) * 100
    : recentStressPct;
  const stressTrend = recentStressPct > olderStressPct + 10
    ? "rising" : recentStressPct < olderStressPct - 10
    ? "falling" : "stable";

  // ── Top feelings
  const feelingCounts = {};
  data.forEach((e) => { if (e.feeling) feelingCounts[e.feeling] = (feelingCounts[e.feeling] || 0) + 1; });
  const topFeelings = Object.keys(feelingCounts)
    .map((f) => ({ label: f, count: feelingCounts[f], pct: Math.round((feelingCounts[f] / data.length) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // ── Smart recommendations
  const recs = [];
  if (stressPct > 30) recs.push({ icon: "meditation", text: "Practice daily breathing — it reduces stress markers significantly.", priority: "high" });
  if (stabilityScore < 50) recs.push({ icon: "chart-line", text: "Your mood varies a lot. A consistent routine can help stabilize it.", priority: "medium" });
  if (bestDay) recs.push({ icon: "star-outline", text: `${bestDay}s are your emotional peak. Schedule important tasks then.`, priority: "low" });
  if (data.length < 7) recs.push({ icon: "pencil-outline", text: "Track at least 7 days to unlock deeper pattern insights.", priority: "low" });
  if (balancePct < 40) recs.push({ icon: "heart-outline", text: "Try gratitude journaling — it shifts emotional balance noticeably.", priority: "high" });

  return {
    totalEntries: data.length,
    mostCommonMood,
    moodCounts,
    positiveCount,
    negativeCount,
    balancePct,
    stressPct,
    stabilityScore,
    weekBars,
    bestDay,
    stressTrend,
    topFeelings,
    recommendations: recs.slice(0, 3),
    avgScore: Math.round(avg * 10) / 10,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function AnimatedCard({ children, style, delay = 0 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(ty,      { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: ty }] }, style]}>
      {children}
    </Animated.View>
  );
}

function ScoreRing({ value, label, color, size = 78 }) {
  // Simple pseudo-ring using nested circles (no SVG dep required)
  const pct = Math.min(100, Math.max(0, value));
  const ringColor = pct >= 70 ? COLORS.success : pct >= 40 ? COLORS.warning : COLORS.danger;
  return (
    <View style={{ alignItems: "center" }}>
      <View style={[ringStyles.outer, { width: size, height: size, borderRadius: size / 2, borderColor: COLORS.border }]}>
        <View style={[
          ringStyles.inner,
          {
            width: size - 10,
            height: size - 10,
            borderRadius: (size - 10) / 2,
            borderColor: color || ringColor,
            borderWidth: 5,
          },
        ]}>
          <Text style={[ringStyles.value, { fontSize: size * 0.26 }]}>{pct}</Text>
          <Text style={[ringStyles.percent, { fontSize: size * 0.14 }]}>%</Text>
        </View>
      </View>
      <Text style={ringStyles.label}>{label}</Text>
    </View>
  );
}

function WeeklyBarChart({ bars }) {
  const maxAvg = Math.max(...bars.map((b) => b.avg), 1);
  return (
    <View style={chartStyles.container}>
      {bars.map((bar, i) => {
        const isToday = i === bars.length - 1;
        const heightPct = bar.avg / 5; // scores are 1–5
        const barH = Math.max(6, heightPct * BAR_MAX_H);
        const moodColor = bar.avg >= 4 ? COLORS.success : bar.avg >= 3 ? COLORS.warning : bar.avg >= 1 ? COLORS.danger : COLORS.border;
        return (
          <View key={i} style={chartStyles.col}>
            <Text style={chartStyles.val}>{bar.count > 0 ? bar.avg.toFixed(1) : ""}</Text>
            <View style={[chartStyles.barWrap, { height: BAR_MAX_H }]}>
              <View style={[
                chartStyles.bar,
                {
                  height: barH,
                  backgroundColor: bar.count ? moodColor : COLORS.divider,
                  opacity: isToday ? 1 : 0.7,
                },
              ]} />
            </View>
            <Text style={[chartStyles.day, isToday && chartStyles.todayDay]}>{bar.day}</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatPill({ icon, value, label, color }) {
  return (
    <View style={[pillStyles.pill, { borderColor: color + "33" }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={[pillStyles.value, { color }]}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={emptyStyles.wrap}>
      <Text style={emptyStyles.emoji}>📊</Text>
      <Text style={emptyStyles.title}>No data yet</Text>
      <Text style={emptyStyles.sub}>
        Track your mood for a few days and come back to see your emotional patterns and insights.
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InsightsScreen() {
  const [insights, setInsights] = useState(undefined);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      loadInsights();
    }, [])
  );

  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    const data = await storage.getMoodData();
    setInsights(data.length ? computeInsights(data) : null);
  };

  // ── Loading
  if (insights === undefined) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Analysing your mood data…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty state
  if (!insights) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
        <EmptyState />
      </SafeAreaView>
    );
  }

  // ── Trend badge
  const trendIcon = insights.stressTrend === "rising" ? "trending-up" : insights.stressTrend === "falling" ? "trending-down" : "trending-neutral";
  const trendColor = insights.stressTrend === "rising" ? COLORS.danger : insights.stressTrend === "falling" ? COLORS.success : COLORS.warning;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSub}>Based on {insights.totalEntries} mood entries</Text>
        </View>

        {/* ── Score Rings ─────────────────────────────────────────────────── */}
        <AnimatedCard delay={60}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Emotional Overview</Text>
            <View style={ringsRow.row}>
              <ScoreRing value={insights.stabilityScore} label="Stability" color={COLORS.primary} />
              <View style={ringsRow.divider} />
              <ScoreRing value={insights.balancePct}    label="Positivity" color={COLORS.success} />
              <View style={ringsRow.divider} />
              <ScoreRing value={100 - insights.stressPct} label="Calm" color={COLORS.info} />
            </View>
          </View>
        </AnimatedCard>

        {/* ── Stat Pills ───────────────────────────────────────────────────── */}
        <AnimatedCard delay={120}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={pillsRow.list}
          >
            <StatPill icon="emoticon-happy-outline" value={insights.positiveCount} label="Positive Days"  color={COLORS.success} />
            <StatPill icon="emoticon-sad-outline"   value={insights.negativeCount} label="Tough Days"     color={COLORS.danger}  />
            <StatPill icon="fire"                   value={`${insights.stressPct}%`} label="Stress Rate"  color="#F97316"        />
            <StatPill icon={trendIcon}              value={insights.stressTrend}  label="Stress Trend"    color={trendColor}     />
            {insights.bestDay && (
              <StatPill icon="star-outline" value={insights.bestDay} label="Best Day" color={COLORS.warning} />
            )}
          </ScrollView>
        </AnimatedCard>

        {/* ── Weekly Bar Chart ─────────────────────────────────────────────── */}
        <AnimatedCard delay={200}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>7-Day Mood Trend</Text>
            <Text style={styles.cardSub}>Average mood score per day (1 = stressed · 5 = calm)</Text>
            <WeeklyBarChart bars={insights.weekBars} />
          </View>
        </AnimatedCard>

        {/* ── Most Common Mood ─────────────────────────────────────────────── */}
        <AnimatedCard delay={280}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dominant Mood</Text>
            {(() => {
              const m = MOOD[insights.mostCommonMood];
              if (!m) return null;
              return (
                <View style={dominantStyles.row}>
                  <View style={[dominantStyles.circle, { backgroundColor: m.light }]}>
                    <Text style={dominantStyles.emoji}>{m.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[dominantStyles.name, { color: m.color }]}>{m.label}</Text>
                    <Text style={dominantStyles.desc}>
                      You've felt {m.label.toLowerCase()} most often.{" "}
                      {POSITIVE_MOODS.includes(insights.mostCommonMood)
                        ? "Great — keep nurturing what brings you peace!"
                        : "Small daily habits can shift this over time."}
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
        </AnimatedCard>

        {/* ── Mood Distribution ────────────────────────────────────────────── */}
        <AnimatedCard delay={340}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mood Distribution</Text>
            {Object.entries(insights.moodCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([color, count]) => {
                const m = MOOD[color];
                if (!m) return null;
                const pct = Math.round((count / insights.totalEntries) * 100);
                return (
                  <View key={color} style={distStyles.row}>
                    <Text style={distStyles.emoji}>{m.emoji}</Text>
                    <Text style={distStyles.label}>{m.label}</Text>
                    <View style={distStyles.barBg}>
                      <View style={[distStyles.barFill, { width: `${pct}%`, backgroundColor: m.color }]} />
                    </View>
                    <Text style={[distStyles.pct, { color: m.color }]}>{pct}%</Text>
                  </View>
                );
              })}
          </View>
        </AnimatedCard>

        {/* ── Common Feelings ──────────────────────────────────────────────── */}
        {insights.topFeelings.length > 0 && (
          <AnimatedCard delay={400}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Common Feelings</Text>
              {insights.topFeelings.map((f, i) => (
                <View key={i} style={distStyles.row}>
                  <Text style={distStyles.label}>
                    {f.label.charAt(0).toUpperCase() + f.label.slice(1)}
                  </Text>
                  <View style={distStyles.barBg}>
                    <View style={[distStyles.barFill, { width: `${f.pct}%`, backgroundColor: COLORS.primaryLight }]} />
                  </View>
                  <Text style={[distStyles.pct, { color: COLORS.primary }]}>{f.pct}%</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>
        )}

        {/* ── Recommendations ──────────────────────────────────────────────── */}
        {insights.recommendations.length > 0 && (
          <AnimatedCard delay={460}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Smart Recommendations</Text>
              {insights.recommendations.map((rec, i) => (
                <View
                  key={i}
                  style={[
                    recStyles.item,
                    rec.priority === "high" && recStyles.high,
                  ]}
                >
                  <View style={[recStyles.iconWrap, rec.priority === "high" && { backgroundColor: COLORS.dangerLight }]}>
                    <MaterialCommunityIcons
                      name={rec.icon}
                      size={20}
                      color={rec.priority === "high" ? COLORS.danger : COLORS.primary}
                    />
                  </View>
                  <Text style={recStyles.text}>{rec.text}</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>
        )}
        {/* ── Emotional Connection ─────────────────────────────────────────── */}
        <FadeSlideIn delay={520}>
          <View style={{ marginHorizontal: SPACING.xl, marginTop: SPACING.md }}>
            <NextStepBanner
              icon="thought-bubble-outline"
              title="Reflect on your patterns"
              subtitle="Answer 6 emotional questions to understand yourself better"
              onPress={() => navigation.navigate("DeepReflection", { mood: {} })}
              color={COLORS.primary}
            />
          </View>
        </FadeSlideIn>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  content: {
    paddingBottom: 48,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: FONT.xl,
    fontWeight: WEIGHT.extrabold,
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: FONT.sm,
    color: "rgba(255,255,255,0.75)",
    marginTop: 3,
    fontWeight: WEIGHT.medium,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgBase,
  },
  loadingText: {
    fontSize: FONT.base,
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: FONT.md,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    fontWeight: WEIGHT.medium,
  },
});

const ringsRow = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.divider,
  },
});

const ringStyles = StyleSheet.create({
  outer: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    fontWeight: WEIGHT.extrabold,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  percent: {
    color: COLORS.textMuted,
    fontWeight: WEIGHT.medium,
    lineHeight: 12,
  },
  label: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    fontWeight: WEIGHT.semibold,
    marginTop: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});

const pillsRow = StyleSheet.create({
  list: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
});

const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    alignItems: "center",
    gap: SPACING.xs,
    ...SHADOWS.sm,
    minWidth: 100,
  },
  value: {
    fontSize: FONT.md,
    fontWeight: WEIGHT.extrabold,
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: WEIGHT.medium,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },
});

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: SPACING.md,
  },
  col: {
    alignItems: "center",
    flex: 1,
  },
  val: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: WEIGHT.medium,
    marginBottom: 4,
    height: 14,
  },
  barWrap: {
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: 18,
    borderRadius: RADIUS.sm,
  },
  day: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: WEIGHT.medium,
    marginTop: 6,
  },
  todayDay: {
    color: COLORS.primary,
    fontWeight: WEIGHT.bold,
  },
});

const dominantStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 34,
  },
  name: {
    fontSize: FONT.lg,
    fontWeight: WEIGHT.extrabold,
    marginBottom: 4,
  },
  desc: {
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

const distStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: 18,
    width: 24,
    textAlign: "center",
  },
  label: {
    fontSize: FONT.sm,
    fontWeight: WEIGHT.semibold,
    color: COLORS.textSecondary,
    width: 76,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: RADIUS.full,
  },
  pct: {
    fontSize: FONT.sm,
    fontWeight: WEIGHT.bold,
    width: 36,
    textAlign: "right",
  },
});

const recStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.bgMuted,
    borderRadius: RADIUS.md,
  },
  high: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    flex: 1,
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: WEIGHT.medium,
    paddingTop: 2,
  },
});

const emptyStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT.xl,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sub: {
    fontSize: FONT.base,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 24,
  },
});
