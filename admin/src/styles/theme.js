/**
 * Import from any screen: import { COLORS, SHADOWS, SPACING, MOOD } from '../styles/theme';
 */

// ─── Brand Colors ────────────────────────────────────────────────────────────
export const COLORS = {
  // Primary purple brand
  primary: "#8E48BB",
  primaryDark: "#6B2F96",
  primaryLight: "#B47FDC",
  primaryMuted: "#F3E8FF",
  primarySoft: "#EDE0FA",

  // Background system
  bgBase: "#F7F4FC",       // warm off-white with purple tint
  bgCard: "#FFFFFF",
  bgMuted: "#F1F0F7",

  // Text hierarchy
  textPrimary: "#1A1128",
  textSecondary: "#4B4465",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Semantic
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF9C3",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  dangerSoft: "#FFF5F5",
  info: "#3B82F6",
  infoLight: "#DBEAFE",

  // Neutrals
  border: "#E5E7EB",
  divider: "#F3F4F6",

  // Gradient stops (used as array in LinearGradient — or inline with solid fallbacks)
  gradientStart: "#8E48BB",
  gradientEnd: "#6B2F96",
};

// ─── Mood Palette ─────────────────────────────────────────────────────────────
export const MOOD = {
  green:  { color: "#10B981", light: "#D1FAE5", emoji: "😌", label: "Calm",      score: 5 },
  yellow: { color: "#F59E0B", light: "#FEF3C7", emoji: "😊", label: "Hopeful",   score: 4 },
  orange: { color: "#F97316", light: "#FFEDD5", emoji: "🔥", label: "Motivated", score: 3 },
  blue:   { color: "#3B82F6", light: "#DBEAFE", emoji: "😴", label: "Tired",     score: 2 },
  purple: { color: "#A855F7", light: "#F3E8FF", emoji: "😕", label: "Confused",  score: 2 },
  red:    { color: "#EF4444", light: "#FEE2E2", emoji: "😰", label: "Stressed",  score: 1 },
};

export const POSITIVE_MOODS = ["green", "yellow", "orange"];
export const NEGATIVE_MOODS = ["red", "purple", "blue"];

// ─── Spacing Scale ────────────────────────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 28,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// ─── Shadow Presets ───────────────────────────────────────────────────────────
export const SHADOWS = {
  sm: {
    shadowColor: "#8E48BB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#8E48BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#6B2F96",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};

// ─── Typography Scale ─────────────────────────────────────────────────────────
export const FONT = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 42,
};

export const WEIGHT = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
};
