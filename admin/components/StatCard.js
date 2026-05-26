/**
 * StatCard Component - Display statistics in a card format
 * Used in Admin Dashboard
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS, RADIUS, FONT, WEIGHT } from "@/styles/theme";

export function StatCard({
  icon,
  iconColor = COLORS.primary,
  label,
  value,
  subtitle,
  bgColor = COLORS.primarySoft,
}) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }, SHADOWS.small]}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${iconColor}20`,
            },
          ]}
        >
          <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.label}>{label}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  label: {
    fontSize: FONT.sm,
    color: COLORS.textSecondary,
    fontWeight: WEIGHT.medium,
  },
  subtitle: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  value: {
    fontSize: FONT.xl,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
  },
});
