import React from 'react';
import Svg, { Polygon, Rect, Circle, G, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

// ── ViewBox sabit koordinatları ──────────────────────────────────────────────
const VW = 200, VH = 270, CX = 100, BASE_Y = 256;

// XP'ye göre büyüme evresi (0-4), aralık 0-10000
function getStage(xp: number): number {
  if (xp < 500)  return 0; // Fidan
  if (xp < 2000) return 1; // Çıta
  if (xp < 4500) return 2; // Genç
  if (xp < 7500) return 3; // Olgun
  return 4;                 // Tam
}
const SCALES      = [0.28, 0.50, 0.68, 0.84, 1.0];
const LAYER_COUNT = [1,    1,    2,    3,    3   ]; // kaç foliaj katmanı gösterilir

// ── Yardımcılar ───────────────────────────────────────────────────────────────
function tri(cx: number, by: number, hw: number, h: number): string {
  return `${cx - hw},${by} ${cx + hw},${by} ${cx},${by - h}`;
}

// Çam ağacı katman geometrisi (tam boy, alttan üste)
const PINE_LAYERS = [
  { by: 230, hw: 70, h: 76 },
  { by: 192, hw: 52, h: 68 },
  { by: 153, hw: 35, h: 65 },
];
const TRUNK = { x: 89, y: 208, w: 22, h: 48 };

// 5 köşeli yıldız
function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 - 90) * Math.PI / 180;
    const rad = i % 2 === 0 ? r : r * 0.4;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return <Polygon points={pts} fill={fill} />;
}

// Tüm ağacı BASE_Y noktasından ölçeklendiren sarmalayıcı
function ScaleWrap({ scale, children }: { scale: number; children: React.ReactNode }) {
  return (
    <G transform={`translate(${CX},${BASE_Y}) scale(${scale}) translate(${-CX},${-BASE_Y})`}>
      {children}
    </G>
  );
}

// ── Çam gövdesi (ortak) ───────────────────────────────────────────────────────
function PineBase({ trunkColor, colors, stage, decorations }: {
  trunkColor: string;
  colors: [string, string, string];
  stage: number;
  decorations?: React.ReactNode;
}) {
  const n = LAYER_COUNT[stage];
  return (
    <ScaleWrap scale={SCALES[stage]}>
      <Rect x={TRUNK.x} y={TRUNK.y} width={TRUNK.w} height={TRUNK.h} fill={trunkColor} rx={3} />
      {PINE_LAYERS.slice(0, n).map((l, i) => (
        <Polygon key={i} points={tri(CX, l.by, l.hw, l.h)} fill={colors[i]} />
      ))}
      {stage >= 3 ? decorations : null}
    </ScaleWrap>
  );
}

// ── HAYAT AĞACI — yuvarlak taç ────────────────────────────────────────────────
function HayatTree({ stage }: { stage: number }) {
  return (
    <ScaleWrap scale={SCALES[stage]}>
      <Rect x={TRUNK.x} y={TRUNK.y} width={TRUNK.w} height={TRUNK.h} fill="#4E342E" rx={3} />
      {stage >= 2 && <Circle cx={62}  cy={172} r={48} fill="#2E7D32" />}
      {stage >= 2 && <Circle cx={138} cy={172} r={48} fill="#2E7D32" />}
      <Circle cx={CX} cy={148} r={72} fill="#388E3C" />
      <Circle cx={CX} cy={140} r={58} fill="#43A047" />
      <Circle cx={CX} cy={135} r={42} fill="#66BB6A" />
      {stage === 4 && (
        <G>
          <Circle cx={72}  cy={110} r={5} fill="#FF80AB" />
          <Circle cx={128} cy={107} r={5} fill="#FFAB40" />
          <Circle cx={100} cy={93}  r={5} fill="#FFEB3B" />
          <Circle cx={58}  cy={148} r={4} fill="#FF80AB" />
          <Circle cx={142} cy={146} r={4} fill="#E040FB" />
          <Circle cx={84}  cy={183} r={4} fill="#69F0AE" />
          <Circle cx={117} cy={180} r={4} fill="#FFAB40" />
        </G>
      )}
    </ScaleWrap>
  );
}

// ── ZOMBİ AĞACI — çıplak dallar ───────────────────────────────────────────────
function ZombieTree({ stage }: { stage: number }) {
  const sc  = '#37474F'; // dal rengi
  const drip = '#4CAF50'; // yeşil damla
  return (
    <ScaleWrap scale={SCALES[stage]}>
      <Path d={`M ${CX},${BASE_Y} L ${CX},155`}
        stroke={sc} strokeWidth={14} strokeLinecap="round" fill="none" />
      {stage >= 1 && <>
        <Path d={`M ${CX},205 L 55,150`} stroke={sc} strokeWidth={8} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX},205 L 145,150`} stroke={sc} strokeWidth={8} strokeLinecap="round" fill="none" />
      </>}
      {stage >= 2 && <>
        <Path d={`M 55,150 L 32,108`}  stroke={sc} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Path d={`M 55,150 L 72,102`}  stroke={sc} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Path d={`M 145,150 L 168,108`} stroke={sc} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Path d={`M 145,150 L 128,102`} stroke={sc} strokeWidth={5} strokeLinecap="round" fill="none" />
      </>}
      {stage >= 3 && <>
        <Path d={`M ${CX},175 L 68,130`}  stroke={sc} strokeWidth={6} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX},175 L 132,130`} stroke={sc} strokeWidth={6} strokeLinecap="round" fill="none" />
        <Path d={`M 68,130 L 50,95`}  stroke={sc} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d={`M 132,130 L 150,95`} stroke={sc} strokeWidth={4} strokeLinecap="round" fill="none" />
      </>}
      {stage === 4 && <>
        <Path d={`M 55,150 L 48,172`}       stroke={drip} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d={`M 145,150 L 152,172`}     stroke={drip} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d={`M 72,102 L 67,120`}       stroke={drip} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX},155 L 95,178`}   stroke={drip} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={48}  cy={175} r={3} fill={drip} />
        <Circle cx={152} cy={175} r={3} fill={drip} />
        <Circle cx={67}  cy={122} r={3} fill={drip} />
      </>}
    </ScaleWrap>
  );
}

// ── CANAVAR AĞACI — 10 hasar aşaması (HP azaldıkça kötüleşir) ──────────────
const MONSTER_SCL = [0.28, 0.38, 0.48, 0.58, 0.68, 0.76, 0.84, 0.90, 0.96, 1.0];

function getMonsterStage(hp: number): number {
  return Math.min(9, Math.floor(hp / 1000));
}

function MonsterTree({ hp }: { hp: number }) {
  const stage = getMonsterStage(hp);
  const sc    = MONSTER_SCL[stage];

  const DK = '#1E0030';
  const MD = '#4A0060';
  const LT = '#7B0D8C';
  const RD = '#9B1B1B';
  const MR = '#D32F2F';
  const GN = '#00C853';
  const GD = '#69FF47';
  const WH = '#ECEFF1';

  return (
    <ScaleWrap scale={sc}>
      {/* Gövde kökü */}
      <Rect x={CX-8} y={210} width={16} height={46} rx={5} fill={DK} />
      <Circle cx={CX} cy={207} r={20} fill={DK} />
      <Circle cx={CX} cy={200} r={14} fill={MD} />

      {/* Hasar çatlakları — düşük aşamalarda görünür */}
      {stage <= 5 && <>
        <Path d={`M ${CX-6},202 L ${CX-14},218 L ${CX-10},230`}  stroke={RD} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+6},204 L ${CX+13},217 L ${CX+9},228`}   stroke={RD} strokeWidth={2} fill="none" strokeLinecap="round" />
      </>}
      {stage <= 2 && <>
        <Path d={`M ${CX-3},197 L ${CX-9},210`}               stroke={MR} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+3},196 L ${CX+10},209`}              stroke={MR} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX},222 L ${CX-5},234 L ${CX+5},246`}   stroke={MR} strokeWidth={2}   fill="none" strokeLinecap="round" />
      </>}

      {/* Üst gövde — aşama 2'den */}
      {stage >= 2 && <>
        <Circle cx={CX} cy={184} r={25} fill={DK} />
        <Circle cx={CX} cy={176} r={18} fill={MD} />
      </>}

      {/* Gözler — aşama 2'den */}
      {stage >= 2 && <>
        <Circle cx={CX-10} cy={175} r={stage >= 5 ? 8 : 5} fill={GN} opacity={0.2 + stage * 0.08} />
        <Circle cx={CX+10} cy={175} r={stage >= 5 ? 8 : 5} fill={GN} opacity={0.2 + stage * 0.08} />
        <Circle cx={CX-10} cy={175} r={stage >= 5 ? 4 : 2.5} fill={GD} opacity={0.5 + stage * 0.05} />
        <Circle cx={CX+10} cy={175} r={stage >= 5 ? 4 : 2.5} fill={GD} opacity={0.5 + stage * 0.05} />
      </>}

      {/* Ağız + dişler — aşama 3'ten */}
      {stage >= 3 && <>
        <Path d={`M ${CX-13},188 Q ${CX},192 ${CX+13},188`} stroke={DK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Polygon points={`${CX-11},187 ${CX-8},187 ${CX-9.5},195`}  fill={WH} />
        <Polygon points={`${CX-5},187 ${CX-2},187 ${CX-3.5},195`}   fill={WH} />
        <Polygon points={`${CX+2},187 ${CX+5},187 ${CX+3.5},195`}   fill={WH} />
        <Polygon points={`${CX+8},187 ${CX+11},187 ${CX+9.5},195`}  fill={WH} />
      </>}

      {/* Baş — aşama 4'ten */}
      {stage >= 4 && <>
        <Circle cx={CX} cy={153} r={28} fill={DK} />
        <Circle cx={CX} cy={145} r={20} fill={MD} />
        <Circle cx={CX} cy={139} r={12} fill={LT} />
      </>}

      {/* Boynuzlar — aşama 5'ten */}
      {stage >= 5 && <>
        <Path d={`M ${CX-18},138 Q ${CX-33},110 ${CX-24},90`}  stroke={DK} strokeWidth={8} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX-18},138 Q ${CX-31},112 ${CX-24},90`}  stroke={MD} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+18},138 Q ${CX+33},110 ${CX+24},90`}  stroke={DK} strokeWidth={8} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+18},138 Q ${CX+31},112 ${CX+24},90`}  stroke={MD} strokeWidth={4} strokeLinecap="round" fill="none" />
      </>}

      {/* Yan dokunaçlar — aşama 6'dan */}
      {stage >= 6 && <>
        <Path d={`M ${CX-22},165 Q ${CX-56},150 ${CX-64},122`}  stroke={DK} strokeWidth={9} strokeLinecap="round" fill="none" />
        <Circle cx={CX-65} cy={120} r={12} fill={MD} />
        <Circle cx={CX-65} cy={120} r={6}  fill={GN} opacity={0.65} />
        <Path d={`M ${CX+22},165 Q ${CX+56},150 ${CX+64},122`}  stroke={DK} strokeWidth={9} strokeLinecap="round" fill="none" />
        <Circle cx={CX+65} cy={120} r={12} fill={MD} />
        <Circle cx={CX+65} cy={120} r={6}  fill={GN} opacity={0.65} />
      </>}

      {/* Çelenk dikenleri — aşama 7'den */}
      {stage >= 7 && <>
        <Polygon points={`${CX},110 ${CX-9},133 ${CX+9},133`}     fill={DK} />
        <Polygon points={`${CX-18},116 ${CX-25},139 ${CX-9},134`} fill={MD} />
        <Polygon points={`${CX+18},116 ${CX+25},139 ${CX+9},134`} fill={MD} />
        <Circle cx={CX} cy={108} r={8} fill={GN} opacity={0.7} />
      </>}

      {/* Aura halkaları + alt dokunaçlar — aşama 8'den */}
      {stage >= 8 && <>
        <Circle cx={CX} cy={168} r={72} fill="none" stroke={GN} strokeWidth={2}   opacity={0.22} />
        <Circle cx={CX} cy={168} r={86} fill="none" stroke={MR} strokeWidth={1.5} opacity={0.15} />
        <Path d={`M ${CX-16},207 Q ${CX-52},222 ${CX-58},250`}  stroke={DK} strokeWidth={7} strokeLinecap="round" fill="none" />
        <Circle cx={CX-59} cy={252} r={9} fill={MD} />
        <Circle cx={CX-59} cy={252} r={4} fill={MR} opacity={0.75} />
        <Path d={`M ${CX+16},207 Q ${CX+52},222 ${CX+58},250`}  stroke={DK} strokeWidth={7} strokeLinecap="round" fill="none" />
        <Circle cx={CX+59} cy={252} r={9} fill={MD} />
        <Circle cx={CX+59} cy={252} r={4} fill={MR} opacity={0.75} />
      </>}

      {/* Aşama 9: Tam güç — dış halka + tepe gözü + pençe uçları */}
      {stage >= 9 && <>
        <Circle cx={CX} cy={168} r={98} fill="none" stroke={GN} strokeWidth={1} opacity={0.10} />
        <Circle cx={CX} cy={98}  r={10} fill={DK} />
        <Circle cx={CX} cy={98}  r={6}  fill={GN} />
        <Circle cx={CX} cy={98}  r={2.5} fill="#000" />
        <Circle cx={CX+3} cy={95} r={1.2} fill={WH} />
        <Path d={`M ${CX-65},127 L ${CX-74},114 M ${CX-65},127 L ${CX-76},124 M ${CX-65},127 L ${CX-72},136`}
          stroke={DK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+65},127 L ${CX+74},114 M ${CX+65},127 L ${CX+76},124 M ${CX+65},127 L ${CX+72},136`}
          stroke={DK} strokeWidth={3} fill="none" strokeLinecap="round" />
      </>}
    </ScaleWrap>
  );
}

