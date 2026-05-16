import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ScrollView, Alert, Animated, Dimensions, GestureResponderEvent, Platform,
} from 'react-native';
import Svg, { G } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useApp } from '../store/AppContext';
import { TREE_SKINS, ACHIEVEMENT_THRESHOLDS, TAP_POWER_UPGRADES, MONSTER_MAX_HP } from '../store/types';
import { getTheme } from '../theme';
import TreeSVG, { SceneBackground, GodWingRight } from '../components/TreeSVG';

const { width: SCREEN_W } = Dimensions.get('window');
const TREE_SIZE  = Math.min(SCREEN_W - 24, 340);
const TREE_SVG_H = Math.round(TREE_SIZE * 270 / 200);

const TREE_EMOJIS: Record<string, string> = {
  default:   '🌳',
  iron:      '🔩',
  christmas: '🎄',
  robotic:   '🤖',
  electric:  '⚡',
  golden:    '✨',
  hayat:     '🌿',
  flame:     '🔥',
  zombie:    '🧟',
  alien:     '👽',
  sporty:    '💪',
  monster:   '👹',
  god:       '✨',
};

// Ağaca göre yaprak / coin rengi ve ikonu
const COIN_LABEL: Record<string, string> = {
  default:   '+1 🍃',
  iron:      '+1 ⚙️',
  christmas: '+1 ❄️',
  robotic:   '+1 🔵',
  electric:  '+1 ⚡',
  golden:    '+1 ✨',
  hayat:     '+1 🌸',
  flame:     '+1 🔥',
  zombie:    '+1 💀',
  alien:     '+1 👾',
  sporty:    '+1 💥',
  monster:   '-1 💔',
  god:       '+1 ✨',
};

const COIN_COLOR: Record<string, string> = {
  default:   '#2E7D32',
  iron:      '#90A4AE',
  christmas: '#E3F2FD',
  robotic:   '#00E5FF',
  electric:  '#FFD600',
  golden:    '#FFD600',
  hayat:     '#FF80AB',
  flame:     '#FF6D00',
  zombie:    '#69F0AE',
  alien:     '#E040FB',
  sporty:    '#FF8F00',
  monster:   '#D32F2F',
  god:       '#FFD700',
};

type Floater = {
  id: number;
  transY: Animated.Value;
  opacity: Animated.Value;
  offsetX: number;
};

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  transY: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
};

type WingFloat = {
  id: number;
  spread: Animated.Value;
  opacity: Animated.Value;
};

