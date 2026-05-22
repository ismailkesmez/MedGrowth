import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Switch, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { getTheme } from '../theme';
import { getLevelFromXp } from '../store/types';
import i18n from '../i18n';

const ADMIN_PASSWORD = '1234234';
const REQUIRED_TAPS = 10;
const TAP_RESET_MS = 10000; // 10 saniye içinde tamamlanmazsa sıfırla

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const { settings, updateSettings, resetAll, user, setUser, unlockAllAchievements } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;

  // --- Gizli admin giriş ---
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loginVisible, setLoginVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);

  // Admin panel düzenleme değerleri
  const [editXp, setEditXp] = useState('');
  const [editMeds, setEditMeds] = useState('');
  const [editStreak, setEditStreak] = useState('');
  const [editTapMult, setEditTapMult] = useState('');
  const [editMonsterAt, setEditMonsterAt] = useState('');

  const handleTrTap = () => {
    handleLanguage('tr');

    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= REQUIRED_TAPS) {
      tapCount.current = 0;
      setLoginVisible(true);
      setPassword('');
      setPwError(false);
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, TAP_RESET_MS);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setLoginVisible(false);
      setPassword('');
      setPwError(false);
      // Admin panelini aç, mevcut değerleri doldur
      setEditXp(String(user?.currentXp ?? 0));
      setEditMeds(String(user?.totalMedsCount ?? 0));
      setEditStreak(String(user?.streakCount ?? 0));
      setEditTapMult(String(settings.adminTapMultiplier ?? 0));
      setEditMonsterAt(String(settings.monsterUnlockAt ?? 100000));
      setAdminVisible(true);
    } else {
      setPwError(true);
    }
  };

  const handleAdminSave = async () => {
    if (!user) return;
    const newXp       = Math.max(0, parseInt(editXp,       10) || 0);
    const newMeds     = Math.max(0, parseInt(editMeds,     10) || 0);
    const newStreak   = Math.max(0, parseInt(editStreak,   10) || 0);
    const newTapMult  = Math.max(0, parseInt(editTapMult,  10) || 0);
    const newMonsterAt = Math.max(1, parseInt(editMonsterAt, 10) || 100000);
    await setUser({
      ...user,
      currentXp: newXp,
      totalMedsCount: newMeds,
      streakCount: newStreak,
      level: getLevelFromXp(newXp),
    });
    await updateSettings({ adminTapMultiplier: newTapMult, monsterUnlockAt: newMonsterAt });
    setAdminVisible(false);
    navigation.navigate('Profile');
  };

  // --- Normal ayarlar ---
  const handleLanguage = async (lang: 'tr' | 'en') => {
    await updateSettings({ language: lang });
    i18n.changeLanguage(lang);
  };

  const handleTheme = async (isDark: boolean) => {
    await updateSettings({ theme: isDark ? 'dark' : 'light' });
  };

  const handleReset = () => {
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirmMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.yes'), style: 'destructive', onPress: resetAll },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Dil */}
      <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.subtext }]}>{t('settings.language')}</Text>
        <View style={styles.langRow}>
          {/* Türkçe butonu — 10 kez basınca admin giriş açılır */}
          <TouchableOpacity
            style={[
              styles.langBtn,
              { borderColor: c.border },
              settings.language === 'tr' && { backgroundColor: c.primary },
            ]}
            onPress={handleTrTap}
            activeOpacity={0.8}
          >
            <Text style={[styles.langBtnText, { color: settings.language === 'tr' ? '#fff' : c.text }]}>
              🇹🇷 {t('settings.turkish')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langBtn,
              { borderColor: c.border },
              settings.language === 'en' && { backgroundColor: c.primary },
            ]}
            onPress={() => handleLanguage('en')}
            activeOpacity={0.8}
          >
            <Text style={[styles.langBtnText, { color: settings.language === 'en' ? '#fff' : c.text }]}>
              🇬🇧 {t('settings.english')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tema */}
      <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.sectionTitle, { color: c.subtext }]}>{t('settings.theme')}</Text>
        <View style={styles.themeRow}>
          <Text style={[styles.themeLabel, { color: c.text }]}>
            {settings.theme === 'dark' ? '🌙 ' + t('settings.dark') : '☀️ ' + t('settings.light')}
          </Text>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={handleTheme}
            trackColor={{ false: c.border, true: c.primary }}
            thumbColor={settings.theme === 'dark' ? c.primary : '#fff'}
          />
        </View>
      </View>

      {/* Versiyon */}
      <Text style={[styles.version, { color: c.subtext }]}>V0.2</Text>

      {/* Sıfırla */}
      <TouchableOpacity
        style={[styles.resetBtn, { borderColor: c.danger }]}
        onPress={handleReset}
        activeOpacity={0.8}
      >
        <Text style={[styles.resetText, { color: c.danger }]}>🗑 {t('settings.resetData')}</Text>
      </TouchableOpacity>

      {/* Yönetici Giriş Modali */}
      <Modal visible={loginVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.loginCard, { backgroundColor: c.card }]}>
            <Text style={[styles.loginTitle, { color: c.text }]}>🔐 Yönetici Girişi</Text>
            <Text style={[styles.loginSub, { color: c.subtext }]}>Şifrenizi girin</Text>
            <TextInput
              style={[
                styles.pwInput,
                { backgroundColor: c.inputBg, color: c.text, borderColor: pwError ? c.danger : c.border },
              ]}
              placeholder="Şifre"
              placeholderTextColor={c.subtext}
              value={password}
              onChangeText={v => { setPassword(v); setPwError(false); }}
              secureTextEntry
              keyboardType="number-pad"
              autoFocus
            />
            {pwError && (
              <Text style={[styles.errorText, { color: c.danger }]}>Hatalı şifre</Text>
            )}
            <View style={styles.loginActions}>
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: c.border }]}
                onPress={() => { setLoginVisible(false); setPassword(''); setPwError(false); }}
              >
                <Text style={{ color: c.text }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: c.primary }]}
                onPress={handlePasswordSubmit}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Giriş</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Yönetici Paneli Modali */}
      <Modal visible={adminVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.adminCard, { backgroundColor: c.card }]}>
            <Text style={[styles.loginTitle, { color: c.text }]}>⚙️ Yönetici Paneli</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* ── Kullanıcı verileri ── */}
              <Text style={[styles.groupLabel, { color: c.primary }]}>Kullanıcı Verileri</Text>

              <Text style={[styles.fieldLabel, { color: c.subtext }]}>Toplam XP</Text>
              <TextInput
                style={[styles.pwInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
                value={editXp}
                onChangeText={setEditXp}
                keyboardType="number-pad"
                placeholder="XP miktarı"
                placeholderTextColor={c.subtext}
              />

              <Text style={[styles.fieldLabel, { color: c.subtext }]}>Toplam İçilen İlaç</Text>
              <TextInput
                style={[styles.pwInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
                value={editMeds}
                onChangeText={setEditMeds}
                keyboardType="number-pad"
                placeholder="İlaç sayısı"
                placeholderTextColor={c.subtext}
              />

              <Text style={[styles.fieldLabel, { color: c.subtext }]}>Giriş Serisi</Text>
              <TextInput
                style={[styles.pwInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
                value={editStreak}
                onChangeText={setEditStreak}
                keyboardType="number-pad"
                placeholder="Giriş serisi"
                placeholderTextColor={c.subtext}
              />

              {/* ── Tıklama ayarları ── */}
              <Text style={[styles.groupLabel, { color: c.primary }]}>Tıklama Ayarları</Text>

              <Text style={[styles.fieldLabel, { color: c.subtext }]}>
                Tıklama Çarpanı{' '}
                <Text style={{ color: c.accent }}>
                  {(() => {
                    const v = parseInt(editTapMult, 10) || 0;
                    return v > 0 ? `(×${v} aktif)` : '(0 = normal satın alma sistemi)';
                  })()}
                </Text>
              </Text>
              <TextInput
                style={[styles.pwInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
                value={editTapMult}
                onChangeText={setEditTapMult}
                keyboardType="number-pad"
                placeholder="0 = devre dışı"
                placeholderTextColor={c.subtext}
              />

              <Text style={[styles.fieldLabel, { color: c.subtext }]}>Canavar Ağaç Kilit Eşiği (tıklama)</Text>
              <TextInput
                style={[styles.pwInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
                value={editMonsterAt}
                onChangeText={setEditMonsterAt}
                keyboardType="number-pad"
                placeholder="100000"
                placeholderTextColor={c.subtext}
              />

              {/* Tüm başarıları aç */}
              <TouchableOpacity
                style={[styles.unlockBtn, { backgroundColor: c.accent }]}
                onPress={async () => {
                  await unlockAllAchievements();
                  Alert.alert('✅', 'Tüm başarılar kilidi açıldı ve XP\'ler eklendi.');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.unlockBtnText}>🏆 Tüm Başarıları Aç</Text>
              </TouchableOpacity>

            </ScrollView>

            <View style={styles.loginActions}>
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: c.border }]}
                onPress={() => setAdminVisible(false)}
              >
                <Text style={{ color: c.text }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: c.primary }]}
                onPress={handleAdminSave}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: { flex: 1, borderRadius: 10, borderWidth: 1.5, padding: 12, alignItems: 'center' },
  langBtnText: { fontSize: 15, fontWeight: '600' },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeLabel: { fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  resetBtn: { borderRadius: 16, borderWidth: 2, padding: 18, alignItems: 'center', marginTop: 8 },
  resetText: { fontSize: 16, fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: '#00000088',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  loginCard: {
    width: '100%', borderRadius: 20, padding: 24,
  },
  adminCard: {
    width: '100%', borderRadius: 20, padding: 24,
  },
  loginTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  loginSub: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  pwInput: {
    borderRadius: 12, borderWidth: 1.5,
    padding: 14, fontSize: 16, marginBottom: 8,
  },
  errorText: { fontSize: 13, marginBottom: 8, marginLeft: 2 },
  loginActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  loginBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  groupLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 16, marginBottom: 4 },
  unlockBtn: {
    borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16,
  },
  unlockBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