// ── UZAYLI AĞACI — 8 evrim aşaması ───────────────────────────────────────────
// kendi treeXp sayacını kullanır (0'dan başlar, aktivasyonla başlatılır)
// Uzaylı ağacı 8 aşaması — 0-10000 aralığında daha sık evrim
const ALIEN_XP   = [300, 900, 2000, 4000, 6000, 7500, 9000] as const;
const ALIEN_SCL  = [0.22, 0.33, 0.46, 0.58, 0.70, 0.81, 0.91, 1.0];

function getAlienStage(xp: number): number {
  for (let i = 0; i < ALIEN_XP.length; i++) if (xp < ALIEN_XP[i]) return i;
  return 7;
}

function AlienTree({ xp }: { xp: number }) {
  const stage = getAlienStage(xp);
  const sc = ALIEN_SCL[stage];

  const DK  = '#3D0066'; // koyu mor gövde
  const MD  = '#7B1FA2'; // orta mor
  const LT  = '#CE93D8'; // açık mor
  const CY  = '#00E5FF'; // cyan orb
  const MG  = '#E040FB'; // magenta uç
  const MN  = '#69F0AE'; // mint vurgu
  const ST  = '#4A148C'; // sap/dal

  return (
    <ScaleWrap scale={sc}>
      {/* Kristal gövde */}
      <Polygon points={`${CX-7},${BASE_Y} ${CX+7},${BASE_Y} ${CX+4},205 ${CX-4},205`} fill={ST} />

      {/* Aşama 0: tohum kapsül */}
      <Circle cx={CX} cy={207} r={22} fill={MD} />
      <Circle cx={CX} cy={201} r={13} fill={LT} />

      {/* Aşama 1+: ilk antenler */}
      {stage >= 1 && <>
        <Path d={`M ${CX-9},188 Q ${CX-24},168 ${CX-30},148`}
          stroke={ST} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+9},188 Q ${CX+24},168 ${CX+30},148`}
          stroke={ST} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={CX-30} cy={145} r={7} fill={MG} />
        <Circle cx={CX+30} cy={145} r={7} fill={MG} />
      </>}

      {/* Aşama 2+: gövde büyür, yan orblar */}
      {stage >= 2 && <>
        <Circle cx={CX} cy={192} r={30} fill={DK} />
        <Circle cx={CX} cy={184} r={20} fill={MD} />
        <Circle cx={CX} cy={177} r={11} fill={LT} />
        <Circle cx={CX-36} cy={200} r={10} fill={CY} />
        <Circle cx={CX+36} cy={200} r={10} fill={CY} />
      </>}

      {/* Aşama 3+: orta eklemi ve orta dal */}
      {stage >= 3 && <>
        <Rect x={CX-5} y={160} width={10} height={45} fill={ST} rx={3} />
        <Circle cx={CX} cy={150} r={26} fill={DK} />
        <Circle cx={CX} cy={142} r={17} fill={MD} />
        <Path d={`M ${CX-4},163 Q ${CX-34},156 ${CX-48},132`}
          stroke={ST} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+4},163 Q ${CX+34},156 ${CX+48},132`}
          stroke={ST} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={CX-48} cy={130} r={11} fill={CY} />
        <Circle cx={CX+48} cy={130} r={11} fill={CY} />
      </>}

      {/* Aşama 4+: üst gövde + taç orb */}
      {stage >= 4 && <>
        <Rect x={CX-4} y={110} width={8} height={50} fill={ST} rx={3} />
        <Circle cx={CX} cy={100} r={32} fill={DK} />
        <Circle cx={CX} cy={93}  r={22} fill={MD} />
        <Circle cx={CX} cy={87}  r={13} fill={LT} />
        {/* Enerji halkası */}
        <Circle cx={CX} cy={152} r={62} fill="none" stroke={MG} strokeWidth={2} opacity={0.35} />
      </>}

      {/* Aşama 5+: çift tepe anteni + gezgin orblar */}
      {stage >= 5 && <>
        <Path d={`M ${CX-10},75 Q ${CX-32},56 ${CX-37},36`}
          stroke={ST} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+10},75 Q ${CX+32},56 ${CX+37},36`}
          stroke={ST} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={CX-37} cy={33} r={9} fill={MG} />
        <Circle cx={CX+37} cy={33} r={9} fill={MG} />
        <Circle cx={CX-60} cy={172} r={8} fill={MN} />
        <Circle cx={CX+60} cy={172} r={8} fill={MN} />
        <Circle cx={CX-52} cy={110} r={6} fill={CY} />
        <Circle cx={CX+52} cy={110} r={6} fill={CY} />
      </>}

      {/* Aşama 6+: çift halka + yan kapsüller */}
      {stage >= 6 && <>
        <Circle cx={CX} cy={128} r={72} fill="none" stroke={CY}  strokeWidth={1.5} opacity={0.28} />
        <Circle cx={CX} cy={128} r={85} fill="none" stroke={LT}  strokeWidth={1}   opacity={0.18} />
        <Circle cx={CX-64} cy={190} r={13} fill={DK} />
        <Circle cx={CX+64} cy={190} r={13} fill={DK} />
        <Circle cx={CX-64} cy={190} r={7}  fill={CY} />
        <Circle cx={CX+64} cy={190} r={7}  fill={CY} />
        <Circle cx={CX-22} cy={78}  r={6}  fill={MN} />
        <Circle cx={CX+22} cy={78}  r={6}  fill={MN} />
      </>}

      {/* Aşama 7: efsane form — dev göz + kanat uzantıları */}
      {stage >= 7 && <>
        {/* Tepe göz */}
        <Circle cx={CX} cy={58} r={20} fill={DK} />
        <Circle cx={CX} cy={58} r={12} fill={CY} />
        <Circle cx={CX} cy={58} r={5}  fill="#080020" />
        <Circle cx={CX+4} cy={54} r={2} fill="#fff" />
        {/* Kanat uzantıları */}
        <Path d={`M ${CX-18},178 Q ${CX-72},162 ${CX-78},208`}
          stroke={ST} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+18},178 Q ${CX+72},162 ${CX+78},208`}
          stroke={ST} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Circle cx={CX-78} cy={210} r={11} fill={MG} />
        <Circle cx={CX+78} cy={210} r={11} fill={MG} />
        {/* Dış halka */}
        <Circle cx={CX} cy={128} r={96} fill="none" stroke={MD} strokeWidth={1} opacity={0.12} />
      </>}
    </ScaleWrap>
  );
}

