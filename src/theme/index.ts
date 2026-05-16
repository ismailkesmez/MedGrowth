export const lightTheme = {
  dark: false,
  colors: {
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#1A1A2E',
    subtext: '#666680',
    border: '#E0E0EE',
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    secondary: '#2196F3',
    accent: '#FF9800',
    danger: '#F44336',
    xpBar: '#4CAF50',
    xpBarBg: '#C8E6C9',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E0E0EE',
    tabActive: '#4CAF50',
    tabInactive: '#9E9E9E',
    inputBg: '#F0F0F5',
    shadow: '#00000020',
    achievementBg: '#E8F5E9',
    achievementBorder: '#A5D6A7',
    badge: '#FF5722',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: '#0D1117',
    card: '#161B22',
    text: '#E6EDF3',
    subtext: '#8B949E',
    border: '#30363D',
    primary: '#3FB950',
    primaryDark: '#2EA043',
    secondary: '#58A6FF',
    accent: '#F0883E',
    danger: '#F85149',
    xpBar: '#3FB950',
    xpBarBg: '#0D4429',
    tabBar: '#161B22',
    tabBarBorder: '#30363D',
    tabActive: '#3FB950',
    tabInactive: '#484F58',
    inputBg: '#21262D',
    shadow: '#00000060',
    achievementBg: '#0D2818',
    achievementBorder: '#196C2E',
    badge: '#DA3633',
  },
};

export type Theme = typeof lightTheme;

export function getTheme(isDark: boolean): Theme {
  return isDark ? darkTheme : lightTheme;
}
