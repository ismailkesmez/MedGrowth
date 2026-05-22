export interface UserSchema {
  name: string;
  age: number;
  gender?: 'male' | 'female';
  level: number;
  currentXp: number;
  totalMedsCount: number;
  streakCount: number;
  lastLoginDate: string; // YYYY-MM-DD
  unlockedTrees: string[];
  activeTreeSkin: string;
  claimedAchievements: number[];
  treeXp: Record<string, number>; // per-tree growth XP, independent from global XP
  tapCoins: number;               // tıklama oyunu para birimi (yaprak)
  tapPower: number;               // satın alınan tıklama gücü seviyesi (0 = varsayılan)
  monsterHp: number;              // Canavar Ağaç'ın mevcut canı
  claimedTapAchievements: string[]; // talep edilen tıklama başarımları
}

export interface MedicationSchema {
  id: string;
  name: string;
  time: string; // HH:MM
  date: string; // YYYY-MM-DD
  isTaken: boolean;
  isRecurring: boolean;
  notes?: string;
  notificationId?: string;
}

export interface HistoryEntry {
  id: string;
  name: string;
  addedDate: string;
  takenAt: string; // ISO timestamp
}

export const ACHIEVEMENT_THRESHOLDS = Array.from({ length: 50 }, (_, i) => (i + 1) * 50);

export const ACHIEVEMENT_NAMES: Record<number, string> = {
  50: 'Çaylak Şifacı',
  100: 'Düzenli Yaşam',
  150: 'İstikrarlı Bünye',
  200: 'Sağlam Adım',
  250: 'Sabırlı Ruh',
  300: 'Disiplinli Kahraman',
  350: 'Sağlık Bekçisi',
  400: 'Öz Bakım Ustası',
  450: 'Bünye Dostu',
  500: 'Yarım Bin Şifacı',
  550: 'Vazgeçmez Rutin',
  600: 'Altı Yüz Gücü',
  650: 'Kararlı Yürüyüş',
  700: 'Demirden İrade',
  750: 'Yedi Yüz Savaşçısı',
  800: 'Efsane Bünye',
  850: 'Demir Disiplin',
  900: 'Dokuz Yüz Işığı',
  950: 'Sağlığın Bekçisi',
  1000: 'Bin İlaç Kahramanı',
  1050: 'Ezber Bozan',
  1100: 'Onbir Yüz Azmi',
  1150: 'Çelikten Bünye',
  1200: 'Onikiyüz Yolcusu',
  1250: 'Gümüş Şifacı',
  1300: 'Sabır Abidesi',
  1350: 'Onüçyüz Ruhu',
  1400: 'Altın Bünye',
  1450: 'Ondörtyüz Ustası',
  1500: 'Efsane Şifacı',
  1550: 'Onbeşyüz Işığı',
  1600: 'Onaltıyüz Gücü',
  1650: 'Ölümsüz Rutin',
  1700: 'Onyediyüz Kahramanı',
  1750: 'Yarım Yüzyıl Şifacısı',
  1800: 'Onsekizyüz Azmi',
  1850: 'Ondokuz Yüz Savaşçısı',
  1900: 'Binyüz Işığı',
  1950: 'Ondokuzyüz Ustası',
  2000: 'İki Bin Kahramanı',
  2050: 'İki Binbeşlik',
  2100: 'İkibinyüz Efsanesi',
  2150: 'Çelik İrade',
  2200: 'İkibinikyüz Gücü',
  2250: 'Kristal Bünye',
  2300: 'İkibinüçyüz Azmi',
  2350: 'Neredeyse Bilge',
  2400: 'Dört Yüz Eksiği Var',
  2450: 'Son Yüz Ellide',
  2500: 'Sağlık Bilgesi',
};

export const MONSTER_MAX_HP = 10000;

export const TAP_ACHIEVEMENTS = [
  {
    id: 'tiklamaUstasi',
    name: 'Tıklama Ustası',
    threshold: 100000,
    reward: 100000,
    desc: '100.000 kez tıklama yaptınız!',
    emoji: '👆',
  },
] as const;

export const TAP_POWER_UPGRADES = [
  { level: 1, multiplier: 2,  cost: 500,   label: '×2 Tıklama Gücü',  desc: '1 tıklama 2 sayılır'   },
  { level: 2, multiplier: 3,  cost: 1000,  label: '×3 Tıklama Gücü',  desc: '1 tıklama 3 sayılır'   },
  { level: 3, multiplier: 5,  cost: 2000,  label: '×5 Tıklama Gücü',  desc: '1 tıklama 5 sayılır'   },
  { level: 4, multiplier: 10, cost: 5000,  label: '×10 Tıklama Gücü', desc: '1 tıklama 10 sayılır'  },
  { level: 5, multiplier: 25, cost: 15000, label: '×25 Tıklama Gücü', desc: '1 tıklama 25 sayılır'  },
] as const;

export const TREE_SKINS = [
  { id: 'default',   name: 'Varsayılan Ağaç', cost: 0,    type: 'default'     as const },
  { id: 'iron',      name: 'Demir Ağaç',      cost: 200,  type: 'xp'          as const },
  { id: 'christmas', name: 'Yılbaşı Ağacı',   cost: 400,  type: 'xp'          as const },
  { id: 'robotic',   name: 'Robotik Ağaç',    cost: 600,  type: 'xp'          as const },
  { id: 'electric',  name: 'Elektrikli Ağaç', cost: 800,  type: 'xp'          as const },
  { id: 'golden',    name: 'Altın Ağaç',      cost: 1000, type: 'xp'          as const },
  { id: 'hayat',     name: 'Hayat Ağacı',     cost: 100,  type: 'streak'      as const }, // cost = gereken streak sayısı
  { id: 'flame',     name: 'Alev Ağacı',      cost: 0,    type: 'achievement' as const },
  { id: 'zombie',    name: 'Zombi Ağaç',      cost: 5000, type: 'meds'        as const },
  { id: 'alien',     name: 'Uzaylı Ağacı',    cost: 100,  type: 'level'       as const }, // cost = gereken seviye
  { id: 'sporty',    name: 'Sportif Ağaç',    cost: 10,   type: 'daily'       as const }, // cost = günde gereken ilaç sayısı
  { id: 'monster',   name: 'Canavar Ağaç',   cost: 0,    type: 'tap'              as const }, // cost = gereken tıklama sayısı
  { id: 'god',       name: 'Tanrı Ağacı',   cost: 0,    type: 'monster_defeated' as const },
];

/** Total XP required to reach `level` (level 1 = 0 XP). */
export function getXpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

/** XP needed to advance from `level` to `level+1`. */
export function xpNeededForNextLevel(level: number): number {
  return level * 100;
}

/** Derive level from total accumulated XP using inverse of getXpForLevel. */
export function getLevelFromXp(xp: number): number {
  return Math.floor((1 + Math.sqrt(1 + 4 * xp / 50)) / 2);
}

/** XP accumulated within the current level (0 .. xpNeededForNextLevel-1). */
export function getXpForCurrentLevel(xp: number): number {
  const level = getLevelFromXp(xp);
  return xp - getXpForLevel(level);
}

export function getPassiveBonus(claimedAchievements: number[]): number {
  if (claimedAchievements.length === 0) return 0;
  const maxClaimed = Math.max(...claimedAchievements);
  return maxClaimed * 0.1 / 50;
}