// ── SPORTİF AĞAÇ — 8 evrim aşaması, kaslı, sarı-turuncu, damarlı ──────────────
function SportyTree({ xp }: { xp: number }) {
  const stage = getAlienStage(xp);
  const sc = ALIEN_SCL[stage];

  const DK = '#E65100'; // koyu turuncu (gölge / dış gövde)
  const MD = '#FF6D00'; // orta turuncu (ana gövde)
  const HL = '#FF8A65'; // açık turuncu vurgu
  const YL = '#FFC107'; // sarı-turuncu (taç)
  const LY = '#FFD740'; // parlak sarı (taç vurgusu)
  const VN = '#8B1A00'; // koyu kırmızı-kahve damar
  const EN = '#FFD600'; // enerji sarısı
  const WH = '#FFF9C4'; // parlak beyazımsı sarı

  return (
    <ScaleWrap scale={sc}>
      {/* ── Kaslı gövde — dış çerçeve ── */}
      <Polygon
        points={`${CX-9},${BASE_Y} ${CX+9},${BASE_Y} ${CX+14},230 ${CX+18},210 ${CX+14},190 ${CX+18},172 ${CX+11},158 ${CX-11},158 ${CX-18},172 ${CX-14},190 ${CX-18},210 ${CX-14},230`}
        fill={DK}
      />
      {/* Orta gövde */}
      <Polygon
        points={`${CX-4},${BASE_Y} ${CX+4},${BASE_Y} ${CX+7},228 ${CX+9},210 ${CX+7},192 ${CX+9},174 ${CX+5},163 ${CX-5},163 ${CX-9},174 ${CX-7},192 ${CX-9},210 ${CX-7},228`}
        fill={MD}
      />
      {/* Merkez şerit — ışık vurgusu */}
      <Polygon
        points={`${CX-2},${BASE_Y} ${CX+2},${BASE_Y} ${CX+3},226 ${CX+4},210 ${CX+3},191 ${CX+4},174 ${CX+2},163 ${CX-2},163 ${CX-4},174 ${CX-3},191 ${CX-4},210 ${CX-3},226`}
        fill={HL}
      />

      {/* Ana gövde damarları */}
      <Path d={`M ${CX},${BASE_Y} L ${CX},228 L ${CX-1},205 L ${CX+1},182 L ${CX},162`}
        stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d={`M ${CX-8},222 L ${CX-5},206 L ${CX-7},188 L ${CX-6},172`}
        stroke={VN} strokeWidth={1} fill="none" strokeLinecap="round" />
      <Path d={`M ${CX+8},222 L ${CX+5},206 L ${CX+7},188 L ${CX+6},172`}
        stroke={VN} strokeWidth={1} fill="none" strokeLinecap="round" />

      {/* Aşama 0: fidan — tomurcuk taç + kas çıkıntıları */}
      <Circle cx={CX} cy={145} r={18} fill={YL} />
      <Circle cx={CX} cy={139} r={10} fill={LY} />
      <Circle cx={CX-17} cy={196} r={10} fill={DK} />
      <Circle cx={CX+17} cy={196} r={10} fill={DK} />
      <Circle cx={CX-15} cy={193} r={6}  fill={MD} />
      <Circle cx={CX+15} cy={193} r={6}  fill={MD} />

      {/* Aşama 1+: kol dallar + bicep yumruları + kol damarları */}
      {stage >= 1 && <>
        {/* Sol kol */}
        <Path d={`M ${CX-13},197 Q ${CX-38},185 ${CX-52},162`}
          stroke={DK} strokeWidth={12} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX-13},197 Q ${CX-38},185 ${CX-52},162`}
          stroke={MD} strokeWidth={7} strokeLinecap="round" fill="none" />
        <Circle cx={CX-53} cy={160} r={15} fill={DK} />
        <Circle cx={CX-51} cy={157} r={9}  fill={MD} />
        <Circle cx={CX-49} cy={154} r={5}  fill={HL} />
        {/* Sol kol damarı */}
        <Path d={`M ${CX-20},190 Q ${CX-38},182 ${CX-48},165`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* Sağ kol */}
        <Path d={`M ${CX+13},197 Q ${CX+38},185 ${CX+52},162`}
          stroke={DK} strokeWidth={12} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+13},197 Q ${CX+38},185 ${CX+52},162`}
          stroke={MD} strokeWidth={7} strokeLinecap="round" fill="none" />
        <Circle cx={CX+53} cy={160} r={15} fill={DK} />
        <Circle cx={CX+51} cy={157} r={9}  fill={MD} />
        <Circle cx={CX+49} cy={154} r={5}  fill={HL} />
        <Path d={`M ${CX+20},190 Q ${CX+38},182 ${CX+48},165`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* Taç büyüme */}
        <Circle cx={CX} cy={130} r={28} fill={YL} />
        <Circle cx={CX} cy={122} r={18} fill={LY} />
      </>}

      {/* Aşama 2+: ön kol + yumruk */}
      {stage >= 2 && <>
        <Path d={`M ${CX-53},160 Q ${CX-62},178 ${CX-60},202`}
          stroke={DK} strokeWidth={9} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX-53},160 Q ${CX-62},178 ${CX-60},202`}
          stroke={MD} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Circle cx={CX-60} cy={205} r={10} fill={DK} />
        <Circle cx={CX-58} cy={203} r={6}  fill={HL} />
        <Path d={`M ${CX-57},163 Q ${CX-62},180 ${CX-59},198`}
          stroke={VN} strokeWidth={1.2} fill="none" strokeLinecap="round" />

        <Path d={`M ${CX+53},160 Q ${CX+62},178 ${CX+60},202`}
          stroke={DK} strokeWidth={9} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+53},160 Q ${CX+62},178 ${CX+60},202`}
          stroke={MD} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Circle cx={CX+60} cy={205} r={10} fill={DK} />
        <Circle cx={CX+58} cy={203} r={6}  fill={HL} />
        <Path d={`M ${CX+57},163 Q ${CX+62},180 ${CX+59},198`}
          stroke={VN} strokeWidth={1.2} fill="none" strokeLinecap="round" />

        <Circle cx={CX-20} cy={128} r={22} fill={YL} />
        <Circle cx={CX+20} cy={128} r={22} fill={YL} />
        <Circle cx={CX}    cy={108} r={26} fill={YL} />
        <Circle cx={CX}    cy={101} r={16} fill={LY} />
      </>}

      {/* Aşama 3+: kas tanımı çizgileri + büyük biceplar */}
      {stage >= 3 && <>
        {/* Göğüs kas çizgileri */}
        <Path d={`M ${CX-8},200 Q ${CX-3},185 ${CX-7},175`}
          stroke={VN} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+8},200 Q ${CX+3},185 ${CX+7},175`}
          stroke={VN} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX-13},186 Q ${CX},183 ${CX+13},186`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX-14},202 Q ${CX},199 ${CX+14},202`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* Büyük biceplar */}
        <Circle cx={CX-53} cy={158} r={18} fill={DK} />
        <Circle cx={CX+53} cy={158} r={18} fill={DK} />
        <Circle cx={CX-50} cy={154} r={11} fill={MD} />
        <Circle cx={CX+50} cy={154} r={11} fill={MD} />
        <Circle cx={CX-47} cy={151} r={6}  fill={HL} />
        <Circle cx={CX+47} cy={151} r={6}  fill={HL} />
        <Circle cx={CX} cy={92}  r={32} fill={YL} />
        <Circle cx={CX} cy={85}  r={22} fill={LY} />
        <Circle cx={CX} cy={79}  r={12} fill={WH} />
      </>}

      {/* Aşama 4+: omuz kasları + enerji şimşeği */}
      {stage >= 4 && <>
        <Circle cx={CX-20} cy={162} r={16} fill={DK} />
        <Circle cx={CX+20} cy={162} r={16} fill={DK} />
        <Circle cx={CX-18} cy={158} r={9}  fill={MD} />
        <Circle cx={CX+18} cy={158} r={9}  fill={MD} />
        <Path d={`M ${CX},192 L ${CX-5},178 L ${CX+3},168 L ${CX-2},158`}
          stroke={EN} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={`M ${CX-8},167 Q ${CX-16},163 ${CX-22},157`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+8},167 Q ${CX+16},163 ${CX+22},157`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </>}

      {/* Aşama 5+: flex — kollar yukarı */}
      {stage >= 5 && <>
        <Path d={`M ${CX-20},160 Q ${CX-52},142 ${CX-58},112`}
          stroke={DK} strokeWidth={11} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX-20},160 Q ${CX-52},142 ${CX-58},112`}
          stroke={MD} strokeWidth={6} strokeLinecap="round" fill="none" />
        <Circle cx={CX-59} cy={109} r={16} fill={DK} />
        <Circle cx={CX-56} cy={105} r={10} fill={MD} />
        <Circle cx={CX-53} cy={102} r={5}  fill={HL} />
        <Path d={`M ${CX-48},114 Q ${CX-56},110 ${CX-58},105`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+20},160 Q ${CX+52},142 ${CX+58},112`}
          stroke={DK} strokeWidth={11} strokeLinecap="round" fill="none" />
        <Path d={`M ${CX+20},160 Q ${CX+52},142 ${CX+58},112`}
          stroke={MD} strokeWidth={6} strokeLinecap="round" fill="none" />
        <Circle cx={CX+59} cy={109} r={16} fill={DK} />
        <Circle cx={CX+56} cy={105} r={10} fill={MD} />
        <Circle cx={CX+53} cy={102} r={5}  fill={HL} />
        <Path d={`M ${CX+48},114 Q ${CX+56},110 ${CX+58},105`}
          stroke={VN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Circle cx={CX-28} cy={104} r={22} fill={YL} />
        <Circle cx={CX+28} cy={104} r={22} fill={YL} />
        <Circle cx={CX}    cy={80}  r={28} fill={YL} />
        <Circle cx={CX}    cy={73}  r={18} fill={LY} />
        <Circle cx={CX}    cy={67}  r={9}  fill={WH} />
      </>}

      {/* Aşama 6+: kalın damarlar + yan güç tomurcukları */}
      {stage >= 6 && <>
        <Path d={`M ${CX-25},155 L ${CX-42},140 L ${CX-54},117`}
          stroke={VN} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+25},155 L ${CX+42},140 L ${CX+54},117`}
          stroke={VN} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX-10},230 L ${CX-7},208 L ${CX-10},186 L ${CX-8},168`}
          stroke={VN} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d={`M ${CX+10},230 L ${CX+7},208 L ${CX+10},186 L ${CX+8},168`}
          stroke={VN} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx={CX-70} cy={148} r={12} fill={YL} />
        <Circle cx={CX+70} cy={148} r={12} fill={YL} />
        <Circle cx={CX-70} cy={148} r={6}  fill={LY} />
        <Circle cx={CX+70} cy={148} r={6}  fill={LY} />
        <Circle cx={CX} cy={57} r={20} fill={YL} />
        <Circle cx={CX} cy={51} r={11} fill={LY} />
      </>}

      {/* Aşama 7: efsane — güç yıldızı + çift enerji halkası */}
      {stage >= 7 && <>
        <Star cx={CX} cy={42} r={16} fill={EN} />
        <Circle cx={CX} cy={42} r={7}  fill={WH} />
        <Circle cx={CX} cy={148} r={76} fill="none" stroke={EN}  strokeWidth={2}   opacity={0.32} />
        <Circle cx={CX} cy={148} r={92} fill="none" stroke={YL}  strokeWidth={1.2} opacity={0.18} />
        <Circle cx={CX-76} cy={186} r={12} fill={DK} />
        <Circle cx={CX+76} cy={186} r={12} fill={DK} />
        <Circle cx={CX-76} cy={186} r={6}  fill={HL} />
        <Circle cx={CX+76} cy={186} r={6}  fill={HL} />
        <Circle cx={CX-38} cy={72}  r={5}  fill={EN} />
        <Circle cx={CX+38} cy={72}  r={5}  fill={EN} />
      </>}
    </ScaleWrap>
  );
}

