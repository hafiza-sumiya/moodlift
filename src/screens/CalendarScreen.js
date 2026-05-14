import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { storage } from "../utils/storage";
import { getDateKey } from "../utils/helpers";
import LogoLoader from "../components/LogoLoader";

const { width: SCREEN_W } = Dimensions.get("window");
const CELL_W = (SCREEN_W - 48) / 7;

// ─── Mood map ─────────────────────────────────────────────────────────────────
const MOOD_MAP = {
  green: { emoji: "😌", label: "Calm", color: "#10B981", bg: "#D1FAE5" },
  yellow: { emoji: "😊", label: "Hopeful", color: "#F59E0B", bg: "#FEF3C7" },
  orange: { emoji: "🔥", label: "Motivated", color: "#F97316", bg: "#FFEDD5" },
  blue: { emoji: "😴", label: "Tired", color: "#3B82F6", bg: "#DBEAFE" },
  purple: { emoji: "😕", label: "Confused", color: "#A855F7", bg: "#F3E8FF" },
  red: { emoji: "😰", label: "Stressed", color: "#EF4444", bg: "#FEE2E2" },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDateFull(date) {
  const d = new Date(date);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = MONTH_NAMES;
  const day = String(d.getDate()).padStart(2, "0");
  return `${months[d.getMonth()]} ${day}, ${days[d.getDay()]}`;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CalendarScreen() {
  const today = new Date();

  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);

  useFocusEffect(
    useCallback(() => { loadMoodData(); }, [])
  );

  const loadMoodData = async () => {
    setLoading(true);
    const data = await storage.getMoodData();
    setMoodData(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  // Build moodData lookup by date key
  const moodByKey = {};
  moodData.forEach((e) => { if (e.date) moodByKey[e.date] = e; });

  const getMoodForDate = (date) => moodByKey[getDateKey(date)] || null;

  // Navigate months
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return new Date(year, month, dayNum);
  });

  // Selected day data
  const selKey = getDateKey(selectedDate);
  const selEntry = moodByKey[selKey];
  const selMood = selEntry ? MOOD_MAP[selEntry.color] : null;

  const isToday = (date) => date && getDateKey(date) === getDateKey(today);
  const isSelected = (date) => date && getDateKey(date) === selKey;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + 10);
      setLoadingMore(false);
    }, 1000);
  };

  const recentMoods = [...moodData]
    .filter((e) => e.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (loading) return <LogoLoader />;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#C7D2F5" />
      <SafeAreaView style={s.safe} edges={["top"]}>

        {/* ── Big Header ───────────────────────────────────────────────── */}
        <View style={s.bigHeader}>
          <Text style={s.bigTitle}>Mood{"\n"}Calendar</Text>
          {/* decorative cloud shapes */}
          <View style={s.cloud1} />
          <View style={s.cloud2} />
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Calendar Card ─────────────────────────────────────────── */}
          <View style={s.calCard}>

            {/* Month nav */}
            <View style={s.monthRow}>
              <TouchableOpacity onPress={prevMonth} style={s.navBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={20} color="#555" />
              </TouchableOpacity>
              <Text style={s.monthLabel}>{MONTH_NAMES[month]} {year}</Text>
              <TouchableOpacity onPress={nextMonth} style={s.navBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={20} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Day-of-week header */}
            <View style={s.dayLabelRow}>
              {DAY_LABELS.map((d) => (
                <Text key={d} style={s.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={s.grid}>
              {cells.map((date, i) => {
                if (!date) {
                  return <View key={`empty-${i}`} style={s.cell} />;
                }
                const mood = getMoodForDate(date);
                const moodInfo = mood ? MOOD_MAP[mood.color] : null;
                const today_ = isToday(date);
                const sel = isSelected(date);
                const future = date > today && !today_;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      s.cell,
                      sel && s.cellSelected,
                    ]}
                    onPress={() => setSelectedDate(date)}
                    activeOpacity={0.8}
                  >
                    {moodInfo ? (
                      // Day with mood — show emoji in colored circle
                      <View style={[
                        s.moodCell,
                        { backgroundColor: today_ ? "#4F62C0" : "#BDC8F0" },
                        sel && { backgroundColor: "#4F62C0" },
                      ]}>
                        <Text style={s.moodEmoji}>{moodInfo.emoji}</Text>
                      </View>
                    ) : (
                      // Day without mood — plain number circle
                      <View style={[
                        s.emptyCell,
                        today_ && s.todayCell,
                        future && s.futureCell,
                      ]}>
                        <Text style={[
                          s.cellNum,
                          today_ && s.cellNumToday,
                          !today_ && !future && !moodInfo && s.cellNumMuted,
                        ]}>
                          {date.getDate()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Expand hint */}
            <View style={s.expandHint}>
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
            </View>
          </View>

          {/* ── Selected Day Panel ────────────────────────────────────── */}
          <View style={s.detailCard}>
            {/* Gradient layers */}
            <View style={s.detailGradBase} />
            <View style={s.detailGradMid} />

            <View style={s.detailRow}>
              <View style={s.detailLeft}>
                <View style={s.detailDateRow}>
                  <Text style={s.detailDate}>{formatDateFull(selectedDate)}</Text>
                  <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
                </View>

                {selEntry ? (
                  <>
                    <Text style={s.detailFeeling}>I was feeling</Text>
                    <View style={s.tagRow}>
                      {selEntry.color && (
                        <View style={s.tag}>
                          <Text style={s.tagText}>{selMood?.emoji} {selMood?.label}</Text>
                        </View>
                      )}
                      {selEntry.feeling && (
                        <View style={s.tag}>
                          <Text style={s.tagText}>😊 {selEntry.feeling}</Text>
                        </View>
                      )}
                    </View>
                    {selEntry.groundingExercise && Object.keys(selEntry.groundingExercise).length > 0 && (
                      <View style={[s.tag, { marginTop: 6, backgroundColor: "rgba(255,255,255,0.18)" }]}>
                        <Text style={s.tagText}>🧘 Grounding done</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={s.detailFeeling}>No mood logged for this day</Text>
                )}
              </View>

              <View style={s.detailRight}>
                {selMood ? (
                  <Text style={s.bigEmoji}>{selMood.emoji}</Text>
                ) : (
                  <Text style={s.bigEmoji}>🌿</Text>
                )}
              </View>
            </View>
          </View>

          {/* ── Legend ───────────────────────────────────────────────── */}
          <View style={s.legendCard}>
            <Text style={s.legendTitle}>Mood Guide</Text>
            <View style={s.legendGrid}>
              {Object.entries(MOOD_MAP).map(([key, m]) => (
                <View key={key} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: m.color }]} />
                  <Text style={s.legendText}>{m.emoji} {m.label}</Text>
                </View>
              ))}
            </View>
          </View>


          {/* ── Recent Moods ─────────────────────────────────────────── */}
          <View style={s.recentSection}>
            <View style={s.recentHeader}>
              <Text style={s.recentTitle}>📖 Recent Moods</Text>
              <Text style={s.recentCount}>{recentMoods.length} entries</Text>
            </View>

            {recentMoods.length === 0 ? (
              <View style={s.emptyMoods}>
                <Text style={s.emptyMoodEmoji}>🌱</Text>
                <Text style={s.emptyMoodText}>No entries yet — start tracking!</Text>
              </View>
            ) : (
              recentMoods.slice(0, visibleCount).map((entry, i) => {
                const m = MOOD_MAP[entry.color];
                const hasGrounding = entry.groundingExercise &&
                  Object.keys(entry.groundingExercise).length > 0;
                return (
                  <View key={i} style={[s.recentCard, { borderLeftColor: m?.color || "#C7D2F5" }]}>
                    <View style={[s.recentCardBg, { backgroundColor: (m?.color || "#C7D2F5") + "15" }]} />
                    <View style={s.recentEmojiBubble}>
                      <Text style={s.recentEmojiText}>{m?.emoji || "🌿"}</Text>
                    </View>
                    <View style={s.recentCardBody}>
                      <Text style={s.recentDate}>{entry.date}</Text>
                      <Text style={[s.recentMoodLabel, { color: m?.color || "#6B7280" }]}>
                        {m?.label || "Unknown mood"}
                      </Text>
                      {entry.feeling ? (
                        <Text style={s.recentFeeling}>"{entry.feeling}"</Text>
                      ) : null}
                      {hasGrounding && (
                        <View style={s.groundingTag}>
                          <Text style={s.groundingTagText}>🧘 Grounding done</Text>
                        </View>
                      )}
                    </View>
                    <View style={[s.recentBadge, { backgroundColor: m?.color || "#9CA3AF" }]}>
                      <Text style={s.recentBadgeNum}>#{i + 1}</Text>
                    </View>
                  </View>
                );
              })
            )}

            {recentMoods.length > visibleCount && (
              loadingMore ? (
                <View style={s.loadMoreLoader}>
                  <LogoLoader size={52} showText={false} style={s.miniLoader} />
                </View>
              ) : (
                <TouchableOpacity style={s.loadMoreBtn} onPress={handleLoadMore} activeOpacity={0.8}>
                  <Text style={s.loadMoreText}>Load more  ↓</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#C7D2F5" },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },

  // Big header (blue bg area with title)
  bigHeader: {
    backgroundColor: "#C7D2F5",
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    overflow: "hidden",
  },
  bigTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#3B4FBF",
    lineHeight: 42,
  },
  // Decorative cloud blobs
  cloud1: {
    position: "absolute", right: 20, top: 10,
    width: 70, height: 38,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 19,
  },
  cloud2: {
    position: "absolute", right: 50, top: 32,
    width: 100, height: 38,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 19,
  },

  // Calendar card
  calCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: "#3B4FBF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },

  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#F3F4F6",
    justifyContent: "center", alignItems: "center",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },

  dayLabelRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayLabel: {
    width: CELL_W,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: CELL_W,
    height: CELL_W,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  cellSelected: {
    // highlight handled inside the moodCell/emptyCell
  },

  // Cell with mood
  moodCell: {
    width: CELL_W - 6,
    height: CELL_W - 6,
    borderRadius: (CELL_W - 6) / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#BDC8F0",
  },
  moodEmoji: { fontSize: 20 },

  // Cell without mood
  emptyCell: {
    width: CELL_W - 6,
    height: CELL_W - 6,
    borderRadius: (CELL_W - 6) / 2,
    backgroundColor: "#EEF0F8",
    justifyContent: "center",
    alignItems: "center",
  },
  todayCell: {
    backgroundColor: "#C7D2F5",
    borderWidth: 2,
    borderColor: "#4F62C0",
  },
  futureCell: {
    backgroundColor: "transparent",
  },
  cellNum: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  cellNumToday: {
    color: "#3B4FBF",
    fontWeight: "800",
  },
  cellNumMuted: {
    color: "#9CA3AF",
  },

  expandHint: {
    alignItems: "center",
    marginTop: 8,
  },

  // Detail card (selected day)
  detailCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#3B4FBF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 120,
  },
  detailGradBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3B4FBF",
    borderRadius: 24,
  },
  detailGradMid: {
    position: "absolute",
    top: 0, right: 0,
    width: "50%", height: "100%",
    backgroundColor: "#5B6FDF",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    opacity: 0.7,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  detailLeft: { flex: 1 },
  detailRight: { marginLeft: 12 },

  detailDateRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  detailDate: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 24,
    flexShrink: 1,
  },
  detailFeeling: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 8,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: "#fff", fontWeight: "600" },
  bigEmoji: { fontSize: 52 },

  // Legend
  legendCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: "#3B4FBF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "46%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  legendDot: {
    width: 10, height: 10, borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },

  // ── Recent Moods ───────────────────────────────────────────────
  recentSection: {
    marginHorizontal: 16,
    marginTop: 28,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  recentCount: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 14,
    overflow: "hidden",
    shadowColor: "#3B4FBF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  recentCardBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  recentEmojiBubble: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#EEF0F8",
    justifyContent: "center", alignItems: "center",
    marginRight: 12,
    zIndex: 1,
  },
  recentEmojiText: { fontSize: 24 },
  recentCardBody: { flex: 1, zIndex: 1 },
  recentDate: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 2,
  },
  recentMoodLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  recentFeeling: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  groundingTag: {
    marginTop: 5,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  groundingTagText: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "600",
  },
  recentBadge: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: "center", alignItems: "center",
    marginLeft: 8, zIndex: 1,
  },
  recentBadgeNum: {
    fontSize: 10, color: "#fff", fontWeight: "800",
  },

  // Load more
  loadMoreLoader: {
    height: 80,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "transparent",
  },
  miniLoader: {
    flex: 0,
    backgroundColor: "transparent",
    width: 80, height: 80,
  },
  loadMoreBtn: {
    backgroundColor: "#3B4FBF",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#3B4FBF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  emptyMoods: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyMoodEmoji: { fontSize: 40, marginBottom: 8 },
  emptyMoodText: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
});
