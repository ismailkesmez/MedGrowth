import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { UserSchema, MONSTER_MAX_HP } from '../store/types';
import { getTheme } from '../theme';

function PersonIcon({ gender }: { gender: 'male' | 'female' }) {
  const isMale = gender === 'male';
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={12} r={7} fill="#fff" />
      {isMale ? (
        <Path d="M 7,38 C 7,26 33,26 33,38" fill="#fff" />
      ) : (
        <Path d="M 15,26 L 7,38 L 33,38 L 25,26 C 22,28 18,28 15,26 Z" fill="#fff" />
      )}
    </Svg>
  );
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { settings, setUser } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  const handleStart = async () => {
    if (!name.trim()) {
      Alert.alert('', t('onboarding.nameRequired'));
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert('', t('onboarding.ageRequired'));
      return;
    }
    if (!gender) {
      Alert.alert('', t('onboarding.genderRequired'));
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newUser: UserSchema = {
      name: name.trim(),
      age: Number(age),
      gender,
      level: 1,
      currentXp: 0,
      totalMedsCount: 0,
      streakCount: 1,
      lastLoginDate: today,
      unlockedTrees: ['default'],
      activeTreeSkin: 'default',
      claimedAchievements: [],
      treeXp: { default: 0 },
      tapCoins: 0,
      tapPower: 0,
      monsterHp: MONSTER_MAX_HP,
      claimedTapAchievements: [],
    };
    await setUser(newUser);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: c.background }]}
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>🌱</Text>
        <Text style={[styles.title, { color: c.text }]}>{t('onboarding.title')}</Text>
        <Text style={[styles.subtitle, { color: c.subtext }]}>{t('onboarding.subtitle')}</Text>

        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
          placeholder={t('onboarding.namePlaceholder')}
          placeholderTextColor={c.subtext}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
          placeholder={t('onboarding.agePlaceholder')}
          placeholderTextColor={c.subtext}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          maxLength={3}
        />

        <Text style={[styles.genderLabel, { color: c.subtext }]}>{t('onboarding.gender')}</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[
              styles.genderBtn,
              { borderColor: gender === 'male' ? '#1565C0' : c.border, backgroundColor: gender === 'male' ? '#1565C0' : c.inputBg },
            ]}
            onPress={() => setGender('male')}
            activeOpacity={0.8}
          >
            <View style={[styles.genderIconBg, { backgroundColor: gender === 'male' ? '#1976D2' : c.border }]}>
              <PersonIcon gender="male" />
            </View>
            <Text style={[styles.genderBtnText, { color: gender === 'male' ? '#fff' : c.text }]}>
              {t('onboarding.male')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderBtn,
              { borderColor: gender === 'female' ? '#AD1457' : c.border, backgroundColor: gender === 'female' ? '#AD1457' : c.inputBg },
            ]}
            onPress={() => setGender('female')}
            activeOpacity={0.8}
          >
            <View style={[styles.genderIconBg, { backgroundColor: gender === 'female' ? '#C2185B' : c.border }]}>
              <PersonIcon gender="female" />
            </View>
            <Text style={[styles.genderBtnText, { color: gender === 'female' ? '#fff' : c.text }]}>
              {t('onboarding.female')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: c.primary }]}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t('onboarding.startButton')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, marginBottom: 36, textAlign: 'center' },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  genderLabel: { fontSize: 14, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 10 },
  genderRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 20 },
  genderBtn: {
    flex: 1, borderRadius: 14, borderWidth: 2,
    paddingVertical: 14, alignItems: 'center', gap: 8,
  },
  genderIconBg: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  genderBtnText: { fontSize: 15, fontWeight: '700' },
  button: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