// ── TANRI AĞACI — gösterişli, tek, her zaman tam parlaklıkta ─────────────────
function GodTree() {
  const TK = '#5D3A00';  // koyu altın-kahve gövde
  const DG = '#B8860B';  // koyu altın
  const GO = '#FFD700';  // saf altın
  const LG = '#FFECB3';  // açık altın
  const CG = '#FFF9C4';  // krem altın
  const WH = '#FFFDE7';  // sıcak beyaz
  const PW = '#FFFFFF';  // saf beyaz tepe

  return (
    <G>
      {/* Gövde */}
      <Rect x={CX-11} y={192} width={22} height={64} rx={6} fill={TK} />
      <Rect x={CX-6}  y={192} width={12} height={64} rx={4} fill={DG} />
      <Rect x={CX-2}  y={192} width={4}  height={64} rx={2} fill={GO} opacity={0.7} />
      {/* Kökler */}
      <Path d={`M ${CX-11},250 Q ${CX-30},258 ${CX-24},258 Q ${CX-12},258 ${CX-11},250`} fill={TK} />
      <Path d={`M ${CX+11},250 Q ${CX+30},258 ${CX+24},258 Q ${CX+12},258 ${CX+11},250`} fill={TK} />

      {/* Katman 1 — en geniş, altın */}
      <Circle cx={CX-34} cy={200} r={36} fill={DG} />
      <Circle cx={CX+34} cy={200} r={36} fill={DG} />
      <Circle cx={CX}    cy={192} r={56} fill={DG} />
      <Circle cx={CX-32} cy={196} r={30} fill={GO} />
      <Circle cx={CX+32} cy={196} r={30} fill={GO} />
      <Circle cx={CX}    cy={188} r={50} fill={GO} />

      {/* Katman 2 — açık altın */}
      <Circle cx={CX-22} cy={162} r={36} fill={GO} />
      <Circle cx={CX+22} cy={162} r={36} fill={GO} />
      <Circle cx={CX}    cy={155} r={48} fill={GO} />
      <Circle cx={CX-20} cy={159} r={28} fill={LG} />
      <Circle cx={CX+20} cy={159} r={28} fill={LG} />
      <Circle cx={CX}    cy={152} r={42} fill={LG} />

      {/* Katman 3 — krem */}
      <Circle cx={CX-14} cy={128} r={30} fill={LG} />
      <Circle cx={CX+14} cy={128} r={30} fill={LG} />
      <Circle cx={CX}    cy={122} r={40} fill={LG} />
      <Circle cx={CX-12} cy={125} r={22} fill={CG} />
      <Circle cx={CX+12} cy={125} r={22} fill={CG} />
      <Circle cx={CX}    cy={119} r={33} fill={CG} />

      {/* Katman 4 — sıcak beyaz */}
      <Circle cx={CX-8}  cy={96}  r={24} fill={CG} />
      <Circle cx={CX+8}  cy={96}  r={24} fill={CG} />
      <Circle cx={CX}    cy={90}  r={30} fill={CG} />
      <Circle cx={CX}    cy={87}  r={24} fill={WH} />

      {/* Tepe — saf beyaz ışıkla */}
      <Circle cx={CX} cy={65} r={18} fill={WH} />
      <Circle cx={CX} cy={62} r={13} fill={PW} />
      <Circle cx={CX} cy={59} r={7}  fill={PW} />

      {/* Halo halkaları */}
      <Circle cx={CX} cy={130} r={74} fill="none" stroke={GO} strokeWidth={2}   opacity={0.38} />
      <Circle cx={CX} cy={130} r={90} fill="none" stroke={LG} strokeWidth={1.5} opacity={0.22} />
      <Circle cx={CX} cy={130} r={105} fill="none" stroke={CG} strokeWidth={1}  opacity={0.14} />

      {/* Yıldız parıltılar */}
      <Star cx={CX-48} cy={188} r={5.5} fill={PW} />
      <Star cx={CX+50} cy={183} r={5}   fill={PW} />
      <Star cx={CX-35} cy={153} r={4.5} fill={PW} />
      <Star cx={CX+36} cy={149} r={4}   fill={PW} />
      <Star cx={CX-22} cy={120} r={4}   fill={PW} />
      <Star cx={CX+24} cy={116} r={4}   fill={PW} />
      <Star cx={CX-10} cy={88}  r={3.5} fill={PW} />
      <Star cx={CX+12} cy={84}  r={3.5} fill={PW} />
      <Star cx={CX}    cy={46}  r={8}   fill={PW} />

      {/* Işık saçakları — tepeden */}
      <Path d={`M ${CX},55 L ${CX-18},28`} stroke={LG} strokeWidth={2.5} strokeLinecap="round" opacity={0.65} />
      <Path d={`M ${CX},55 L ${CX},22`}    stroke={LG} strokeWidth={3}   strokeLinecap="round" opacity={0.7} />
      <Path d={`M ${CX},55 L ${CX+18},28`} stroke={LG} strokeWidth={2.5} strokeLinecap="round" opacity={0.65} />
      <Path d={`M ${CX},55 L ${CX-30},40`} stroke={GO} strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
      <Path d={`M ${CX},55 L ${CX+30},40`} stroke={GO} strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
    </G>
  );
}

