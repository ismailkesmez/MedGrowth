import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { HistoryEntry } from '../store/types';
import { getTheme } from '../theme';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { history, settings } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    const takenDate = new Date(item.takenAt);
    const dateStr = takenDate.toLocaleDateString();
    const timeStr = takenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>💊</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: c.text }]}>{item.name}</Text>
          <Text style={[styles.date, { color: c.subtext }]}>
            {t('history.takenAt')}: {dateStr} {timeStr}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: c.subtext }]}>{t('history.empty')}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
});
