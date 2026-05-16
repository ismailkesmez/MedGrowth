import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSchema, MedicationSchema, HistoryEntry } from './types';

const KEYS = {
  USER: '@medgrowth_user',
  MEDICATIONS: '@medgrowth_medications',
  HISTORY: '@medgrowth_history',
  SETTINGS: '@medgrowth_settings',
};

export interface AppSettings {
  language: 'tr' | 'en';
  theme: 'light' | 'dark';
  adminTapMultiplier?: number; // 0 veya undefined = normal TAP_POWER sistemi
  monsterUnlockAt?: number;   // undefined = varsayılan 100000
}

export async function getUser(): Promise<UserSchema | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function saveUser(user: UserSchema): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function getMedications(): Promise<MedicationSchema[]> {
  const raw = await AsyncStorage.getItem(KEYS.MEDICATIONS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveMedications(meds: MedicationSchema[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.MEDICATIONS, JSON.stringify(meds));
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.HISTORY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveHistory(history: HistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : { language: 'tr', theme: 'light' };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.USER, KEYS.MEDICATIONS, KEYS.HISTORY, KEYS.SETTINGS]);
}
