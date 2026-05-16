import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { getLevelFromXp, getXpForCurrentLevel, xpNeededForNextLevel } from '../store/types';
import { getTheme } from '../theme';

function GenderAvatar({ gender }: { gender: 'male' | 'female' }) {
  const isMale = gender === 'male';
  const bg = isMale ? '#1565C0' : '#AD1457';
  const mid = isMale ? '#1976D2' : '#C2185B';
  return (
    <Svg width={60} height={60} viewBox="0 0 60 60">
      <Circle cx={30} cy={30} r={30} fill={bg} />
      <Circle cx={30} cy={30} r={24} fill={mid} />
      {/* Head */}
      <Circle cx={30} cy={18} r={9} fill="#fff" />
      {isMale ? (
        /* Broad shoulder silhouette */
        <Path d="M 10,54 C 10,38 50,38 50,54" fill="#fff" />
      ) : (
        /* Dress silhouette */
        <Path d="M 22,36 L 10,54 L 50,54 L 38,36 C 34,39 26,39 22,36 Z" fill="#fff" />
      )}
    </Svg>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, settings } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;

  if (!user) return null;

  const level = getLevelFromXp(user.currentXp);
  const xpInLevel = getXpForCurrentLevel(user.currentXp);
  const xpNeeded = xpNeededForNextLevel(level);
  const xpProgress = xpInLevel / xpNeeded;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Level & XP */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.levelRow}>
          <Text style={[styles.levelLabel, { color: c.subtext }]}>{t('profile.level')}</Text>
          <Text style={[styles.levelNum, { color: c.primary }]}>{level}</Text>
        </View>
        <View style={[styles.xpBarBg, { backgroundColor: c.xpBarBg }]}>
          <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%`, backgroundColor: c.xpBar }]} />
        </View>
        <Text style={[styles.xpText, { color: c.subtext }]}>
          {xpInLevel} / {xpNeeded} XP
        </Text>
      </View>

      {/* User info */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.userInfoRow}>
          <View style={styles.userTextCol}>
            <Text style={[styles.userName, { color: c.text }]}>{user.name}</Text>
            <Text style={[styles.userAge, { color: c.subtext }]}>{user.age} yaş</Text>
          </View>
          {user.gender && <GenderAvatar gender={user.gender} />}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={[styles.statValue, { color: c.primary }]}>{user.streakCount}</Text>
          <Text style={[styles.statLabel, { color: c.subtext }]}>{t('profile.streak')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.statEmoji}>💊</Text>
          <Text style={[styles.statValue, { color: c.primary }]}>{user.totalMedsCount}</Text>
          <Text style={[styles.statLabel, { color: c.subtext }]}>{t('profile.totalMeds')}</Text>
        </View>
      </View>

      {/* Total XP */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, alignItems: 'center' }]}>
        <Text style={styles.statEmoji}>⭐</Text>
        <Text style={[styles.totalXpValue, { color: c.accent }]}>{user.currentXp} XP</Text>
        <Text style={[styles.statLabel, { color: c.subtext }]}>Toplam XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderRadius: 16, borderWidth: 1,
    padding: 18, marginBottom: 14,
  },
  levelRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  levelLabel: { fontSize: 15, fontWeight: '600' },
  levelNum: { fontSize: 28, fontWeight: '800' },
  xpBarBg: {
    height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 6,
  },
  xpBarFill: { height: '100%', borderRadius: 6 },
  xpText: { fontSize: 12, textAlign: 'right' },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userTextCol: { flex: 1 },
  userName: { fontSize: 22, fontWeight: '700' },
  userAge: { fontSize: 15, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    padding: 16, alignItems: 'center',
  },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  totalXpValue: { fontSize: 32, fontWeight: '800', marginVertical: 4 },
});
