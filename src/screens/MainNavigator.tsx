import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { getTheme } from '../theme';
import ReminderScreen from './ReminderScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';
import AchievementsScreen from './AchievementsScreen';
import TreeScreen from './TreeScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Reminder: '💊',
  History: '📋',
  Profile: '👤',
  Achievements: '🏆',
  Tree: '🌳',
  Settings: '⚙️',
};

export default function MainNavigator() {
  const { t } = useTranslation();
  const { settings } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;

  return (
    <Tab.Navigator
      initialRouteName="Reminder"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {ICONS[route.name]}
          </Text>
        ),
        tabBarActiveTintColor: c.tabActive,
        tabBarInactiveTintColor: c.tabInactive,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, marginBottom: 2 },
        headerStyle: { backgroundColor: c.card, borderBottomColor: c.border, borderBottomWidth: 1 },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen
        name="Reminder"
        component={ReminderScreen}
        options={{ title: t('tabs.reminder'), tabBarLabel: t('tabs.reminder') }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: t('tabs.history'), tabBarLabel: t('tabs.history') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('tabs.profile'), tabBarLabel: t('tabs.profile') }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: t('tabs.achievements'), tabBarLabel: t('tabs.achievements') }}
      />
      <Tab.Screen
        name="Tree"
        component={TreeScreen}
        options={{ title: t('tabs.tree'), tabBarLabel: t('tabs.tree') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('tabs.settings'), tabBarLabel: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
}
