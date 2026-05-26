/**
 * Reusable Admin Components
 * SearchBar - for searching in lists
 * FilterChip - for filtering options
 */

import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT, WEIGHT } from "@/styles/theme";

export function SearchBar({ placeholder = "Search...", onSearch, loading }) {
  const [query, setQuery] = useState("");

  const handleSearch = (text) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View style={styles.searchContainer}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={COLORS.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={handleSearch}
        editable={!loading}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => handleSearch("")}>
          <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function FilterChips({ options, selectedFilter, onFilterChange, loading }) {
  return (
    <View style={styles.chipsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.chip,
            selectedFilter === option.value && styles.chipActive,
          ]}
          onPress={() => onFilterChange(option.value)}
          disabled={loading}
        >
          <Text
            style={[
              styles.chipText,
              selectedFilter === option.value && styles.chipTextActive,
            ]}
          >
            {option.label}
          </Text>
          {option.count !== undefined && (
            <Text
              style={[
                styles.chipCount,
                selectedFilter === option.value && styles.chipCountActive,
              ]}
            >
              {option.count}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function FilterButton({ label, icon, onPress, active, count }) {
  return (
    <TouchableOpacity
      style={[styles.filterBtn, active && styles.filterBtnActive]}
      onPress={onPress}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={active ? COLORS.textInverse : COLORS.primary}
        />
      )}
      <Text
        style={[
          styles.filterBtnText,
          active && styles.filterBtnTextActive,
        ]}
      >
        {label}
        {count !== undefined && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );
}

export function EmptyState({ icon = "inbox-outline", title, subtitle, action }) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={COLORS.textMuted}
        style={{ marginBottom: SPACING.md }}
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <Text style={styles.actionButtonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT.base,
    color: COLORS.textPrimary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT.sm,
    color: COLORS.textPrimary,
    fontWeight: WEIGHT.medium,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  chipCount: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    fontWeight: WEIGHT.bold,
  },
  chipCountActive: {
    color: COLORS.textInverse,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgMuted,
    marginHorizontal: SPACING.xs,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: FONT.sm,
    color: COLORS.textPrimary,
    fontWeight: WEIGHT.medium,
  },
  filterBtnTextActive: {
    color: COLORS.textInverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT.lg,
    fontWeight: WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: FONT.sm,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: FONT.sm,
    fontWeight: WEIGHT.bold,
    color: COLORS.textInverse,
  },
});
