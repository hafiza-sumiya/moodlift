import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../utils/storage';
import { getColorForMood, getMoodLabel } from '../utils/helpers';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const [moodData, setMoodData] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const data = await storage.getMoodData();
    setMoodData(data);
    calculateInsights(data);
  };

  const calculateInsights = (data) => {
    if (data.length === 0) {
      setInsights({
        totalEntries: 0,
        mostCommonMood: null,
        stressFrequency: 0,
        weeklyPattern: null,
        triggers: [],
        recommendations: [],
      });
      return;
    }

    // Calculate most common mood
    const moodCounts = {};
    data.forEach((entry) => {
      moodCounts[entry.color] = (moodCounts[entry.color] || 0) + 1;
    });
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    );

    // Calculate stress frequency (red + purple)
    const stressEntries = data.filter(
      (entry) => entry.color === 'red' || entry.color === 'purple'
    );
    const stressFrequency = (stressEntries.length / data.length) * 100;

    // Weekly pattern analysis
    const dayOfWeekCounts = {};
    data.forEach((entry) => {
      const date = new Date(entry.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dayOfWeekCounts[dayName]) {
        dayOfWeekCounts[dayName] = { total: 0, stressed: 0 };
      }
      dayOfWeekCounts[dayName].total++;
      if (entry.color === 'red' || entry.color === 'purple') {
        dayOfWeekCounts[dayName].stressed++;
      }
    });

    // Find day with highest stress
    let highestStressDay = null;
    let highestStressRate = 0;
    Object.keys(dayOfWeekCounts).forEach((day) => {
      const rate =
        (dayOfWeekCounts[day].stressed / dayOfWeekCounts[day].total) * 100;
      if (rate > highestStressRate) {
        highestStressRate = rate;
        highestStressDay = day;
      }
    });

    // Identify triggers (feeling patterns)
    const feelingCounts = {};
    data.forEach((entry) => {
      if (entry.feeling) {
        feelingCounts[entry.feeling] = (feelingCounts[entry.feeling] || 0) + 1;
      }
    });

    const triggers = Object.keys(feelingCounts)
      .map((feeling) => ({
        feeling,
        count: feelingCounts[feeling],
        percentage: (feelingCounts[feeling] / data.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Generate recommendations
    const recommendations = [];
    if (stressFrequency > 30) {
      recommendations.push({
        icon: '🧘',
        text: 'Consider practicing breathing exercises more frequently',
        priority: 'high',
      });
    }
    if (highestStressDay) {
      recommendations.push({
        icon: '📅',
        text: `You tend to feel more stressed on ${highestStressDay}s. Plan lighter activities on these days.`,
        priority: 'medium',
      });
    }
    if (data.length < 7) {
      recommendations.push({
        icon: '📊',
        text: 'Track your mood for at least a week to get better insights',
        priority: 'low',
      });
    }
    if (mostCommonMood === 'red' || mostCommonMood === 'purple') {
      recommendations.push({
        icon: '💚',
        text: 'Try incorporating more mindfulness activities into your routine',
        priority: 'high',
      });
    }

    setInsights({
      totalEntries: data.length,
      mostCommonMood,
      stressFrequency: Math.round(stressFrequency),
      weeklyPattern: highestStressDay
        ? {
            day: highestStressDay,
            rate: Math.round(highestStressRate),
          }
        : null,
      triggers,
      recommendations,
    });
  };

  if (!insights) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Triggers & Insights</Text>
        </View>
      
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Understanding your mood patterns to help you feel better
        </Text>
      </View>

      {/* Overview Stats */}
      <View style={[styles.statsContainer, { paddingHorizontal: 20 }]}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{insights.totalEntries}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{insights.stressFrequency}%</Text>
          <Text style={styles.statLabel}>Stress Frequency</Text>
        </View>
      </View>

      {/* Most Common Mood */}
      {insights.mostCommonMood && (
        <View style={[styles.insightCard, { marginHorizontal: 20 }]}>
          <Text style={styles.insightTitle}>Most Common Mood</Text>
          <View style={styles.moodDisplay}>
            <View
              style={[
                styles.moodCircleLarge,
                { backgroundColor: getColorForMood(insights.mostCommonMood) },
              ]}
            >
              <Text style={styles.moodEmojiLarge}>
                {insights.mostCommonMood === 'green' && '😌'}
                {insights.mostCommonMood === 'yellow' && '😊'}
                {insights.mostCommonMood === 'blue' && '😴'}
                {insights.mostCommonMood === 'orange' && '🔥'}
                {insights.mostCommonMood === 'red' && '😰'}
                {insights.mostCommonMood === 'purple' && '😕'}
              </Text>
            </View>
            <Text style={styles.moodLabelLarge}>
              {getMoodLabel(insights.mostCommonMood)}
            </Text>
          </View>
        </View>
      )}

      {/* Weekly Pattern */}
      {insights.weeklyPattern && (
        <View style={[styles.insightCard, { marginHorizontal: 20 }]}>
          <Text style={styles.insightTitle}>Weekly Pattern</Text>
          <Text style={styles.insightText}>
            You tend to experience higher stress levels on{' '}
            <Text style={styles.highlight}>
              {insights.weeklyPattern.day}s
            </Text>
            {' '}({insights.weeklyPattern.rate}% of entries)
          </Text>
        </View>
      )}

      {/* Triggers */}
      {insights.triggers.length > 0 && (
        <View style={[styles.insightCard, { marginHorizontal: 20 }]}>
          <Text style={styles.insightTitle}>Common Feelings</Text>
          {insights.triggers.map((trigger, index) => (
            <View key={index} style={styles.triggerItem}>
              <View style={styles.triggerBar}>
                <View
                  style={[
                    styles.triggerBarFill,
                    { width: `${trigger.percentage}%` },
                  ]}
                />
              </View>
              <View style={styles.triggerInfo}>
                <Text style={styles.triggerFeeling}>
                  {trigger.feeling.charAt(0).toUpperCase() +
                    trigger.feeling.slice(1)}
                </Text>
                <Text style={styles.triggerPercentage}>
                  {Math.round(trigger.percentage)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <View style={[styles.insightCard, { marginHorizontal: 20 }]}>
          <Text style={styles.insightTitle}>Recommendations</Text>
          {insights.recommendations.map((rec, index) => (
            <View
              key={index}
              style={[
                styles.recommendationItem,
                rec.priority === 'high' && styles.recommendationHigh,
              ]}
            >
              <Text style={styles.recommendationIcon}>{rec.icon}</Text>
              <Text style={styles.recommendationText}>{rec.text}</Text>
            </View>
          ))}
        </View>
      )}

      {insights.totalEntries === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyText}>
            Start tracking your mood to see insights and patterns!
          </Text>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#8E48BB',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "400",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#8E48BB',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 18,
  },
  moodDisplay: {
    alignItems: 'center',
  },
  moodCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodEmojiLarge: {
    fontSize: 40,
  },
  moodLabelLarge: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  insightText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  highlight: {
    fontWeight: '600',
    color: '#8E48BB',
  },
  triggerItem: {
    marginBottom: 16,
  },
  triggerBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  triggerBarFill: {
    height: '100%',
    backgroundColor: '#8E48BB',
    borderRadius: 5,
  },
  triggerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerFeeling: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  triggerPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8E48BB',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  recommendationHigh: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