export default function TreeScreen() {
  const { t } = useTranslation();
  const { user, history, settings, buyTreeSkin, setActiveTree, tapTree, buyTapPower, popBubble } = useApp();
  const theme = getTheme(settings.theme === 'dark');
  const c = theme.colors;
  const [storeVisible, setStoreVisible] = useState(false);
  const [storeTab, setStoreTab] = useState<'skins' | 'power'>('skins');
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const floaterIdRef = useRef(0);

  // ── Canavar ölüm animasyonu ───────────────────────────────────────────────
  const prevMonsterHpRef = useRef<number>(MONSTER_MAX_HP);
  const [deathPhase, setDeathPhase] = useState<'idle' | 'animating' | 'done'>('idle');
  const deathShakeAnim = useRef(new Animated.Value(0)).current;
  const deathScaleAnim = useRef(new Animated.Value(1)).current;
  const deathFlashAnim = useRef(new Animated.Value(0)).current;

  // ── Tanrı Ağacı melek kanatları ───────────────────────────────────────────
  const [wingFloats, setWingFloats] = useState<WingFloat[]>([]);
  const wingIdRef = useRef(0);

  // ── Canavar balonları ─────────────────────────────────────────────────────
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleIdRef  = useRef(0);
  const bubblesRef   = useRef<Bubble[]>([]);
  const userRef      = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const spawnMonsterBubble = useCallback(() => {
    const u = userRef.current;
    if (!u || u.activeTreeSkin !== 'monster') return;
    const hp = u.monsterHp ?? MONSTER_MAX_HP;
    if (hp <= 0) return;
    const hpRatio    = hp / MONSTER_MAX_HP;
    const maxBubs    = Math.round(2 + (1 - hpRatio) * 5); // 2 → 7
    const spawnChance = 0.35 + (1 - hpRatio) * 0.65;     // 35% → 100%
    if (bubblesRef.current.length >= maxBubs) return;
    if (Math.random() > spawnChance) return;

    const id   = ++bubbleIdRef.current;
    const size = 28 + Math.floor(Math.random() * 16);     // 28–44 px
    const pad  = size / 2;
    const x    = pad + Math.random() * (TREE_SIZE - size - pad);
    const y    = 40  + Math.random() * (TREE_SVG_H - size - 90);
    const transY  = new Animated.Value(0);
    const scale   = new Animated.Value(0.2);
    const opacity = new Animated.Value(0);

    const bubble: Bubble = { id, x, y, size, transY, scale, opacity };
    bubblesRef.current = [...bubblesRef.current, bubble];
    setBubbles([...bubblesRef.current]);

    // Baloncuk animasyonu: patla-çık → bekle → yukarı kayarak söndür
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1,    friction: 5, tension: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.88, duration: 180,            useNativeDriver: true }),
      ]),
      Animated.delay(1400),
      Animated.parallel([
        Animated.timing(transY,  { toValue: -48, duration: 1100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 900,  useNativeDriver: true }),
      ]),
    ]).start(() => {
      bubblesRef.current = bubblesRef.current.filter(b => b.id !== id);
      setBubbles([...bubblesRef.current]);
    });
  }, []);

  // 250 ms'de bir olasılıkla baloncuk üret; sadece monster aktifken
  useEffect(() => {
    if (!user || user.activeTreeSkin !== 'monster') {
      bubblesRef.current = [];
      setBubbles([]);
      return;
    }
    const timer = setInterval(spawnMonsterBubble, 250);
    return () => clearInterval(timer);
  }, [user?.activeTreeSkin, spawnMonsterBubble]);

  const handleBubblePop = useCallback(async (bubbleId: number) => {
    bubblesRef.current = bubblesRef.current.filter(b => b.id !== bubbleId);
    setBubbles([...bubblesRef.current]);
    await popBubble();
  }, [popBubble]);

  // ── Canavar ölüm tetikleyicisi ────────────────────────────────────────────
  useEffect(() => {
    const hp = user?.monsterHp ?? MONSTER_MAX_HP;
    const prev = prevMonsterHpRef.current;
    prevMonsterHpRef.current = hp;
    if (prev > 0 && hp === 0 && deathPhase === 'idle') {
      setDeathPhase('animating');
      deathShakeAnim.setValue(0);
      deathScaleAnim.setValue(1);
      deathFlashAnim.setValue(0);
      Animated.sequence([
        // Şiddetli sallama
        Animated.sequence(
          Array.from({ length: 7 }, (_, i) =>
            Animated.timing(deathShakeAnim, {
              toValue: i % 2 === 0 ? 2 : -2,
              duration: 55,
              useNativeDriver: true,
            })
          )
        ),
        // Kırmızı flaş
        Animated.sequence([
          Animated.timing(deathFlashAnim, { toValue: 0.65, duration: 120, useNativeDriver: true }),
          Animated.timing(deathFlashAnim, { toValue: 0,    duration: 300, useNativeDriver: true }),
        ]),
        // Küçülme + kaybolma
        Animated.parallel([
          Animated.timing(deathScaleAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(deathShakeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]).start(() => setDeathPhase('done'));
    }
  }, [user?.monsterHp]);

  // ── Tanrı Ağacı kanat animasyonu ─────────────────────────────────────────
  const spawnWings = useCallback(() => {
    const id      = ++wingIdRef.current;
    const spread  = new Animated.Value(1); // unused for scaleX now
    const opacity = new Animated.Value(0);
    setWingFloats(prev => [...prev, { id, spread, opacity }]);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0.92, duration: 160, useNativeDriver: true }),
      Animated.delay(650),
      Animated.timing(opacity, { toValue: 0,    duration: 480, useNativeDriver: true }),
    ]).start(() => {
      setWingFloats(prev => prev.filter(w => w.id !== id));
    });
  }, []);

  // ── Sallama animasyonu ────────────────────────────────────────────────────
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  const triggerShake = useCallback((dir: 1 | -1) => {
    rotateAnim.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim,  { toValue: 0.91,      duration: 70, useNativeDriver: true }),
        Animated.spring(scaleAnim,  { toValue: 1, friction: 3, tension: 300, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue:  dir,        duration: 60, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -dir,        duration: 60, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue:  dir * 0.45, duration: 48, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0,           duration: 48, useNativeDriver: true }),
      ]),
    ]).start();
  }, [rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-7deg', '0deg', '7deg'],
  });

  const deathRotate = deathShakeAnim.interpolate({
    inputRange: [-2, 0, 2],
    outputRange: ['-22deg', '0deg', '22deg'],
  });

  // ── Floating coin animasyonu ──────────────────────────────────────────────
  const spawnFloater = useCallback(() => {
    const id = ++floaterIdRef.current;
    const transY  = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    const offsetX = (Math.random() - 0.5) * 70;

    setFloaters(prev => [...prev, { id, transY, opacity, offsetX }]);

    Animated.parallel([
      Animated.timing(transY, { toValue: -100, duration: 900, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(opacity, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    });
  }, []);

  // ── Tap handler ───────────────────────────────────────────────────────────
  const handleTreeTap = useCallback((e: GestureResponderEvent) => {
    const dir: 1 | -1 = e.nativeEvent.locationX < TREE_SIZE / 2 ? 1 : -1;
    triggerShake(dir);
    spawnFloater();
    tapTree();
    const u = userRef.current;
    // Monster aktifse her tıklamada 2-3 anında balon üret
    if (u?.activeTreeSkin === 'monster' && (u.monsterHp ?? MONSTER_MAX_HP) > 0) {
      const hp = u.monsterHp ?? MONSTER_MAX_HP;
      const extraCount = hp < MONSTER_MAX_HP / 2 ? 3 : 2;
      for (let i = 0; i < extraCount; i++) spawnMonsterBubble();
    }
    // God aktifse melek kanatları göster
    if (u?.activeTreeSkin === 'god') {
      spawnWings();
    }
  }, [triggerShake, spawnFloater, tapTree, spawnMonsterBubble, spawnWings]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!user) return null;

  const skinId = user.activeTreeSkin;
  const tapCoins = user.tapCoins ?? 0;
  const monsterUnlockAt = settings.monsterUnlockAt ?? 100000;

  const allAchievementsUnlocked = ACHIEVEMENT_THRESHOLDS.every(
    th => user.claimedAchievements.includes(th)
  );

  const maxMedsInOneDay = (() => {
    const counts: Record<string, number> = {};
    for (const h of history) {
      const day = h.takenAt.split('T')[0];
      counts[day] = (counts[day] || 0) + 1;
    }
    return Math.max(0, ...Object.values(counts));
  })();

  const getSkinStatus = (skin: typeof TREE_SKINS[0]) => {
    if (skin.id === 'default') return 'unlocked';
    if (user.unlockedTrees.includes(skin.id)) return 'unlocked';
    if (skin.type === 'xp') return 'locked_xp';
    if (skin.type === 'streak') return user.streakCount >= skin.cost ? 'unlocked' : 'locked_streak';
    if (skin.type === 'achievement') return allAchievementsUnlocked ? 'unlocked' : 'locked_achievement';
    if (skin.type === 'meds') return user.totalMedsCount >= 5000 ? 'unlocked' : 'locked_meds';
    if (skin.type === 'level') return user.level >= skin.cost ? 'unlocked' : 'locked_level';
    if (skin.type === 'daily') return maxMedsInOneDay >= skin.cost ? 'unlocked' : 'locked_daily';
    if (skin.type === 'tap')  return tapCoins >= monsterUnlockAt ? 'unlocked' : 'locked_tap';
    if (skin.type === 'monster_defeated') {
      if (user.unlockedTrees.includes(skin.id)) return 'unlocked';
      return (user.monsterHp ?? MONSTER_MAX_HP) === 0 ? 'unlocked' : 'locked_monster';
    }
    return 'locked';
  };

  const handleBuy = async (skin: typeof TREE_SKINS[0]) => {
    const status = getSkinStatus(skin);
    if (status === 'unlocked') {
      await setActiveTree(skin.id);
      setStoreVisible(false);
      return;
    }
    if (status === 'locked_xp') {
      if (user.currentXp < skin.cost) {
        Alert.alert('', t('tree.notEnoughXp'));
        return;
      }
      Alert.alert(
        skin.name,
        `${skin.cost} XP harcamak istiyor musunuz?`,
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            onPress: async () => {
              await buyTreeSkin(skin.id, skin.cost);
              setStoreVisible(false);
            },
          },
        ]
      );
    }
  };

  const activeTreeXp = user.treeXp?.[skinId] ?? 0;
  const growthRatio = Math.min(activeTreeXp / 10000, 1);

  const coinLabel = COIN_LABEL[skinId] ?? '+1 🍃';
  const coinColor = COIN_COLOR[skinId] ?? '#2E7D32';

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Mağaza butonu */}
      <TouchableOpacity
        style={[styles.storeBtn, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => setStoreVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.storeBtnText, { color: c.text }]}>🏪 {t('tree.store')}</Text>
      </TouchableOpacity>

      {/* Ağaç + tıklama oyunu alanı */}
      <View style={styles.treeArea}>

        {/* Yaprak / coin sayacı */}
        <View style={[styles.coinBadge, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.coinText, { color: coinColor }]}>{coinLabel.split(' ')[1]} {tapCoins}</Text>
          <Text style={[styles.coinSub, { color: c.subtext }]}>
            {(user.tapPower ?? 0) > 0
              ? `×${TAP_POWER_UPGRADES[(user.tapPower ?? 1) - 1].multiplier} güç`
              : 'toplam tıklama'}
          </Text>
        </View>

        {/* Tıklanabilir ağaç — arka plan sabit, ağaç animasyonlu */}
        <View style={[styles.treeClickArea, { width: TREE_SIZE, height: TREE_SVG_H }]}>

          {/* Katman 1: sabit arka plan (kırpılmış) */}
          <View style={[StyleSheet.absoluteFill, styles.bgClip]}>
            <Svg width={TREE_SIZE} height={TREE_SVG_H} viewBox="0 0 200 270">
              <SceneBackground skinId={skinId} />
            </Svg>
          </View>

          {/* Katman 2: sadece ağaç — animasyonlu */}
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleTreeTap} activeOpacity={1}>
            <Animated.View style={[StyleSheet.absoluteFill, {
              transform: [
                { rotate: deathPhase !== 'idle' ? deathRotate : rotate },
                { scale: deathPhase !== 'idle' ? deathScaleAnim : scaleAnim },
              ],
            }]}>
              <TreeSVG
                skinId={skinId}
                xp={activeTreeXp}
                hp={skinId === 'monster' ? (user.monsterHp ?? MONSTER_MAX_HP) : undefined}
                size={TREE_SIZE}
                showBackground={false}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Ölüm flaşı — kırmızı örtü */}
          {deathPhase !== 'idle' && (
            <Animated.View
              style={[StyleSheet.absoluteFill, { backgroundColor: '#FF0000', opacity: deathFlashAnim, borderRadius: 24 }]}
              pointerEvents="none"
            />
          )}

          {/* God Tree melek kanatları */}
          {wingFloats.map(w => (
            <Animated.View
              key={w.id}
              style={[StyleSheet.absoluteFill, { opacity: w.opacity }]}
              pointerEvents="none"
            >
              <Svg width={TREE_SIZE} height={TREE_SVG_H} viewBox="0 0 200 270">
                {/* Sağ kanat */}
                <GodWingRight />
                {/* Sol kanat — yansıma */}
                <G transform="translate(200,0) scale(-1,1)">
                  <GodWingRight />
                </G>
              </Svg>
            </Animated.View>
          ))}

          {/* Floating coin etiketleri */}
          {floaters.map(f => (
            <Animated.Text
              key={f.id}
              style={[
                styles.floater,
                { color: coinColor },
                {
                  transform: [
                    { translateY: f.transY },
                    { translateX: f.offsetX },
                  ],
                  opacity: f.opacity,
                },
              ]}
            >
              {coinLabel}
            </Animated.Text>
          ))}

          {/* Canavar balonları — üstte, tıklanabilir */}
          {bubbles.map(b => (
            <Animated.View
              key={b.id}
              style={[
                styles.bubbleWrap,
                {
                  left:    b.x,
                  top:     b.y,
                  width:   b.size,
                  height:  b.size,
                  borderRadius: b.size / 2,
                  transform: [{ translateY: b.transY }, { scale: b.scale }],
                  opacity: b.opacity,
                },
              ]}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                style={[styles.bubble, { width: b.size, height: b.size, borderRadius: b.size / 2 }]}
                onPress={() => handleBubblePop(b.id)}
                activeOpacity={0.5}
              >
                {/* Parlama vurgusu */}
                <View style={[styles.bubbleShine, { width: b.size * 0.3, height: b.size * 0.3, borderRadius: b.size * 0.15 }]} />
                <Text style={[styles.bubbleX, { fontSize: b.size * 0.38 }]}>×</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* XP büyüme / Monster HP ilerleme */}
        {skinId === 'monster' ? (
          <View style={[styles.xpContainer, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.xpLabel, { color: c.subtext }]}>
              👹 Canavar Can: {user.monsterHp ?? MONSTER_MAX_HP} / {MONSTER_MAX_HP}
            </Text>
            <View style={[styles.xpBar, { backgroundColor: c.xpBarBg }]}>
              <View
                style={[styles.xpFill, {
                  width: `${((user.monsterHp ?? MONSTER_MAX_HP) / MONSTER_MAX_HP) * 100}%`,
                  backgroundColor: '#D32F2F',
                }]}
              />
            </View>
            <Text style={[styles.growthPct, { color: '#D32F2F' }]}>
              {(user.monsterHp ?? MONSTER_MAX_HP) === 0 ? '💀 Yenildi!' : `%${Math.round(((user.monsterHp ?? MONSTER_MAX_HP) / MONSTER_MAX_HP) * 100)} can`}
            </Text>
          </View>
        ) : (
          <View style={[styles.xpContainer, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.xpLabel, { color: c.subtext }]}>
              {t('tree.xpGrowth', { xp: activeTreeXp })}
            </Text>
            <View style={[styles.xpBar, { backgroundColor: c.xpBarBg }]}>
              <View
                style={[styles.xpFill, {
                  width: `${growthRatio * 100}%`,
                  backgroundColor: c.xpBar,
                }]}
              />
            </View>
            <Text style={[styles.growthPct, { color: c.primary }]}>
              %{Math.round(growthRatio * 100)} büyüme
            </Text>
          </View>
        )}
      </View>

      {/* Canavar Yenildi — zafer modali */}
      <Modal visible={deathPhase === 'done'} transparent animationType="fade">
        <View style={styles.deathOverlay}>
          <View style={[styles.deathCard, { backgroundColor: c.card }]}>
            <Text style={styles.deathTitle}>👹💀</Text>
            <Text style={[styles.deathHeading, { color: '#D32F2F' }]}>CANAVAR YENİLDİ!</Text>
            <Text style={[styles.deathSub, { color: '#FFD700' }]}>✨ Tanrı Ağacı Açıldı! 🌟</Text>
            <Text style={[styles.deathDesc, { color: c.subtext }]}>
              Canavarı yenerek ilahi bir güç kazandınız. Tanrı Ağacı sizinle!
            </Text>
            <TouchableOpacity
              style={[styles.deathBtn, { backgroundColor: '#FFD700' }]}
              onPress={async () => {
                setDeathPhase('idle');
                deathShakeAnim.setValue(0);
                deathScaleAnim.setValue(1);
                deathFlashAnim.setValue(0);
                await setActiveTree('god');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.deathBtnText}>✨ Tanrı Ağacına Geç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mağaza Modal */}
      <Modal visible={storeVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>🏪 {t('tree.store')}</Text>

            {/* Sekme başlıkları */}
            <View style={[styles.tabRow, { borderColor: c.border }]}>
              <TouchableOpacity
                style={[styles.tabBtn, storeTab === 'skins' && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}
                onPress={() => setStoreTab('skins')}
              >
                <Text style={[styles.tabLabel, { color: storeTab === 'skins' ? c.primary : c.subtext }]}>
                  🌳 Ağaç Görünümleri
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, storeTab === 'power' && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}
                onPress={() => setStoreTab('power')}
              >
                <Text style={[styles.tabLabel, { color: storeTab === 'power' ? c.primary : c.subtext }]}>
                  👆 Tıklama Gücü
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Sekme 1: Ağaç görünümleri ── */}
            {storeTab === 'skins' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {TREE_SKINS.filter(skin => {
                  if (skin.type === 'level'  && user.level < skin.cost      && !user.unlockedTrees.includes(skin.id)) return false;
                  if (skin.type === 'daily'  && maxMedsInOneDay < skin.cost && !user.unlockedTrees.includes(skin.id)) return false;
                  if (skin.type === 'tap'    && tapCoins < monsterUnlockAt  && !user.unlockedTrees.includes(skin.id)) return false;
                  if (skin.type === 'monster_defeated' && (user.monsterHp ?? MONSTER_MAX_HP) > 0 && !user.unlockedTrees.includes(skin.id)) return false;
                  return true;
                }).map(skin => {
                  const status = getSkinStatus(skin);
                  const isActive = user.activeTreeSkin === skin.id;

                  let actionLabel = '';
                  let actionDisabled = false;
                  if (isActive) actionLabel = t('tree.active');
                  else if (status === 'unlocked') actionLabel = t('tree.setActive');
                  else if (status === 'locked_xp') actionLabel = t('tree.buy', { cost: skin.cost });
                  else if (status === 'locked_streak') { actionLabel = `${skin.cost} gün seri gerekli`; actionDisabled = true; }
                  else if (status === 'locked_achievement') { actionLabel = t('tree.requireAllAchievements'); actionDisabled = true; }
                  else if (status === 'locked_meds') { actionLabel = t('tree.require5000Meds'); actionDisabled = true; }
                  else if (status === 'locked_level') { actionLabel = `Seviye ${skin.cost} gerekli`; actionDisabled = true; }
                  else if (status === 'locked_daily') { actionLabel = `Günde ${skin.cost} ilaç gerekli`; actionDisabled = true; }
                  else if (status === 'locked_tap')  { actionLabel = `${monsterUnlockAt.toLocaleString()} tıklama gerekli`; actionDisabled = true; }
                  else if (status === 'locked_monster') { actionLabel = '👹 Canavarı Yenin!'; actionDisabled = true; }

                  return (
                    <View
                      key={skin.id}
                      style={[styles.skinRow, { borderColor: c.border, backgroundColor: isActive ? c.primary + '22' : undefined }]}
                    >
                      <Text style={styles.skinEmoji}>{TREE_EMOJIS[skin.id]}</Text>
                      <Text style={[styles.skinName, { color: c.text }]}>{skin.name}</Text>
                      <TouchableOpacity
                        style={[styles.skinBtn, { backgroundColor: isActive ? c.primary : actionDisabled ? c.border : c.secondary }]}
                        onPress={() => !isActive && handleBuy(skin)}
                        disabled={isActive || actionDisabled}
                        activeOpacity={0.8}
                      >
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                          {actionLabel}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* ── Sekme 2: Tıklama Gücü ── */}
            {storeTab === 'power' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Mevcut güç göstergesi */}
                <View style={[styles.powerCurrentCard, { backgroundColor: c.primary + '18', borderColor: c.primary + '44' }]}>
                  <Text style={[styles.powerCurrentLabel, { color: c.subtext }]}>Mevcut Tıklama Gücü</Text>
                  <Text style={[styles.powerCurrentValue, { color: c.primary }]}>
                    {user.tapPower === 0
                      ? '×1 (Varsayılan)'
                      : `×${TAP_POWER_UPGRADES[user.tapPower - 1].multiplier}`}
                  </Text>
                </View>

                {TAP_POWER_UPGRADES.map((upgrade) => {
                  const owned    = (user.tapPower ?? 0) >= upgrade.level;
                  const isNext   = (user.tapPower ?? 0) === upgrade.level - 1;
                  const canAfford = user.currentXp >= upgrade.cost;

                  return (
                    <View
                      key={upgrade.level}
                      style={[
                        styles.skinRow,
                        { borderColor: c.border, backgroundColor: owned ? c.primary + '18' : undefined },
                      ]}
                    >
                      <Text style={styles.skinEmoji}>
                        {owned ? '✅' : isNext ? '👆' : '🔒'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.skinName, { color: c.text }]}>{upgrade.label}</Text>
                        <Text style={[{ fontSize: 11, color: c.subtext }]}>{upgrade.desc}</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.skinBtn,
                          {
                            backgroundColor: owned
                              ? c.primary
                              : isNext && canAfford
                              ? c.secondary
                              : c.border,
                          },
                        ]}
                        disabled={owned || !isNext || !canAfford}
                        onPress={async () => {
                          if (!isNext || !canAfford) return;
                          await buyTapPower(upgrade.level, upgrade.cost);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                          {owned ? 'Sahip' : !isNext ? 'Kilitli' : !canAfford ? `${upgrade.cost} XP` : `${upgrade.cost} XP`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: c.border }]}
              onPress={() => setStoreVisible(false)}
            >
              <Text style={{ color: c.text }}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  storeBtn: {
    marginHorizontal: 12, marginTop: 12, marginBottom: 0,
    borderRadius: 12, borderWidth: 1,
    padding: 12, alignItems: 'center',
  },
  storeBtnText: { fontSize: 16, fontWeight: '600' },
  treeArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 12, paddingBottom: 16,
  },
  coinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 8,
    marginBottom: 10,
  },
  coinText: { fontSize: 18, fontWeight: '800' },
  coinSub:  { fontSize: 12, fontWeight: '500' },
  treeClickArea: {
    position: 'relative',
  },
  bgClip: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  floater: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    // Ağacın ortasına konumlanır; translateY ile yukarı çıkar
    top: '35%',
  },
  xpContainer: {
    width: '100%', borderRadius: 16, borderWidth: 1,
    padding: 14, marginTop: 14,
  },
  xpLabel: { fontSize: 14, marginBottom: 8 },
  xpBar: { height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  xpFill: { height: '100%', borderRadius: 6 },
  growthPct: { fontSize: 13, fontWeight: '700', textAlign: 'right' },
  modalOverlay: {
    flex: 1, backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40, maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1, marginBottom: 12,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
  },
  tabLabel: { fontSize: 13, fontWeight: '700' },
  powerCurrentCard: {
    borderRadius: 12, borderWidth: 1,
    padding: 14, marginBottom: 12, alignItems: 'center',
  },
  powerCurrentLabel: { fontSize: 12, marginBottom: 4 },
  powerCurrentValue: { fontSize: 22, fontWeight: '800' },
  skinRow: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, paddingVertical: 12,
  },
  skinEmoji: { fontSize: 28, marginRight: 12 },
  skinName: { flex: 1, fontSize: 15, fontWeight: '600' },
  skinBtn: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    minWidth: 80, alignItems: 'center',
  },
  closeBtn: {
    borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16,
  },

  // Ölüm zafer modali
  deathOverlay: {
    flex: 1, backgroundColor: '#000000AA',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  deathCard: {
    width: '100%', borderRadius: 24, padding: 28, alignItems: 'center',
  },
  deathTitle:   { fontSize: 52, marginBottom: 8 },
  deathHeading: { fontSize: 26, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  deathSub:     { fontSize: 20, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  deathDesc:    { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  deathBtn:     { borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14, width: '100%', alignItems: 'center' },
  deathBtnText: { color: '#3E2200', fontSize: 17, fontWeight: '800' },

  // Canavar balonları
  bubbleWrap: {
    position: 'absolute',
    ...Platform.select({ ios: { shadowColor: '#FF1744', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 6 } }),
    elevation: 6,
  },
  bubble: {
    backgroundColor: 'rgba(211, 47, 47, 0.82)',
    borderWidth: 2,
    borderColor: '#7B0000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bubbleShine: {
    position: 'absolute',
    top: 3,
    left: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
  },
  bubbleX: {
    color: '#fff',
    fontWeight: '900',
    lineHeight: 24,
  },
});
