import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal, View, Text, TouchableOpacity, Animated, StyleSheet,
} from 'react-native';
import { UserSchema, MedicationSchema, HistoryEntry, getLevelFromXp, getPassiveBonus, ACHIEVEMENT_THRESHOLDS, TAP_POWER_UPGRADES, MONSTER_MAX_HP, TAP_ACHIEVEMENTS } from './types';
import * as storage from './storage';
import { AppSettings } from './storage';
import {
  requestNotificationPermission,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
} from '../utils/notifications';

interface AppContextType {
  user: UserSchema | null;
  medications: MedicationSchema[];
  history: HistoryEntry[];
  settings: AppSettings;
  isLoading: boolean;
  setUser: (u: UserSchema) => Promise<void>;
  addMedication: (med: MedicationSchema) => Promise<void>;
  addMedications: (meds: MedicationSchema[]) => Promise<void>;
  takeMedication: (id: string) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  resetAll: () => Promise<void>;
  claimAchievement: (threshold: number) => Promise<void>;
  unlockAllAchievements: () => Promise<void>;
  buyTreeSkin: (skinId: string, cost: number) => Promise<void>;
  setActiveTree: (skinId: string) => Promise<void>;
  tapTree: () => Promise<void>;
  buyTapPower: (level: number, cost: number) => Promise<void>;
  claimTapAchievement: (id: string) => Promise<void>;
  popBubble: () => Promise<void>;
  refreshData: () => Promise<void>;
  pendingLevelUp: number | null;
  clearLevelUp: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserSchema | null>(null);
  const [medications, setMedications] = useState<MedicationSchema[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ language: 'tr', theme: 'light' });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null);
  const clearLevelUp = () => setPendingLevelUp(null);

  const refreshData = useCallback(async () => {
    const [u, meds, hist, s] = await Promise.all([
      storage.getUser(),
      storage.getMedications(),
      storage.getHistory(),
      storage.getSettings(),
    ]);
    if (u) {
      let dirty = false;
      const today = new Date().toISOString().split('T')[0];
      if (u.lastLoginDate !== today) {
        u.streakCount = (u.streakCount || 0) + 1;
        u.lastLoginDate = today;
        u.level = getLevelFromXp(u.currentXp);
        dirty = true;
      }
      // Migration: tapCoins / tapPower yoksa başlat
      if (u.tapCoins === undefined) { u.tapCoins = 0; dirty = true; }
      if (u.tapPower === undefined) { u.tapPower = 0; dirty = true; }
      if (u.monsterHp === undefined) { u.monsterHp = MONSTER_MAX_HP; dirty = true; }
      if (!u.claimedTapAchievements) { u.claimedTapAchievements = []; dirty = true; }
      // Migration: seed treeXp for users created before this field existed
      if (!u.treeXp) {
        u.treeXp = {};
        for (const id of u.unlockedTrees) {
          u.treeXp[id] = u.currentXp;
        }
        dirty = true;
      }
      if (dirty) await storage.saveUser(u);
    }
    setUserState(u);
    setMedications(meds);
    setHistory(hist);
    setSettings(s);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    refreshData().finally(() => setIsLoading(false));
  }, []);

  const setUser = async (u: UserSchema) => {
    await storage.saveUser(u);
    setUserState(u);
  };

  const addMedication = async (med: MedicationSchema) => {
    const notifId = await scheduleNotification(
      med.id,
      med.name,
      med.date,
      med.time,
      settings.language
    );
    const medWithNotif: MedicationSchema = notifId
      ? { ...med, notificationId: notifId }
      : med;

    const updated = [...medications, medWithNotif];
    await storage.saveMedications(updated);
    setMedications(updated);
  };

  // Birden fazla ilacı tek seferde kaydeder — stale closure sorununu önler
  const addMedications = async (meds: MedicationSchema[]) => {
    const withNotifs: MedicationSchema[] = [];
    for (const med of meds) {
      const notifId = await scheduleNotification(med.id, med.name, med.date, med.time, settings.language);
      withNotifs.push(notifId ? { ...med, notificationId: notifId } : med);
    }
    const updated = [...medications, ...withNotifs];
    await storage.saveMedications(updated);
    setMedications(updated);
  };

  const takeMedication = async (id: string) => {
    if (!user) return;
    const med = medications.find(m => m.id === id);
    if (!med) return;

    if (med.notificationId) {
      await cancelNotification(med.notificationId);
    }

    const passive = getPassiveBonus(user.claimedAchievements);
    const xpGained = 5 + passive;
    const newXp = user.currentXp + xpGained;
    const newTotal = user.totalMedsCount + 1;
    const newLevel = getLevelFromXp(newXp);

    // All owned trees grow by the same XP amount
    const updatedTreeXp = { ...(user.treeXp || {}) };
    for (const treeId of user.unlockedTrees) {
      updatedTreeXp[treeId] = (updatedTreeXp[treeId] ?? 0) + xpGained;
    }

    const updatedUser: UserSchema = {
      ...user,
      currentXp: newXp,
      totalMedsCount: newTotal,
      level: newLevel,
      treeXp: updatedTreeXp,
    };

    if (newLevel > user.level) {
      setPendingLevelUp(newLevel);
    }

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      name: med.name,
      addedDate: med.date,
      takenAt: new Date().toISOString(),
    };

    const updatedMeds = medications.filter(m => m.id !== id);

    const recurringMeds = medications.filter(m => m.name === med.name && m.id !== id);
    if (recurringMeds.length === 0) {
      const existingRecurring = medications.find(m => m.name === med.name && m.isRecurring);
      if (!existingRecurring) {
        const takenBefore = history.some(h => h.name === med.name);
        if (takenBefore) {
          const recurringVersion: MedicationSchema = { ...med, isRecurring: true, notificationId: undefined };
          await storage.saveMedications([...updatedMeds, recurringVersion]);
          setMedications([...updatedMeds, recurringVersion]);
        } else {
          await storage.saveMedications(updatedMeds);
          setMedications(updatedMeds);
        }
      } else {
        await storage.saveMedications(updatedMeds);
        setMedications(updatedMeds);
      }
    } else {
      await storage.saveMedications(updatedMeds);
      setMedications(updatedMeds);
    }

    const updatedHistory = [entry, ...history];
    await storage.saveHistory(updatedHistory);
    setHistory(updatedHistory);
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const removeMedication = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med?.notificationId) {
      await cancelNotification(med.notificationId);
    }
    const updated = medications.filter(m => m.id !== id);
    await storage.saveMedications(updated);
    setMedications(updated);
  };

  const updateSettings = async (s: Partial<AppSettings>) => {
    const updated = { ...settings, ...s };
    await storage.saveSettings(updated);
    setSettings(updated);
  };

  const resetAll = async () => {
    await cancelAllNotifications();
    await storage.clearAllData();
    setUserState(null);
    setMedications([]);
    setHistory([]);
    setSettings({ language: 'tr', theme: 'light' });
  };

  const claimAchievement = async (threshold: number) => {
    if (!user) return;
    if (user.claimedAchievements.includes(threshold)) return;
    const newXp = user.currentXp + threshold;
    const updatedUser: UserSchema = {
      ...user,
      currentXp: newXp,
      level: getLevelFromXp(newXp),
      claimedAchievements: [...user.claimedAchievements, threshold],
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const unlockAllAchievements = async () => {
    if (!user) return;
    const unclaimed = ACHIEVEMENT_THRESHOLDS.filter(
      th => !user.claimedAchievements.includes(th)
    );
    if (unclaimed.length === 0) return;
    const bonusXp = unclaimed.reduce((sum, th) => sum + th, 0);
    const newXp = user.currentXp + bonusXp;
    const updatedUser: UserSchema = {
      ...user,
      currentXp: newXp,
      level: getLevelFromXp(newXp),
      claimedAchievements: [...ACHIEVEMENT_THRESHOLDS],
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const buyTreeSkin = async (skinId: string, cost: number) => {
    if (!user) return;
    if (user.currentXp < cost) return;
    const updatedUser: UserSchema = {
      ...user,
      currentXp: user.currentXp - cost,
      level: getLevelFromXp(user.currentXp - cost),
      unlockedTrees: [...user.unlockedTrees, skinId],
      activeTreeSkin: skinId,
      treeXp: { ...(user.treeXp || {}), [skinId]: 0 }, // new tree starts growing from 0
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const tapTree = async () => {
    if (!user) return;
    const power = user.tapPower ?? 0;
    const baseMultiplier = power === 0 ? 1 : TAP_POWER_UPGRADES[power - 1].multiplier;
    const adminMult = settings.adminTapMultiplier ?? 0;
    const multiplier = adminMult > 0 ? adminMult : baseMultiplier;
    const oldCoins = user.tapCoins ?? 0;
    const newTapCoins = oldCoins + multiplier;

    const skinId = user.activeTreeSkin;
    const updatedTreeXp = { ...(user.treeXp || {}) };

    // Monster ağacında tıklama HP azaltır, XP büyütmez
    let newMonsterHp = user.monsterHp ?? MONSTER_MAX_HP;
    let newUnlockedTrees = [...user.unlockedTrees];
    if (skinId === 'monster') {
      newMonsterHp = Math.max(0, newMonsterHp - multiplier);
      // Monster yenilince Tanrı Ağacı'nı otomatik aç
      if (newMonsterHp === 0 && !newUnlockedTrees.includes('god')) {
        newUnlockedTrees = [...newUnlockedTrees, 'god'];
      }
    } else {
      // 100'ün katı geçildikçe aktif ağaca XP ekle
      const oldMilestone = Math.floor(oldCoins / 100);
      const newMilestone = Math.floor(newTapCoins / 100);
      if (newMilestone > oldMilestone) {
        updatedTreeXp[skinId] = (updatedTreeXp[skinId] ?? 0) + (newMilestone - oldMilestone);
      }
    }

    const updatedUser: UserSchema = {
      ...user,
      tapCoins: newTapCoins,
      treeXp: updatedTreeXp,
      monsterHp: newMonsterHp,
      unlockedTrees: newUnlockedTrees,
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const buyTapPower = async (level: number, cost: number) => {
    if (!user) return;
    if (user.currentXp < cost) return;
    const newXp = user.currentXp - cost;
    const updatedUser: UserSchema = {
      ...user,
      currentXp: newXp,
      level: getLevelFromXp(newXp),
      tapPower: level,
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const claimTapAchievement = async (id: string) => {
    if (!user) return;
    if ((user.claimedTapAchievements ?? []).includes(id)) return;
    const achievement = TAP_ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;
    const newXp = user.currentXp + achievement.reward;
    const updatedUser: UserSchema = {
      ...user,
      currentXp: newXp,
      level: getLevelFromXp(newXp),
      claimedTapAchievements: [...(user.claimedTapAchievements ?? []), id],
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const popBubble = async () => {
    if (!user) return;
    const newXp = Math.max(0, user.currentXp - 5);
    const newHp = Math.min(MONSTER_MAX_HP, (user.monsterHp ?? MONSTER_MAX_HP) + 100);
    const updatedUser: UserSchema = {
      ...user,
      currentXp: newXp,
      level: getLevelFromXp(newXp),
      monsterHp: newHp,
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  const setActiveTree = async (skinId: string) => {
    if (!user) return;
    const updatedUnlocked = user.unlockedTrees.includes(skinId)
      ? user.unlockedTrees
      : [...user.unlockedTrees, skinId];
    const updatedTreeXp = {
      ...(user.treeXp || {}),
      [skinId]: user.treeXp?.[skinId] ?? 0,
    };
    const updatedUser: UserSchema = {
      ...user,
      activeTreeSkin: skinId,
      unlockedTrees: updatedUnlocked,
      treeXp: updatedTreeXp,
    };
    await storage.saveUser(updatedUser);
    setUserState(updatedUser);
  };

  return (
    <AppContext.Provider value={{
      user, medications, history, settings, isLoading,
      setUser, addMedication, addMedications, takeMedication, removeMedication,
      updateSettings, resetAll, claimAchievement, unlockAllAchievements, buyTreeSkin,
      setActiveTree, tapTree, buyTapPower, claimTapAchievement, popBubble, refreshData, pendingLevelUp, clearLevelUp,
    }}>
      {children}
      <LevelUpOverlay />
    </AppContext.Provider>
  );
}

function LevelUpOverlay() {
  const ctx = useContext(AppContext);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const level = ctx?.pendingLevelUp ?? null;

  useEffect(() => {
    if (level !== null) {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => ctx?.clearLevelUp(), 3000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  if (level === null) return null;

  return (
    <Modal transparent animationType="none" visible statusBarTranslucent>
      <TouchableOpacity
        style={overlayStyles.backdrop}
        activeOpacity={1}
        onPress={() => ctx?.clearLevelUp()}
      >
        <Animated.View style={[overlayStyles.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Text style={overlayStyles.stars}>🌟✨⭐</Text>
          <Text style={overlayStyles.title}>SEVİYE ATLANDI!</Text>
          <Text style={overlayStyles.levelNum}>{level}</Text>
          <Text style={overlayStyles.sub}>Tebrikler! İlaçlarını düzenli alarak{'\n'}büyük ilerleme kaydediyorsun.</Text>
          <Text style={overlayStyles.hint}>Ekrana dokun</Text>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const overlayStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  stars: { fontSize: 40, marginBottom: 12, letterSpacing: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#888', letterSpacing: 2, marginBottom: 8 },
  levelNum: { fontSize: 80, fontWeight: '900', color: '#4CAF50', lineHeight: 88, marginBottom: 12 },
  sub: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  hint: { fontSize: 12, color: '#aaa' },
});

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