// Melek kanadı (sağ) — God Tree tıklanınca görünür
export function GodWingRight() {
  const GO = '#FFD700';
  const LG = '#FFF9C4';
  const WH = '#FFFFFF';
  const GH = '#DAA520';

  return (
    <G opacity={0.90}>
      {/* Ana kanat gövdesi */}
      <Path
        d={`M ${CX+4},162
            C ${CX+30},140 ${CX+58},115 ${CX+76},86
            C ${CX+64},108 ${CX+52},126 ${CX+46},144
            C ${CX+64},116 ${CX+76},98  ${CX+84},76
            C ${CX+70},100 ${CX+56},120 ${CX+50},140
            C ${CX+66},114 ${CX+76},96  ${CX+80},78
            C ${CX+64},104 ${CX+52},124 ${CX+46},146
            Z`}
        fill={GO}
      />
      {/* İkinci tüy katmanı */}
      <Path
        d={`M ${CX+4},166
            C ${CX+26},148 ${CX+48},128 ${CX+64},106
            C ${CX+54},120 ${CX+44},136 ${CX+40},154
            C ${CX+54},132 ${CX+64},118 ${CX+68},104
            C ${CX+56},120 ${CX+44},136 ${CX+40},154
            Z`}
        fill={LG}
        opacity={0.82}
      />
      {/* İç parlama */}
      <Path
        d={`M ${CX+4},170
            C ${CX+22},156 ${CX+38},140 ${CX+50},122
            C ${CX+42},136 ${CX+34},150 ${CX+30},164
            Z`}
        fill={WH}
        opacity={0.7}
      />
      {/* Üst kenar çizgisi */}
      <Path
        d={`M ${CX+4},162 C ${CX+30},140 ${CX+58},115 ${CX+76},86`}
        stroke={WH} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.88}
      />
      {/* Tüy çizgileri */}
      <Path d={`M ${CX+46},144 C ${CX+60},118 ${CX+74},98 ${CX+82},78`}   stroke={GH} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.55} />
      <Path d={`M ${CX+32},156 C ${CX+44},134 ${CX+56},116 ${CX+64},100`} stroke={GH} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.55} />
      <Path d={`M ${CX+18},164 C ${CX+28},146 ${CX+38},132 ${CX+46},118`} stroke={GH} strokeWidth={1}   fill="none" strokeLinecap="round" opacity={0.45} />
    </G>
  );
}

