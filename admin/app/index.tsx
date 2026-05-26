import React from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT, WEIGHT } from '@/styles/theme';
import { useAuth } from '@/context/auth-context';

const COLORS_ADMIN = {
  primary: '#8E48BB',
  background: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
};

export default function HomeScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="logout" size={18} color={COLORS_ADMIN.primary} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="shield-account" size={60} color={COLORS_ADMIN.primary} />
          </View>
          <Text style={styles.title}>MoodLift Admin</Text>
          <Text style={styles.subtitle}>Complete Platform Management</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation Guide</Text>
          <View style={styles.guideCard}>
            <View style={styles.guideItem}>
              <MaterialCommunityIcons name="chart-box" size={24} color={COLORS_ADMIN.primary} />
              <View style={styles.guideText}>
                <Text style={styles.guideTitleText}>Dashboard</Text>
                <Text style={styles.guideDescText}>View platform statistics and system status</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.guideItem}>
              <MaterialCommunityIcons name="account-multiple" size={24} color={COLORS_ADMIN.primary} />
              <View style={styles.guideText}>
                <Text style={styles.guideTitleText}>Users</Text>
                <Text style={styles.guideDescText}>Manage user accounts and permissions</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.guideItem}>
              <MaterialCommunityIcons name="book" size={24} color={COLORS_ADMIN.primary} />
              <View style={styles.guideText}>
                <Text style={styles.guideTitleText}>Stories</Text>
                <Text style={styles.guideDescText}>Moderate and manage user stories</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.guideItem}>
              <MaterialCommunityIcons name="comment-multiple" size={24} color={COLORS_ADMIN.primary} />
              <View style={styles.guideText}>
                <Text style={styles.guideTitleText}>Comments</Text>
                <Text style={styles.guideDescText}>Review and approve user comments</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <FeatureItem
              icon="magnify"
              title="Advanced Search"
              description="Quickly find users, stories, and comments"
            />
            <FeatureItem
              icon="filter"
              title="Smart Filtering"
              description="Filter by status, condition, and other criteria"
            />
            <FeatureItem
              icon="shield-check"
              title="Moderation Tools"
              description="Block, approve, and manage content"
            />
            <FeatureItem
              icon="analytics"
              title="Real-time Analytics"
              description="Monitor platform activity in real-time"
            />
          </View>
        </View>

        {/* Footer Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={20} color={COLORS_ADMIN.primary} />
            <Text style={styles.infoText}>
              Use the tabs below to navigate to different admin sections. All data is synced in real-time with the backend.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <MaterialCommunityIcons name='star' size={20} color={COLORS_ADMIN.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{description}</Text>
      </View>
    </View>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_ADMIN.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT.xxxl,
    fontWeight: 700,
    color: COLORS_ADMIN.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT.base,
    color: COLORS_ADMIN.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT.lg,
    fontWeight: 600,
    color: COLORS_ADMIN.text,
    marginBottom: SPACING.md,
  },
  guideCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  guideText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  guideTitleText: {
    fontSize: FONT.sm,
    fontWeight: 500,
    color: COLORS_ADMIN.text,
  },
  guideDescText: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  featuresList: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9F9F9',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT.sm,
    fontWeight: 500,
    color: COLORS_ADMIN.text,
  },
  featureDesc: {
    fontSize: FONT.xs,
    color: COLORS_ADMIN.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E6FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: FONT.sm,
    color: COLORS_ADMIN.text,
    lineHeight: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E6FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    zIndex: 10,
  },
  logoutText: {
    color: COLORS_ADMIN.primary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
