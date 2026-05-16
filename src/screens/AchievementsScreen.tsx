import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { ACHIEVEMENT_THRESHOLDS, ACHIEVEMENT_NAMES, TAP_ACHIEVEMENTS } from '../store/types';
import { getTheme } from '../theme';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const { user, settings, claimAchievement, claimTapAchievement } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;

  if (!user) return null;

  const handleClaim = async (threshold: number) => {
    await claimAchievement(threshold);
  };

  const getStatus = (threshold: number) => {
    if (user.claimedAchievements.includes(threshold)) return 'claimed';
    if (user.totalMedsCount >= threshold) return 'available';
    return 'locked';
  };

  const renderItem = ({ item: threshold }: { item: number }) => {
    const status = getStatus(threshold);
    const name = ACHIEVEMENT_NAMES[threshold] || `${threshold} Eşiği`;
    const passiveVal = (threshold * 0.1 / 50).toFixed(2);

    const bgColor = status === 'claimed'
      ? c.achievementBg
      : status === 'available'
        ? c.primary + '18'
        : c.card;

    const borderColor = status === 'claimed'
      ? c.achievementBorder
      : status === 'available'
        ? c.primary
        : c.border;

    return (
      <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
        <View style={styles.left}>
          <View style={styles.titleRow}>
            {status === 'available' && (
              <Text style={[styles.badge, { backgroundColor: c.badge }]}>!</Text>
            )}
            <Text style={[styles.name, { color: c.text }]}>{name}</Text>
          </View>
          <Text style={[styles.threshold, { color: c.subtext }]}>
            {t('achievements.threshold', { count: threshold })}
          </Text>
          <Text style={[styles.passive, { color: c.accent }]}>
            {t('achievements.passive', { val: passiveVal })}
          </Text>
        </View>
        <View style={styles.right}>
          {status === 'claimed' ? (
            <Text style={[styles.claimedBadge, { color: c.primary }]}>✓</Text>
          ) : status === 'available' ? (
            <TouchableOpacity
              style={[styles.claimBtn, { backgroundColor: c.primary }]}
              onPress={() => handleClaim(threshold)}
              activeOpacity={0.8}
            >
              <Text style={styles.claimBtnText}>{t('achievements.claim')}</Text>
              <Text style={styles.claimXp}>+{threshold} XP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.lockedText, { color: c.subtext }]}>
              {user.totalMedsCount}/{threshold}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const tapCoins = user.tapCoins ?? 0;
  const claimedTapAchievements = user.claimedTapAchievements ?? [];
  const monsterUnlockAt = settings.monsterUnlockAt ?? 100000;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* ── Gizli Tıklama Başarımları — herhangi biri görünür olunca bölüm çıkar ── */}
      {TAP_ACHIEVEMENTS.some(a => tapCoins >= monsterUnlockAt || claimedTapAchievements.includes(a.id)) && (
      <View style={[styles.tapSection, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.tapSectionTitle, { color: c.text }]}>👆 Gizli Tıklama Başarımları</Text>
        {TAP_ACHIEVEMENTS.map(ach => {
          const claimed   = claimedTapAchievements.includes(ach.id);
          const available = tapCoins >= monsterUnlockAt && !claimed;
          const progress  = Math.min(tapCoins / monsterUnlockAt, 1);

          // Eşiğe ulaşılmadan tamamen gizli
          if (tapCoins < monsterUnlockAt && !claimed) return null;

          return (
            <View
              key={ach.id}
              style={[
                styles.tapCard,
                {
                  borderColor: claimed ? c.achievementBorder : available ? c.primary : c.border,
                  backgroundColor: claimed ? c.achievementBg : available ? c.primary + '18' : undefined,
                },
              ]}
            >
              <View style={styles.tapLeft}>
                <View style={styles.titleRow}>
                  {available && <Text style={[styles.badge, { backgroundColor: c.badge }]}>!</Text>}
                  <Text style={[styles.name, { color: c.text }]}>{ach.emoji} {ach.name}</Text>
                </View>
                <Text style={[styles.threshold, { color: c.subtext }]}>{ach.desc}</Text>
                {/* İlerleme çubuğu */}
                {!claimed && (
                  <View style={styles.tapBarWrap}>
                    <View style={[styles.tapBarBg, { backgroundColor: c.xpBarBg }]}>
                      <View style={[styles.tapBarFill, { width: `${progress * 100}%`, backgroundColor: available ? c.primary : c.subtext }]} />
                    </View>
                    <Text style={[styles.tapBarLabel, { color: c.subtext }]}>
                      {tapCoins.toLocaleString()} / {ach.threshold.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.right}>
                {claimed ? (
                  <Text style={[styles.claimedBadge, { color: c.primary }]}>✓</Text>
                ) : available ? (
                  <TouchableOpacity
                    style={[styles.claimBtn, { backgroundColor: c.primary }]}
                    onPress={() => claimTapAchievement(ach.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.claimBtnText}>Talep Et</Text>
                    <Text style={styles.claimXp}>+{ach.reward.toLocaleString()} XP</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.lockedText, { color: c.subtext }]}>🔒</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
      )}

      <FlatList
        data={ACHIEVEMENT_THRESHOLDS}
        renderItem={renderItem}
        keyExtractor={i => i.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  tapSection: {
    margin: 16, marginBottom: 0,
    borderRadius: 16, borderWidth: 1,
    padding: 14,
  },
  tapSectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  tapCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1.5,
    padding: 12,
  },
  tapLeft: { flex: 1 },
  tapBarWrap: { marginTop: 8 },
  tapBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  tapBarFill: { height: '100%', borderRadius: 3 },
  tapBarLabel: { fontSize: 11 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    padding: 14, marginBottom: 10,
  },
  left: { flex: 1 },
  right: { marginLeft: 12, alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  badge: {
    color: '#fff', fontWeight: '800', fontSize: 12,
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
    marginRight: 6,
  },
  name: { fontSize: 15, fontWeight: '700' },
  threshold: { fontSize: 12, marginBottom: 2 },
  passive: { fontSize: 12, fontWeight: '600' },
  claimBtn: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center',
  },
  claimBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  claimXp: { color: '#ffffffcc', fontSize: 11, marginTop: 2 },
  claimedBadge: { fontSize: 28, fontWeight: '800' },
  lockedText: { fontSize: 13 },
});