// ── SAHNE ARKA PLANLARI ───────────────────────────────────────────────────────
export function SceneBackground({ skinId }: { skinId: string }) {
  switch (skinId) {

    case 'flame':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#7B1200" />
          <Rect x={0} y={0} width={200} height={160} fill="#BF360C" opacity={0.75} />
          {/* Duman */}
          <Circle cx={72}  cy={24} r={26} fill="#212121" opacity={0.55} />
          <Circle cx={98}  cy={14} r={20} fill="#424242" opacity={0.5} />
          <Circle cx={122} cy={22} r={23} fill="#212121" opacity={0.5} />
          <Circle cx={148} cy={16} r={18} fill="#424242" opacity={0.45} />
          {/* Yanardağ gövdesi — ağaç krater ortasından çıkacak */}
          <Polygon points="0,270 58,196 85,196 85,215 28,270" fill="#3E2723" />
          <Polygon points="200,270 142,196 115,196 115,215 172,270" fill="#3E2723" />
          <Polygon points="0,270 48,270 62,240 0,248" fill="#4E342E" />
          <Polygon points="200,270 152,270 138,240 200,248" fill="#4E342E" />
          {/* Krater parıltısı */}
          <Rect x={82} y={192} width={36} height={9} rx={4} fill="#FF6D00" />
          <Rect x={89} y={190} width={22} height={7} rx={3} fill="#FFD600" opacity={0.9} />
          {/* Lav çatlakları */}
          <Path d="M 32,264 L 50,256 L 64,261 L 80,255" stroke="#FF6D00" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <Path d="M 168,264 L 150,256 L 136,261 L 120,255" stroke="#FF6D00" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          {/* Kaya zemin */}
          <Path d="M 0,255 Q 100,244 200,255 L 200,270 L 0,270 Z" fill="#4E342E" />
        </G>
      );

    case 'zombie':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#0D1A0D" />
          <Rect x={0} y={0} width={200} height={200} fill="#1B2B1B" opacity={0.8} />
          {/* Sis */}
          <Rect x={0} y={185} width={200} height={55} fill="#37474F" opacity={0.22} />
          {/* Ay + gölge */}
          <Circle cx={158} cy={32} r={22} fill="#CFD8DC" />
          <Circle cx={166} cy={26} r={17} fill="#0D1A0D" />
          {/* Yıldızlar */}
          <Circle cx={18}  cy={14} r={1.8} fill="#B0BEC5" />
          <Circle cx={48}  cy={7}  r={1.4} fill="#CFD8DC" />
          <Circle cx={80}  cy={19} r={1.8} fill="#B0BEC5" />
          <Circle cx={108} cy={11} r={1.2} fill="#CFD8DC" />
          <Circle cx={32}  cy={44} r={1}   fill="#90A4AE" />
          {/* Mezar taşları */}
          <Rect x={16} y={228} width={20} height={26} rx={6} fill="#455A64" />
          <Rect x={14} y={223} width={24} height={9}  rx={4} fill="#546E7A" />
          <Rect x={162} y={232} width={18} height={22} rx={5} fill="#455A64" />
          <Rect x={160} y={227} width={22} height={8}  rx={3} fill="#546E7A" />
          {/* Toprak */}
          <Path d="M 0,250 Q 100,240 200,250 L 200,270 L 0,270 Z" fill="#1B2F1B" />
          <Path d="M 0,258 Q 100,250 200,258 L 200,270 L 0,270 Z" fill="#263238" />
        </G>
      );

    case 'alien':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#0A001F" />
          {/* Yıldızlar */}
          <Circle cx={12}  cy={10} r={1.5} fill="#E040FB" />
          <Circle cx={38}  cy={22} r={1}   fill="#fff" />
          <Circle cx={62}  cy={7}  r={1.5} fill="#00E5FF" />
          <Circle cx={88}  cy={17} r={1}   fill="#fff" />
          <Circle cx={118} cy={5}  r={1.5} fill="#E040FB" />
          <Circle cx={148} cy={19} r={1}   fill="#fff" />
          <Circle cx={174} cy={11} r={1.5} fill="#00E5FF" />
          <Circle cx={28}  cy={46} r={1}   fill="#fff" />
          <Circle cx={52}  cy={36} r={1.5} fill="#CE93D8" />
          <Circle cx={132} cy={40} r={1}   fill="#fff" />
          <Circle cx={184} cy={33} r={1.5} fill="#CE93D8" />
          {/* Uzak gezegen */}
          <Circle cx={28} cy={38} r={13} fill="#4A148C" opacity={0.7} />
          <Circle cx={28} cy={38} r={8}  fill="#7B1FA2" opacity={0.55} />
          {/* Uzaylı zemin */}
          <Path d="M 0,250 Q 40,236 80,248 Q 120,260 160,240 Q 182,233 200,244 L 200,270 L 0,270 Z" fill="#1A0033" />
          <Path d="M 0,258 Q 60,248 120,256 Q 162,262 200,254 L 200,270 L 0,270 Z" fill="#2D0052" />
          {/* Uzaylı bitkiler */}
          <Circle cx={22} cy={244} r={10} fill="#7B1FA2" opacity={0.85} />
          <Rect x={20} y={244} width={4} height={16} rx={2} fill="#4A148C" />
          <Circle cx={178} cy={240} r={9} fill="#00BCD4" opacity={0.75} />
          <Rect x={176} y={240} width={4} height={16} rx={2} fill="#006064" />
        </G>
      );

    case 'christmas':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#0D1B3E" />
          {/* Yıldızlar */}
          <Circle cx={18}  cy={14} r={1.5} fill="#fff" />
          <Circle cx={46}  cy={7}  r={2}   fill="#FFF59D" />
          <Circle cx={76}  cy={21} r={1}   fill="#fff" />
          <Circle cx={108} cy={9}  r={1.5} fill="#FFF59D" />
          <Circle cx={138} cy={17} r={1}   fill="#fff" />
          <Circle cx={166} cy={7}  r={2}   fill="#FFF59D" />
          <Circle cx={188} cy={24} r={1}   fill="#fff" />
          <Circle cx={32}  cy={37} r={1}   fill="#fff" />
          <Circle cx={154} cy={33} r={1.5} fill="#FFF59D" />
          {/* Ay */}
          <Circle cx={168} cy={34} r={18} fill="#FFF9C4" opacity={0.9} />
          {/* Kar taneleri */}
          <Circle cx={22}  cy={68}  r={3} fill="#fff" opacity={0.7} />
          <Circle cx={58}  cy={53}  r={2.5} fill="#fff" opacity={0.65} />
          <Circle cx={100} cy={46}  r={2} fill="#fff" opacity={0.6} />
          <Circle cx={143} cy={62}  r={3} fill="#fff" opacity={0.65} />
          <Circle cx={178} cy={50}  r={2.5} fill="#fff" opacity={0.7} />
          <Circle cx={14}  cy={130} r={2.5} fill="#fff" opacity={0.5} />
          <Circle cx={184} cy={118} r={2} fill="#fff" opacity={0.55} />
          {/* Kar zemini */}
          <Path d="M 0,244 Q 50,234 100,243 Q 150,252 200,243 L 200,270 L 0,270 Z" fill="#E3F2FD" />
          <Path d="M 0,254 Q 60,248 120,255 Q 165,261 200,254 L 200,270 L 0,270 Z" fill="#fff" />
        </G>
      );

    case 'iron':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#263238" />
          <Rect x={0} y={0} width={200} height={140} fill="#1C2A30" />
          {/* Borular */}
          <Rect x={0}   y={80} width={14}  height={160} rx={4} fill="#455A64" />
          <Rect x={186} y={80} width={14}  height={160} rx={4} fill="#455A64" />
          <Circle cx={7}   cy={78} r={9} fill="#546E7A" />
          <Circle cx={193} cy={78} r={9} fill="#546E7A" />
          {/* Dişliler */}
          <Circle cx={26}  cy={52} r={20} fill="none" stroke="#546E7A" strokeWidth={5} />
          <Circle cx={26}  cy={52} r={9}  fill="#455A64" />
          <Circle cx={164} cy={42} r={15} fill="none" stroke="#546E7A" strokeWidth={4} />
          <Circle cx={164} cy={42} r={6}  fill="#455A64" />
          {/* Metal platform */}
          <Rect x={0} y={252} width={200} height={18} fill="#37474F" />
          <Rect x={0} y={248} width={200} height={5}  fill="#546E7A" />
          {/* Perçinler */}
          <Circle cx={20}  cy={258} r={3} fill="#607D8B" />
          <Circle cx={52}  cy={258} r={3} fill="#607D8B" />
          <Circle cx={84}  cy={258} r={3} fill="#607D8B" />
          <Circle cx={116} cy={258} r={3} fill="#607D8B" />
          <Circle cx={148} cy={258} r={3} fill="#607D8B" />
          <Circle cx={180} cy={258} r={3} fill="#607D8B" />
          <Path d="M 0,252 L 200,252" stroke="#607D8B" strokeWidth={1} fill="none" />
        </G>
      );

    case 'robotic':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#0D1F26" />
          {/* Devre hatları */}
          <Path d="M 0,62 H 42 V 82 H 72" stroke="#00BCD4" strokeWidth={1} fill="none" opacity={0.5} />
          <Path d="M 200,92 H 158 V 72 H 128" stroke="#00BCD4" strokeWidth={1} fill="none" opacity={0.5} />
          <Path d="M 0,152 H 32 V 132 H 58" stroke="#00E5FF" strokeWidth={0.8} fill="none" opacity={0.4} />
          <Path d="M 200,162 H 168 V 142 H 142" stroke="#00E5FF" strokeWidth={0.8} fill="none" opacity={0.4} />
          {/* LED noktalar */}
          <Circle cx={42}  cy={62}  r={3} fill="#00E5FF" opacity={0.85} />
          <Circle cx={72}  cy={82}  r={3} fill="#00BCD4" opacity={0.85} />
          <Circle cx={158} cy={92}  r={3} fill="#00E5FF" opacity={0.85} />
          <Circle cx={128} cy={72}  r={3} fill="#00BCD4" opacity={0.85} />
          <Circle cx={58}  cy={132} r={3} fill="#00E5FF" opacity={0.75} />
          <Circle cx={142} cy={142} r={3} fill="#00E5FF" opacity={0.75} />
          {/* Devre zemin */}
          <Rect x={0} y={248} width={200} height={22} fill="#162028" />
          <Rect x={0} y={245} width={200} height={5}  fill="#00BCD4" opacity={0.55} />
          <Path d="M 10,254 H 42 V 260 H 68" stroke="#00E5FF" strokeWidth={1} fill="none" opacity={0.65} />
          <Path d="M 190,254 H 158 V 260 H 132" stroke="#00E5FF" strokeWidth={1} fill="none" opacity={0.65} />
          <Circle cx={42}  cy={254} r={3.5} fill="#00E5FF" opacity={0.8} />
          <Circle cx={158} cy={254} r={3.5} fill="#00E5FF" opacity={0.8} />
        </G>
      );

    case 'electric':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#0D1240" />
          <Rect x={0} y={0} width={200} height={180} fill="#1A237E" opacity={0.65} />
          {/* Fırtına bulutları */}
          <Circle cx={28}  cy={30} r={26} fill="#263238" opacity={0.95} />
          <Circle cx={54}  cy={22} r={30} fill="#37474F" opacity={0.95} />
          <Circle cx={80}  cy={28} r={24} fill="#263238" opacity={0.9} />
          <Circle cx={138} cy={26} r={25} fill="#37474F" opacity={0.95} />
          <Circle cx={164} cy={18} r={23} fill="#263238" opacity={0.9} />
          <Circle cx={186} cy={27} r={22} fill="#37474F" opacity={0.95} />
          {/* Şimşek */}
          <Path d="M 18,88 L 10,108 L 18,108 L 10,128" stroke="#FFD600" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M 182,84 L 190,104 L 182,104 L 190,124" stroke="#FFD600" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Elektrik zemin */}
          <Rect x={0} y={249} width={200} height={21} fill="#1A237E" />
          <Rect x={0} y={245} width={200} height={6}  fill="#3F51B5" />
          <Circle cx={36}  cy={252} r={5} fill="#FFD600" opacity={0.65} />
          <Circle cx={164} cy={252} r={5} fill="#FFD600" opacity={0.65} />
          <Path d="M 30,250 L 25,260 L 32,260 L 27,268" stroke="#FFD600" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
          <Path d="M 170,250 L 175,260 L 168,260 L 173,268" stroke="#FFD600" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
        </G>
      );

    case 'golden':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#E65100" />
          <Rect x={0} y={0} width={200} height={170} fill="#FF8F00" opacity={0.6} />
          {/* Güneş */}
          <Circle cx={100} cy={-25} r={65} fill="#FFD600" opacity={0.28} />
          <Circle cx={100} cy={-25} r={38} fill="#FFFF00" opacity={0.22} />
          {/* Işıltılar */}
          <Circle cx={20}  cy={80}  r={6} fill="#FFD600" opacity={0.9} />
          <Circle cx={22}  cy={78}  r={2.5} fill="#fff" opacity={0.85} />
          <Circle cx={174} cy={62}  r={7} fill="#FFD600" opacity={0.9} />
          <Circle cx={176} cy={60}  r={3} fill="#fff" opacity={0.85} />
          <Circle cx={35}  cy={162} r={5} fill="#FFF59D" opacity={0.85} />
          <Circle cx={165} cy={142} r={6} fill="#FFF59D" opacity={0.85} />
          {/* Altın paralar */}
          <Circle cx={16}  cy={248} r={8} fill="#FFD600" />
          <Circle cx={16}  cy={248} r={4.5} fill="#FF8F00" />
          <Circle cx={184} cy={244} r={7} fill="#FFD600" />
          <Circle cx={184} cy={244} r={4} fill="#FF8F00" />
          {/* Altın zemin */}
          <Path d="M 0,246 Q 60,234 100,243 Q 150,252 200,242 L 200,270 L 0,270 Z" fill="#A65100" />
          <Path d="M 0,255 Q 70,247 130,254 Q 165,260 200,253 L 200,270 L 0,270 Z" fill="#BF360C" />
        </G>
      );

    case 'hayat':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#80D8FF" />
          {/* Güneş */}
          <Circle cx={168} cy={32} r={24} fill="#FFD600" opacity={0.92} />
          <Circle cx={168} cy={32} r={15} fill="#FFFF00" opacity={0.7} />
          {/* Bulutlar */}
          <Circle cx={34}  cy={27} r={18} fill="#fff" opacity={0.92} />
          <Circle cx={52}  cy={20} r={23} fill="#fff" opacity={0.92} />
          <Circle cx={70}  cy={26} r={17} fill="#fff" opacity={0.88} />
          <Circle cx={118} cy={43} r={15} fill="#fff" opacity={0.82} />
          <Circle cx={133} cy={36} r={18} fill="#fff" opacity={0.82} />
          <Circle cx={148} cy={42} r={14} fill="#fff" opacity={0.78} />
          {/* Bahçe zemini */}
          <Path d="M 0,244 Q 100,232 200,244 L 200,270 L 0,270 Z" fill="#2E7D32" />
          <Path d="M 0,252 Q 80,244 160,252 Q 182,256 200,252 L 200,270 L 0,270 Z" fill="#43A047" />
          {/* Çiçekler */}
          <Circle cx={20}  cy={243} r={7} fill="#FF80AB" />
          <Circle cx={22}  cy={241} r={3.5} fill="#FFD600" />
          <Rect x={19} y={243} width={3} height={11} rx={1.5} fill="#1B5E20" />
          <Circle cx={180} cy={240} r={7} fill="#FF80AB" />
          <Circle cx={182} cy={238} r={3.5} fill="#FFD600" />
          <Rect x={179} y={240} width={3} height={11} rx={1.5} fill="#1B5E20" />
          <Circle cx={52}  cy={248} r={6} fill="#CE93D8" />
          <Circle cx={54}  cy={246} r={3} fill="#FFD600" />
          <Circle cx={152} cy={246} r={6} fill="#CE93D8" />
          <Circle cx={154} cy={244} r={3} fill="#FFD600" />
        </G>
      );

    case 'sporty':
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#E65100" />
          <Rect x={0} y={0} width={200} height={200} fill="#FFD600" opacity={0.22} />
          {/* Tribün ışıkları */}
          <Rect x={0}   y={32} width={16} height={110} rx={4} fill="#BF360C" />
          <Circle cx={8}   cy={30} r={14} fill="#FFD600" opacity={0.92} />
          <Circle cx={8}   cy={30} r={8}  fill="#fff" opacity={0.85} />
          <Rect x={184} y={32} width={16} height={110} rx={4} fill="#BF360C" />
          <Circle cx={192} cy={30} r={14} fill="#FFD600" opacity={0.92} />
          <Circle cx={192} cy={30} r={8}  fill="#fff" opacity={0.85} />
          {/* Enerji halkaları */}
          <Circle cx={100} cy={92} r={56} fill="none" stroke="#FFD600" strokeWidth={2} opacity={0.24} />
          <Circle cx={100} cy={92} r={40} fill="none" stroke="#FFD600" strokeWidth={1.5} opacity={0.18} />
          {/* Parke zemin */}
          <Rect x={0} y={248} width={200} height={22} fill="#4E342E" />
          <Rect x={0} y={244} width={200} height={6}  fill="#FF8F00" />
          {/* Şerit çizgiler */}
          <Path d="M 0,256 L 200,256" stroke="#FFD600" strokeWidth={2} fill="none" opacity={0.6} strokeDasharray="14,8" />
          <Path d="M 0,263 L 200,263" stroke="#FFD600" strokeWidth={1.5} fill="none" opacity={0.4} strokeDasharray="14,8" />
        </G>
      );

    case 'monster':
      return (
        <G>
          {/* Karanlık cehennem gökyüzü */}
          <Rect x={0} y={0} width={200} height={270} fill="#0A0008" />
          <Rect x={0} y={0} width={200} height={190} fill="#1A000A" opacity={0.85} />
          {/* Kızıl ay */}
          <Circle cx={152} cy={35} r={28} fill="#4A0000" opacity={0.8} />
          <Circle cx={152} cy={35} r={20} fill="#7B0000" opacity={0.65} />
          <Circle cx={152} cy={35} r={11} fill="#B71C1C" opacity={0.5} />
          {/* Kor kıvılcımlar */}
          <Circle cx={22}  cy={42} r={1.8} fill="#FF5722" opacity={0.8} />
          <Circle cx={48}  cy={28} r={1.2} fill="#FF6D00" opacity={0.7} />
          <Circle cx={80}  cy={55} r={1.5} fill="#FF5722" opacity={0.75} />
          <Circle cx={110} cy={35} r={1}   fill="#FFCC02" opacity={0.65} />
          <Circle cx={128} cy={58} r={1.8} fill="#FF5722" opacity={0.7} />
          <Circle cx={175} cy={45} r={1.2} fill="#FF6D00" opacity={0.8} />
          <Circle cx={32}  cy={80} r={1}   fill="#FF5722" opacity={0.6} />
          <Circle cx={168} cy={75} r={1.5} fill="#FF6D00" opacity={0.6} />
          {/* Koyu dikiler */}
          <Polygon points="6,180 18,122 30,180"    fill="#1A0025" />
          <Polygon points="170,180 182,132 194,180" fill="#1A0025" />
          <Polygon points="0,180 10,150 20,180"    fill="#12001A" />
          <Polygon points="180,180 190,157 200,180" fill="#12001A" />
          {/* Lav zemini */}
          <Rect x={0} y={250} width={200} height={20} fill="#1A0000" />
          <Path d="M 0,248 Q 30,240 60,248 Q 90,256 120,246 Q 150,236 180,246 Q 192,250 200,248 L 200,270 L 0,270 Z" fill="#4A0000" />
          <Path d="M 0,256 Q 40,250 80,257 Q 120,264 160,256 Q 182,252 200,256 L 200,270 L 0,270 Z" fill="#7B0000" />
          {/* Lav çatlakları */}
          <Path d="M 20,260 L 38,252 L 52,258 L 68,252" stroke="#FF3D00" strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.7} />
          <Path d="M 132,254 L 148,248 L 165,256 L 180,250" stroke="#FF3D00" strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.7} />
          <Path d="M 80,262 L 100,255 L 120,262" stroke="#FF6D00" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
          {/* Kafatasları */}
          <Circle cx={24} cy={248} r={9}  fill="#263238" />
          <Circle cx={24} cy={245} r={6}  fill="#37474F" />
          <Circle cx={20} cy={244} r={2}  fill="#0A0008" />
          <Circle cx={28} cy={244} r={2}  fill="#0A0008" />
          <Circle cx={176} cy={244} r={9} fill="#263238" />
          <Circle cx={176} cy={241} r={6} fill="#37474F" />
          <Circle cx={172} cy={240} r={2} fill="#0A0008" />
          <Circle cx={180} cy={240} r={2} fill="#0A0008" />
        </G>
      );

    case 'god': // ilahi cennet gökyüzü
      return (
        <G>
          {/* Gökyüzü — yumuşak gök-beyaz gradyan */}
          <Rect x={0} y={0} width={200} height={270} fill="#E8F4FD" />
          <Rect x={0} y={0} width={200} height={160} fill="#FFFDE7" opacity={0.55} />
          {/* İlahi ışık saçakları — tepeden */}
          <Path d="M 100,0 L 60,200"  stroke="#FFD700" strokeWidth={18} strokeLinecap="round" opacity={0.10} />
          <Path d="M 100,0 L 100,270" stroke="#FFD700" strokeWidth={22} strokeLinecap="round" opacity={0.13} />
          <Path d="M 100,0 L 140,200" stroke="#FFD700" strokeWidth={18} strokeLinecap="round" opacity={0.10} />
          <Path d="M 100,0 L 32,260"  stroke="#FFF9C4" strokeWidth={10} strokeLinecap="round" opacity={0.07} />
          <Path d="M 100,0 L 168,260" stroke="#FFF9C4" strokeWidth={10} strokeLinecap="round" opacity={0.07} />
          {/* Bulutlar */}
          <Circle cx={28}  cy={36} r={20} fill="#fff" opacity={0.88} />
          <Circle cx={48}  cy={28} r={25} fill="#fff" opacity={0.88} />
          <Circle cx={68}  cy={34} r={18} fill="#fff" opacity={0.82} />
          <Circle cx={148} cy={46} r={16} fill="#fff" opacity={0.78} />
          <Circle cx={164} cy={38} r={20} fill="#fff" opacity={0.78} />
          <Circle cx={180} cy={44} r={14} fill="#fff" opacity={0.72} />
          {/* Altın parıltılar */}
          <Circle cx={22}  cy={90}  r={3}   fill="#FFD700" opacity={0.75} />
          <Circle cx={24}  cy={88}  r={1.2} fill="#fff"    opacity={0.9} />
          <Circle cx={178} cy={78}  r={3.5} fill="#FFD700" opacity={0.75} />
          <Circle cx={180} cy={76}  r={1.5} fill="#fff"    opacity={0.9} />
          <Circle cx={14}  cy={155} r={2.5} fill="#FFD700" opacity={0.65} />
          <Circle cx={186} cy={140} r={2.5} fill="#FFD700" opacity={0.65} />
          <Star cx={12}  cy={65}  r={4}   fill="#FFD700" />
          <Star cx={188} cy={55}  r={3.5} fill="#FFD700" />
          <Star cx={50}  cy={118} r={3}   fill="#FFF9C4" />
          <Star cx={150} cy={108} r={3}   fill="#FFF9C4" />
          {/* Bahçe zemini — altın-yeşil */}
          <Path d="M 0,244 Q 100,232 200,244 L 200,270 L 0,270 Z" fill="#E8F5E9" />
          <Path d="M 0,254 Q 80,246 160,254 Q 182,258 200,254 L 200,270 L 0,270 Z" fill="#C8E6C9" />
          {/* Altın çiçekler */}
          <Circle cx={18}  cy={242} r={8}   fill="#FFD700" opacity={0.9} />
          <Circle cx={20}  cy={240} r={4}   fill="#fff" opacity={0.85} />
          <Rect x={17} y={242} width={3.5} height={13} rx={1.5} fill="#43A047" />
          <Circle cx={182} cy={240} r={8}   fill="#FFD700" opacity={0.9} />
          <Circle cx={184} cy={238} r={4}   fill="#fff" opacity={0.85} />
          <Rect x={181} y={240} width={3.5} height={13} rx={1.5} fill="#43A047" />
          <Circle cx={50}  cy={248} r={6}   fill="#FFF59D" opacity={0.85} />
          <Circle cx={52}  cy={246} r={3}   fill="#FFD700" opacity={0.8} />
          <Circle cx={150} cy={246} r={6}   fill="#FFF59D" opacity={0.85} />
          <Circle cx={152} cy={244} r={3}   fill="#FFD700" opacity={0.8} />
        </G>
      );

    default: // yeşil çayır
      return (
        <G>
          <Rect x={0} y={0} width={200} height={270} fill="#81D4FA" />
          {/* Bulutlar */}
          <Circle cx={36}  cy={30} r={17} fill="#fff" opacity={0.92} />
          <Circle cx={54}  cy={23} r={21} fill="#fff" opacity={0.92} />
          <Circle cx={72}  cy={29} r={15} fill="#fff" opacity={0.88} />
          <Circle cx={146} cy={44} r={14} fill="#fff" opacity={0.82} />
          <Circle cx={161} cy={37} r={17} fill="#fff" opacity={0.82} />
          <Circle cx={176} cy={43} r={13} fill="#fff" opacity={0.78} />
          {/* Yeşil tepe */}
          <Path d="M 0,242 Q 100,222 200,242 L 200,270 L 0,270 Z" fill="#388E3C" />
          <Path d="M 0,252 Q 80,244 160,252 Q 182,256 200,252 L 200,270 L 0,270 Z" fill="#4CAF50" />
        </G>
      );
  }
}

