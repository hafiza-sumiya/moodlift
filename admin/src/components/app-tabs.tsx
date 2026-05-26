import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#8E48BB',
  background: '#FFFFFF',
  text: '#333333',
  tabInactive: '#999999',
};

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
          paddingBottom: 15,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -5,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabInactive,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size || 24} />
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-box" color={color} size={size || 24} />
          ),
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" color={color} size={size || 24} />
          ),
        }}
      />

      <Tabs.Screen
        name="stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book" color={color} size={size || 24} />
          ),
        }}
      />

      <Tabs.Screen
        name="comments"
        options={{
          title: 'Comments',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="comment-multiple" color={color} size={size || 24} />
          ),
        }}
      />

      <Tabs.Screen
        name="login"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
