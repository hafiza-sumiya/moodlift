/**
 * src/constants/colors.js
 *
 * Single source of truth for the MoodLift brand palette.
 * Import from here instead of hardcoding hex values in screens.
 *
 * Usage:
 *   import { COLORS } from '../constants/colors';
 *   backgroundColor: COLORS.brand.primary
 */

export const COLORS = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    primary: "#8E48BB",       // Main purple — buttons, headers, tab bar active
    primaryLight: "#a855f7",  // Lighter purple accents
    primaryGlow: "#e9d5ff",   // Soft purple — subtitles, placeholders on dark bg
    primaryShadow: "#8E48BB", // Shadow color (same as primary for elevation)
  },

  // ── Backgrounds ────────────────────────────────────────────────────────────
  bg: {
    screen: "#f9fafb",   // Default screen background
    card: "#ffffff",     // Card / input surfaces
    overlay: "#f3f4f6",  // Subtle overlay sections
  },

  // ── Text ───────────────────────────────────────────────────────────────────
  text: {
    primary: "#111827",   // Headings
    secondary: "#1f2937", // Body text
    muted: "#6b7280",     // Hints, metadata
    placeholder: "#9ca3af",
    onDark: "#ffffff",    // Text on brand-colored surfaces
    link: "#8E48BB",      // Inline links
  },

  // ── Borders & Dividers ─────────────────────────────────────────────────────
  border: {
    light: "#e5e7eb",
    medium: "#d1d5db",
  },

  // ── Tab bar ────────────────────────────────────────────────────────────────
  tab: {
    active: "#8E48BB",
    inactive: "#9ca3af",
  },

  // ── Mood spectrum ──────────────────────────────────────────────────────────
  mood: {
    calm: "#10b981",      // green
    hopeful: "#f59e0b",   // yellow
    tired: "#3b82f6",     // blue
    motivated: "#f97316", // orange
    stressed: "#ef4444",  // red
    confused: "#a855f7",  // purple
  },

  // ── Status ─────────────────────────────────────────────────────────────────
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
};

// Convenience flat exports for quick access
export const BRAND_PRIMARY = COLORS.brand.primary;
export const BRAND_GLOW = COLORS.brand.primaryGlow;
export const SCREEN_BG = COLORS.bg.screen;