// ── ANA BİLEŞEN ───────────────────────────────────────────────────────────────
export default function TreeSVG({ skinId, xp, hp, size = 200, showBackground = true }: {
  skinId: string; xp: number; hp?: number; size?: number; showBackground?: boolean;
}) {
  const stage  = getStage(xp);
  const svgH   = Math.round(size * VH / VW);

  const tree = (() => {
    switch (skinId) {

      // 👹 Canavar — 10 hasar aşaması, HP azaldıkça bozulur
      case 'monster':
        return <MonsterTree hp={hp ?? 10000} />;

      // 💪 Sportif — 8 aşamalı, sarı-turuncu kaslı, damarlı
      case 'sporty':
        return <SportyTree xp={xp} />;

      // 👽 Uzaylı — 8 aşamalı, kendi treeXp'si ile büyür
      case 'alien':
        return <AlienTree xp={xp} />;

      // 🌿 Hayat — yuvarlak yeşil taç, çiçeklerle dolar
      case 'hayat':
        return <HayatTree stage={stage} />;

      // 🧟 Zombi — çıplak dallar + yeşil damlalar
      case 'zombie':
        return <ZombieTree stage={stage} />;

      // 🔩 Demir — gri çam, cıvata detayları
      case 'iron':
        return (
          <PineBase trunkColor="#455A64" colors={['#607D8B', '#78909C', '#90A4AE']} stage={stage}
            decorations={<G>
              <Circle cx={68}  cy={218} r={4} fill="#B0BEC5" />
              <Circle cx={132} cy={215} r={4} fill="#B0BEC5" />
              <Circle cx={80}  cy={187} r={3} fill="#CFD8DC" />
              <Circle cx={120} cy={184} r={3} fill="#CFD8DC" />
              <Circle cx={88}  cy={155} r={3} fill="#ECEFF1" />
              <Circle cx={112} cy={153} r={3} fill="#ECEFF1" />
            </G>}
          />
        );

      // 🎄 Yılbaşı — koyu yeşil çam, süsler ve yıldız
      case 'christmas':
        return (
          <PineBase trunkColor="#5D4037" colors={['#1B5E20', '#2E7D32', '#388E3C']} stage={stage}
            decorations={<G>
              <Circle cx={68}  cy={218} r={6} fill="#F44336" />
              <Circle cx={132} cy={215} r={6} fill="#FFD600" />
              <Circle cx={82}  cy={188} r={5} fill="#2196F3" />
              <Circle cx={118} cy={185} r={5} fill="#E91E63" />
              <Circle cx={90}  cy={157} r={4} fill="#FF9800" />
              <Circle cx={110} cy={154} r={4} fill="#F44336" />
              <Path d={`M 38,230 Q 70,225 100,231 Q 130,237 162,230`}
                stroke="#FFD600" strokeWidth={2} fill="none" />
              <Star cx={CX} cy={86} r={13} fill="#FFD600" />
              <Circle cx={CX} cy={86} r={5} fill="#FF6F00" />
            </G>}
          />
        );

      // 🤖 Robotik — mavi-gri çam, devre hatları ve LED gözler
      case 'robotic':
        return (
          <PineBase trunkColor="#263238" colors={['#37474F', '#455A64', '#546E7A']} stage={stage}
            decorations={<G>
              <Path d={`M 48,226 H 68 V 216 H 82`} stroke="#00BCD4" strokeWidth={2} fill="none" />
              <Path d={`M 152,226 H 132 V 216 H 118`} stroke="#00BCD4" strokeWidth={2} fill="none" />
              <Path d={`M 58,192 H 74 V 183 H 88`} stroke="#00E5FF" strokeWidth={1.5} fill="none" />
              <Path d={`M 142,192 H 126 V 183 H 112`} stroke="#00E5FF" strokeWidth={1.5} fill="none" />
              <Rect x={65} y={213} width={7} height={7} fill="#00BCD4" rx={1} />
              <Rect x={128} y={213} width={7} height={7} fill="#00BCD4" rx={1} />
              <Rect x={71} y={180} width={6} height={6} fill="#00E5FF" rx={1} />
              <Rect x={123} y={180} width={6} height={6} fill="#00E5FF" rx={1} />
              <Circle cx={92} cy={89}  r={6} fill="#00E5FF" />
              <Circle cx={108} cy={89} r={6} fill="#00E5FF" />
              <Circle cx={92} cy={89}  r={2.5} fill="#263238" />
              <Circle cx={108} cy={89} r={2.5} fill="#263238" />
            </G>}
          />
        );

      // ⚡ Elektrikli — mavi çam, şimşek cıvatalar
      case 'electric':
        return (
          <PineBase trunkColor="#1A237E" colors={['#0D47A1', '#1565C0', '#00BCD4']} stage={stage}
            decorations={<G>
              <Path d={`M 65,192 L 57,212 L 65,212 L 57,232`}
                stroke="#FFD600" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <Path d={`M 135,192 L 143,212 L 135,212 L 143,232`}
                stroke="#FFD600" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <Path d={`M 82,152 L 76,169 L 83,169 L 77,186`}
                stroke="#FFD600" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <Path d={`M 118,152 L 124,169 L 117,169 L 123,186`}
                stroke="#FFD600" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx={CX} cy={87} r={13} fill="#FFD600" opacity={0.9} />
              <Circle cx={CX} cy={87} r={6}  fill="#FFFFFF" />
            </G>}
          />
        );

      // ✨ Altın — sarı-altın çam, yıldız parıltılar ve taç
      case 'golden':
        return (
          <PineBase trunkColor="#BF360C" colors={['#F57F17', '#FBC02D', '#FDD835']} stage={stage}
            decorations={<G>
              <Star cx={65}  cy={213} r={7}  fill="#FFFFFF" />
              <Star cx={136} cy={210} r={7}  fill="#FFFFFF" />
              <Star cx={78}  cy={181} r={6}  fill="#FFFFFF" />
              <Star cx={124} cy={178} r={6}  fill="#FFFFFF" />
              <Star cx={89}  cy={150} r={5}  fill="#FFFFFF" />
              <Star cx={113} cy={147} r={5}  fill="#FFFFFF" />
              <Star cx={CX}  cy={83}  r={14} fill="#FFD600" />
              <Circle cx={CX} cy={83} r={5}  fill="#FF6F00" />
            </G>}
          />
        );

      // 🔥 Alev — turuncu-kırmızı çam, alev dilleri
      case 'flame':
        return (
          <PineBase trunkColor="#BF360C" colors={['#BF360C', '#E64A19', '#FF6D00']} stage={stage}
            decorations={<G>
              <Path d={`M 38,230 Q 44,210 56,217 Q 50,195 40,202`} fill="#FF9800" />
              <Path d={`M 162,230 Q 156,210 144,217 Q 150,195 160,202`} fill="#FF9800" />
              <Path d={`M 57,195 Q 60,175 68,182 Q 64,164 56,170`} fill="#FFCC02" />
              <Path d={`M 143,195 Q 140,175 132,182 Q 136,164 144,170`} fill="#FFCC02" />
              <Path d={`M ${CX},88 Q ${CX-13},66 ${CX},40 Q ${CX+13},66 ${CX},88`} fill="#FFD600" />
              <Path d={`M ${CX},88 Q ${CX-7},70 ${CX},52 Q ${CX+7},70 ${CX},88`} fill="#FF9800" />
            </G>}
          />
        );

      // ✨ Tanrı — gösterişli altın ağaç, her zaman tam boy
      case 'god':
        return <GodTree />;

      // 🌳 Varsayılan — klasik yeşil çam
      default:
        return (
          <PineBase trunkColor="#795548" colors={['#2E7D32', '#43A047', '#66BB6A']} stage={stage}
            decorations={<G>
              <Circle cx={60}  cy={204} r={3.5} fill="#A5D6A7" />
              <Circle cx={142} cy={200} r={3.5} fill="#A5D6A7" />
              <Circle cx={76}  cy={172} r={3}   fill="#C8E6C9" />
              <Circle cx={126} cy={170} r={3}   fill="#C8E6C9" />
              <Circle cx={88}  cy={141} r={2.5} fill="#E8F5E9" />
              <Circle cx={113} cy={139} r={2.5} fill="#E8F5E9" />
            </G>}
          />
        );
    }
  })();

  return (
    <Svg width={size} height={svgH} viewBox={`0 0 ${VW} ${VH}`}>
      {showBackground && <SceneBackground skinId={skinId} />}
      {tree}
    </Svg>
  );
}
