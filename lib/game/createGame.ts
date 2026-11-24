/**
 * createGame.ts — KAPLAY Game Logic (v3.0 Action-RPG + Kuis & Buff System)
 * Sesuai spesifikasi PRD.md (Game Engine, Physics, & Level Mechanics).
 * Sprites prosedural/PNG, parallax background, combat system, slime & bat monsters,
 * NPC Tantangan Kuis, sistem Buff (Shield, Speed, Star), prompt [E]/!,
 * invulnerability, knockback, HUD, partikel, SFX.
 * TANPA import React.
 */
import kaplay from "kaplay";
import { registerSprites } from "./sprites";
import type {
  AvatarGender,
  ChallengeItem,
  BuffType,
  GameInputAction,
  HudState,
  GameHudState,
  GameController,
} from "../types";
import {
  playJump,
  playHurt,
  playWin,
  playFanfare,
  playCollect,
  playCheckpoint,
  playWindChime,
  playAttack,
  playMonsterDefeat,
  playBuff,
  setBattleTempo,
  playBossIntro,
  playBossSlam,
  playBossShoot,
  playDeflect,
  playPartnerRescue,
  playDuoCutIn,
  playDuoSlash,
  stopBgm,
  setMuted,
} from "./sfx";

export type { GameController, GameHudState, GameInputAction };

let activeQuit: (() => void) | null = null;

// ======================= V3_CONFIG =======================

export const V3_CONFIG = {
  MAX_HP: 3,
  INVULN_SEC: 1.2,
  KNOCKBACK: { speed: 120, duration: 0.15, vy: -120 },
  ATTACK_COOLDOWN: 0.35,
  ATTACK_ANIM_SEC: 0.2,
  HITBOX: { w: 18, h: 14, duration: 0.15 },
  STAR: { speed: 220, lifespan: 1.2 },
  SPEED_BUFF: { moveMul: 1.35, jumpMul: 1.12, duration: 15 },
  STAR_BUFF: { duration: 20 },
  INTERACT_RANGE: 28,
  SLIME: { speed: 28, count: 3, hp: 1 },
  BAT: { speed: 24, count: 2, hp: 1, amp: 14, period: 2.4 },
  PARTICLES: 9,
  QUIZ_WRONG_FX: { shake: 4, flashSec: 0.2 },
  HUD_EMIT_SEC: 0.25,
  QUIZ_FEEDBACK_MS: 1200,
};

// ======================= PARTICLE CAP & HAPTIC HELPERS (FASE P-1) =======================

export const MAX_VFX_PARTICLES = 45;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeVfxParticles: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackVfxParticle(p: any): any {
  if (!p) return p;
  if (activeVfxParticles.length >= MAX_VFX_PARTICLES) {
    for (let i = activeVfxParticles.length - 1; i >= 0; i--) {
      const item = activeVfxParticles[i];
      if (item && item.exists && !item.exists()) {
        activeVfxParticles.splice(i, 1);
      }
    }
  }
  activeVfxParticles.push(p);
  while (activeVfxParticles.length > MAX_VFX_PARTICLES) {
    const oldest = activeVfxParticles.shift();
    try {
      if (oldest && typeof oldest.destroy === "function" && (!oldest.exists || oldest.exists())) {
        oldest.destroy();
      }
    } catch {
      // Abaikan jika sudah musnah
    }
  }
  return p;
}

export function triggerHaptic(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // Abaikan jika tidak didukung perangkat/browser
  }
}

// ======================= ZONA TERLARANG (L3) =======================

export const FORBIDDEN_ZONES = [
  { x: 30, r: 24 },   // Titik awal spawn
  { x: 180, r: 16 },  // Lampu jalan 1
  { x: 220, r: 16 },  // Bintang kenangan 1
  { x: 490, r: 16 },  // Bintang kenangan 2
  { x: 500, r: 24 },  // Lentera checkpoint 1
  { x: 560, r: 16 },  // Lampu jalan 2
  { x: 780, r: 16 },  // Bintang kenangan 3
  { x: 850, r: 16 },  // Lampu jalan 3
  { x: 930, r: 16 },  // Bintang kenangan 4
  { x: 1190, r: 24 }, // Lentera checkpoint 2 (Taman Puncak Sakura)
  { x: 1270, r: 40 }, // Pohon Sakura Raksasa & Partner
  { x: 1850, r: 60 }, // Kado akhir
];

export function isInForbiddenZone(x: number, extraRadius = 0): boolean {
  return FORBIDDEN_ZONES.some((z) => Math.abs(x - z.x) < z.r + extraRadius);
}

// ======================= TYPES =======================

export interface CreateGameOptions {
  canvas: HTMLCanvasElement;
  receiverName?: string;
  avatar?: AvatarGender;
  challenges?: ChallengeItem[];
  isTouch?: boolean;
  isMuted?: boolean;
  memories?: string[];
  debug?: boolean;
  onLoadProgress?: (percent: number) => void;
  onHudUpdate?: (hud: GameHudState) => void;
  onOpenChallenge?: (challenge: ChallengeItem, index: number, total: number) => void;
  onInteractionPromptUpdate?: (data: {
    visible: boolean;
    x: number;
    y: number;
    challengeIndex: number;
  } | null) => void;
  onResolvedNpcBadgesUpdate?: (badges: Array<{
    index: number;
    x: number;
    y: number;
    visible: boolean;
  }>) => void;
  onFloatingNotificationUpdate?: (data: {
    visible: boolean;
    text: string;
    type: "checkpoint" | "memory";
    x: number;
    y: number;
    opacity: number;
  } | null) => void;
  onFloatingNotification?: (data: {
    text: string;
    type: "checkpoint" | "memory";
  }) => void;
  onComboUpdate?: (data: { combo: number; timeLeft: number; maxTime: number }) => void;
  onMemoryToast?: (text: string) => void;
  isCutsceneActive?: boolean;
  onPartnerReunion?: () => void;
  onBossHpUpdate?: (hp: number, maxHp: number, visible: boolean, isEnraged: boolean) => void;
  onBossTitleCard?: (visible: boolean) => void;
  onDuoPromptUpdate?: (visible: boolean) => void;
  onDuoCutIn?: (visible: boolean, onFinished?: () => void) => void;
  onSwingPromptUpdate?: (data: { visible: boolean; x: number; y: number } | null) => void;
  onSwingStateChange?: (sitting: boolean) => void;
  onAdventureSnapshot?: (dataUrl: string) => void;
  onWin: () => void;
}

interface VisualGameObj {
  pos: { x: number; y: number };
  opacity: number;
  text?: string;
  destroy: () => void;
  use: (component: unknown) => void;
}

interface MemoryGameObj extends VisualGameObj {
  exists: () => boolean;
  onCollide: (tag: string, action: () => void) => void;
}

// Segmen lantai utama (untuk deteksi jurang & batas patroli slime)
export interface GroundSegment {
  x: number;
  width: number;
  y?: number;
}

export const FLOOR_Y = 224;
export const PEAK_FLOOR_Y = 188;

/**
 * Mengembalikan ketinggian lantai solid aktual berdasarkan posisi horizontal x.
 * Babak 1 (0–1050): 224
 * Undakan Tangga Naik (1050–1100): 206
 * Dataran Tinggi Puncak & Arena Boss (1100–1920): 188
 */
export function getFloorYAt(x: number): number {
  if (x < 1050) return FLOOR_Y; // 224
  if (x < 1100) return 206;      // Undakan tangga naik
  return PEAK_FLOOR_Y;           // 188
}

export const GROUND_SEGMENTS: GroundSegment[] = [
  { x: 0, width: 385, y: 224 },
  { x: 420, width: 190, y: 224 },
  { x: 645, width: 405, y: 224 },   // Menutup Babak 1 di x = 1050
  { x: 1050, width: 50, y: 206 },   // Undakan tangga naik (menanjak nyaman dari y = 224 -> 206)
  { x: 1100, width: 820, y: 188 },  // Dataran Tinggi Puncak (x: 1100 – 1920), jurang 1540-1580 ditutup rata di y = 188
];

// ======================= GAME =======================

export async function createGame({
  canvas,
  receiverName,
  avatar = "male",
  challenges = [],
  isTouch: _isTouch = false,
  isMuted: initialMuted = false,
  memories,
  debug = false,
  onLoadProgress,
  onHudUpdate,
  onOpenChallenge,
  onInteractionPromptUpdate,
  onResolvedNpcBadgesUpdate,
  onFloatingNotificationUpdate,
  onFloatingNotification,
  onComboUpdate,
  onMemoryToast,
  isCutsceneActive = false,
  onPartnerReunion,
  onBossHpUpdate,
  onBossTitleCard,
  onDuoPromptUpdate,
  onDuoCutIn,
  onSwingPromptUpdate,
  onSwingStateChange,
  onAdventureSnapshot,
  onWin,
}: CreateGameOptions): Promise<GameController> {
  let isPaused = false;
  let isQuizPaused = false;
  let hasWon = false;
  let isCelebrating = false;
  let hearts = V3_CONFIG.MAX_HP;
  let lastPromptWasVisible = false;
  let lastHadResolvedBadges = false;
  let lastToastWasVisible = false;

  // State Kamera & Audio Dataran Tinggi Puncak
  let currentCamY = 135;
  let peakChimePlayed = false;

  // ===== STATE BOSS FIGHT (FASE S-3) =====
  const BOSS_MAX_HP = 8;
  let bossHp = BOSS_MAX_HP;
  let bossFightTriggered = false;
  let bossFightActive = false;
  let bossDefeated = false;
  let bossStunned = false;
  let isEnraged = false;
  let bossIntroTimer = 0;
  let bossAttackTimer = 0;
  let bossState: "intro" | "idle" | "telegraph_breath" | "breath_shooting" | "telegraph_tail" | "tail_swiping" | "stunned" | "defeated" = "intro";
  let bossTelegraphTimer = 0;
  let bossActionTimer = 0;
  let bossTitleCardTimer = 0;
  let bossHitFlashTimer = 0;
  let crossSlashTimer = 0;
  let isCrossSlashing = false;
  let celebrationEmoteTimer = 0;
  let partnerRescueCount = 0; // max 2x per pertarungan
  let partnerAttackTimer = 0; // serang tiap 3.0s
  let duoAttackActive = false;
  let celebrationSakuraRainActive = false;
  let currentBossSpriteKey: "boss_dragon_idle" | "boss_dragon_breath" | "boss_dragon_tail" = "boss_dragon_idle";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bossObj: any = null;
  let partnerCelebrationJumpTimer = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let arenaGateCollider: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let arenaGateVisual: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let giftSealDome: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let giftSealRing: any = null;

  // State Combat Juice (Hitstop & Combo Counter)
  let hitstopTimer = 0; // mikro freeze-frame (0.04s)
  let comboCount = 0;
  let comboTimer = 0;
  const COMBO_WINDOW = 3.0; // jendela kombo 3.0s

  interface PendingMonsterDeath {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    timer: number;
  }
  const pendingMonsterDeaths: PendingMonsterDeath[] = [];

  // State World Toast Melayang di Atas Objek (Bintang & Checkpoint)
  let activeToast: {
    text: string;
    type: "checkpoint" | "memory";
    worldX: number;
    worldY: number;
    timer: number;
    maxDuration: number;
  } | null = null;

  // State Buff
  let hasShield = false;
  let speedBuffTimer = 0; // dalam detik
  let starBuffTimer = 0; // dalam detik

  setMuted(initialMuted);

  // State input
  const virtualInput = { left: false, right: false, jump: false, attack: false, interact: false };
  const edgeInput = { jump: false, attack: false, interact: false };

  // Bersihkan partikel VFX aktif
  activeVfxParticles.length = 0;

  // Bersihkan instance KAPLAY sebelumnya
  if (activeQuit) {
    try { activeQuit(); } catch { /* ok */ }
    activeQuit = null;
  }

  const k = kaplay({
    canvas,
    width: 480,
    height: 270,
    letterbox: true,
    crisp: true,
    background: [26, 28, 44],
    pixelDensity: 1,
    global: false,
  });

  activeQuit = () => {
    try { k.quit(); } catch { /* ok */ }
  };

  k.setGravity(800);

  const LEVEL_WIDTH = 1900;
  const ACT1_WIDTH = 1050;
  const START_POS = k.vec2(30, FLOOR_Y - 4);
  const BASE_SPEED = 100;
  const BASE_JUMP_FORCE = 300;

  // Muat seluruh sprite PNG / Fallback prosedural
  await registerSprites(k, avatar, onLoadProgress);

  // Batalkan pembuatan game jika canvas sudah dilepas dari DOM saat menunggu asset
  if (!canvas.isConnected) {
    if (activeQuit) {
      try { activeQuit(); } catch { /* ok */ }
      activeQuit = null;
    }
    throw new Error("createGame dibatalkan");
  }

  // ===== TAHAP 1: PARALLAX BACKGROUND (KOTA SENJA 16-BIT) =====
  const PARALLAX_FACTOR = 0.25;
  const BG_TILE_WIDTH = 480;

  // Layer 0: Langit Senja Synth City (Fixed)
  k.add([
    k.sprite("bg_sky"),
    k.scale(1.5),
    k.pos(0, 0),
    k.fixed(),
    k.z(-100),
  ]);

  // Layer 1: Siluet Kota Senja 16-Bit (3 tile fixed agar tidak pernah ada celah)
  const cityTiles = [
    k.add([
      k.sprite("bg_city_mid"),
      k.scale(1.5),
      k.pos(-BG_TILE_WIDTH, 0),
      k.fixed(),
      k.opacity(0.95),
      k.z(-90),
    ]),
    k.add([
      k.sprite("bg_city_mid"),
      k.scale(1.5),
      k.pos(0, 0),
      k.fixed(),
      k.opacity(0.95),
      k.z(-90),
    ]),
    k.add([
      k.sprite("bg_city_mid"),
      k.scale(1.5),
      k.pos(BG_TILE_WIDTH, 0),
      k.fixed(),
      k.opacity(0.95),
      k.z(-90),
    ]),
  ];

  // ===== TRANSISI LANGIT DINAMIS & PETIR HALUS (FASE P-2) =====
  // Layer 0.5: Tint Langit Dinamis (z: -98, di atas bg_sky z(-100), di bawah bintang z(-97) & kota z(-90))
  const skyOverlay = k.add([
    k.rect(480, 270),
    k.pos(0, 0),
    k.color(255, 140, 60),
    k.opacity(0),
    k.fixed(),
    k.z(-98),
  ]);

  // Kilatan petir super halus sesekali di langit Babak 3
  const skyLightning = k.add([
    k.rect(480, 270),
    k.pos(0, 0),
    k.color(210, 185, 255),
    k.opacity(0),
    k.fixed(),
    k.z(-96),
  ]);

  let currentSkyR = 255;
  let currentSkyG = 140;
  let currentSkyB = 60;
  let currentSkyA = 0;
  let lightningTimer = 0;
  let shootingStarTimer = 0;

  // Jendela Gedung Menyala-Mati (Kota yang "Bernapas")
  interface CityWindowDot {
    obj: VisualGameObj;
    freq: number;
    phase: number;
    baseOpacity: number;
  }
  const cityWindows: CityWindowDot[] = [];
  const windowDotConfigs = [
    { x: 35, y: 172, w: 2, h: 3, freq: 1.8, phase: 0.2 },
    { x: 75, y: 158, w: 3, h: 2, freq: 2.3, phase: 1.4 },
    { x: 125, y: 184, w: 2, h: 2, freq: 1.5, phase: 2.8 },
    { x: 175, y: 162, w: 3, h: 3, freq: 2.7, phase: 0.9 },
    { x: 220, y: 178, w: 2, h: 2, freq: 1.9, phase: 3.5 },
    { x: 265, y: 152, w: 3, h: 2, freq: 2.2, phase: 1.1 },
    { x: 315, y: 182, w: 2, h: 3, freq: 1.6, phase: 4.2 },
    { x: 365, y: 166, w: 3, h: 2, freq: 2.5, phase: 2.0 },
    { x: 415, y: 156, w: 2, h: 2, freq: 1.7, phase: 5.1 },
    { x: 455, y: 172, w: 3, h: 2, freq: 2.1, phase: 0.6 },
  ];

  for (const tile of cityTiles) {
    for (const wdc of windowDotConfigs) {
      const winObj = tile.add([
        k.rect(wdc.w, wdc.h),
        k.pos(wdc.x, wdc.y),
        k.color(255, 230, 130),
        k.opacity(0.45),
        k.z(-89),
      ]) as unknown as VisualGameObj;
      cityWindows.push({
        obj: winObj,
        freq: wdc.freq,
        phase: wdc.phase,
        baseOpacity: 0.45,
      });
    }
  }

  // ===== FOREGROUND PARALLAX (LAPISAN DEPAN KAMERA, KEDALAMAN 2.5D) =====
  // Render pada k.z(55) (di atas pemain & boss, di bawah HTML overlay), faktor 1.25x
  const FG_WIDTH = 560;
  interface FgElement {
    obj: VisualGameObj;
    baseX: number;
    kind: "leaf" | "sakura";
  }
  const fgElements: FgElement[] = [];

  const leafConfigs = [
    { x: 20, y: 2, w: 24, h: 10 },
    { x: 120, y: 0, w: 32, h: 12 },
    { x: 240, y: 3, w: 28, h: 9 },
    { x: 380, y: 1, w: 36, h: 14 },
    { x: 490, y: 0, w: 26, h: 11 },
    { x: 70, y: 264, w: 30, h: 8 },
    { x: 280, y: 265, w: 24, h: 7 },
    { x: 450, y: 263, w: 32, h: 8 },
  ];

  for (const lc of leafConfigs) {
    const leaf = k.add([
      k.rect(lc.w, lc.h),
      k.pos(lc.x, lc.y),
      k.color(28, 20, 36),
      k.opacity(0.24),
      k.fixed(),
      k.z(55),
    ]) as unknown as VisualGameObj;
    fgElements.push({ obj: leaf, baseX: lc.x, kind: "leaf" });
  }

  const sakuraFgConfigs = [
    { x: 40, y: 8, s: 6, rot: 15 },
    { x: 160, y: 14, s: 8, rot: 40 },
    { x: 270, y: 6, s: 7, rot: -20 },
    { x: 390, y: 18, s: 9, rot: 25 },
    { x: 500, y: 10, s: 7, rot: -35 },
    { x: 110, y: 258, s: 7, rot: 30 },
    { x: 330, y: 259, s: 8, rot: -15 },
  ];

  for (const sc of sakuraFgConfigs) {
    const sak = k.add([
      k.rect(sc.s, sc.s),
      k.pos(sc.x, sc.y),
      k.rotate(sc.rot),
      k.color(255, 175, 195),
      k.opacity(0),
      k.fixed(),
      k.z(55),
    ]) as unknown as VisualGameObj;
    fgElements.push({ obj: sak, baseX: sc.x, kind: "sakura" });
  }

  // ===== GHOST TRAILS (AFTERIMAGE) SYSTEM =====
  interface PendingGhostTrail {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any;
    delay: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    color: any;
    opacity: number;
  }
  const pendingGhostTrails: PendingGhostTrail[] = [];

  function spawnGhostTrail(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetObj: any,
    tintColor = k.rgb(255, 215, 0),
    opacity = 0.45
  ) {
    if (!targetObj || !targetObj.exists || !targetObj.exists()) return;
    try {
      const curAnim = targetObj.curAnim ? targetObj.curAnim() : undefined;
      const ghost = k.add([
        k.sprite(targetObj.is("partner_npc") ? "partner" : "player", {
          anim: curAnim,
        }),
        k.pos(targetObj.pos.x, targetObj.pos.y),
        k.anchor("bot"),
        k.scale(targetObj.scale ? k.vec2(Math.abs(targetObj.scale.x), targetObj.scale.y) : k.vec2(1, 1)),
        k.color(tintColor),
        k.opacity(opacity),
        k.lifespan(0.18, { fade: 0.18 }),
        k.z(48),
      ]);
      ghost.flipX = targetObj.flipX;
      trackVfxParticle(ghost);
    } catch {
      // Abaikan jika sprite belum siap
    }
  }

  // Bintang-bintang berkelip di langit senja 480×270
  const starPositions = [
    { x: 25, y: 14, s: 2, c: [255, 255, 220] },
    { x: 65, y: 28, s: 1, c: [255, 230, 200] },
    { x: 110, y: 16, s: 2, c: [255, 255, 240] },
    { x: 155, y: 36, s: 1, c: [255, 215, 180] },
    { x: 195, y: 20, s: 2, c: [255, 255, 220] },
    { x: 245, y: 42, s: 1, c: [255, 240, 210] },
    { x: 290, y: 18, s: 2, c: [255, 255, 250] },
    { x: 335, y: 32, s: 1, c: [255, 220, 190] },
    { x: 380, y: 15, s: 2, c: [255, 255, 230] },
    { x: 425, y: 40, s: 1, c: [255, 230, 200] },
    { x: 460, y: 22, s: 2, c: [255, 255, 250] },
    { x: 40, y: 55, s: 1, c: [255, 240, 220] },
    { x: 130, y: 65, s: 2, c: [255, 220, 180] },
    { x: 215, y: 58, s: 1, c: [255, 255, 230] },
    { x: 310, y: 62, s: 2, c: [255, 230, 190] },
    { x: 405, y: 56, s: 1, c: [255, 255, 220] },
    { x: 80, y: 80, s: 1, c: [255, 240, 210] },
    { x: 270, y: 85, s: 1, c: [255, 230, 200] },
    { x: 360, y: 78, s: 1, c: [255, 255, 230] },
  ];
  const stars: VisualGameObj[] = [];
  for (const sp of starPositions) {
    const star = k.add([
      k.rect(sp.s, sp.s),
      k.pos(sp.x, sp.y),
      k.color(sp.c[0], sp.c[1], sp.c[2]),
      k.opacity(0.65),
      k.fixed(),
      k.z(-97),
    ]);
    stars.push(star as unknown as VisualGameObj);
  }

  // ===== TAHAP FISIKA LOMPAT & GROUND COLLIDERS (L6, L7) =====
  const maxJumpHeight = (BASE_JUMP_FORCE * BASE_JUMP_FORCE) / (2 * 800);
  if (debug) {
    console.log(
      `[JumpPhysics] maxJumpHeight: ${maxJumpHeight.toFixed(1)}px, platform delta: ${FLOOR_Y - 182}px, margin: ${(maxJumpHeight - (FLOOR_Y - 182)).toFixed(1)}px`
    );
  }

  // ===== GROUND SEGMENTS (GENTENG ATAP & DINDING GEDUNG 16-BIT) =====
  for (const seg of GROUND_SEGMENTS) {
    const segY = seg.y ?? FLOOR_Y;
    const segHeight = 270 - segY + 32;
    // 1 collider statis per segmen lantai (L7)
    k.add([
      k.pos(seg.x, segY),
      k.area({ shape: new k.Rect(k.vec2(0, 0), seg.width, segHeight) }),
      k.body({ isStatic: true }),
      k.z(10),
      "ground",
    ]);

    const tileCount = Math.ceil(seg.width / 16);
    for (let i = 0; i < tileCount; i++) {
      // Lapisan atas: Genteng atap (visual)
      k.add([
        k.sprite("ground"),
        k.pos(seg.x + i * 16, segY),
        k.z(10),
      ]);
      // Lapisan bawah: Dinding gedung batu hangat di bawah genteng menutup penuh hingga dasar layar (y = 270)
      for (let wallY = segY + 16; wallY < 270 + 16; wallY += 16) {
        k.add([
          k.sprite("building_wall"),
          k.pos(seg.x + i * 16, wallY),
          k.z(9),
        ]);
      }
    }
  }

  // Platform jembatan antar-atap gedung di Babak 1 (margin lompat >= 12 px) (L6, L7)
  const platforms = [
    { x: 380, y: 182, w: 64 }, // Sebelum checkpoint 1 (lantern di 500 bebas hambatan, delta 42px)
    { x: 750, y: 182, w: 64 }, // Platform atas sebelum transisi (delta 42px)
  ];
  for (const plat of platforms) {
    // 1 collider statis per platform (L7)
    k.add([
      k.pos(plat.x, plat.y),
      k.area({ shape: new k.Rect(k.vec2(0, 0), plat.w, 8) }),
      k.body({ isStatic: true }),
      k.z(10),
      "ground",
    ]);

    const tc = Math.ceil(plat.w / 16);
    for (let i = 0; i < tc; i++) {
      k.add([
        k.sprite("platform"),
        k.pos(plat.x + i * 16, plat.y),
        k.z(10),
      ]);
    }
  }

  // Lampu jalan retro 16-bit dengan sprite & pendar cahaya hangat berlapis (Ambient Bloom)
  const lampPositions = [180, 560, 850];
  for (let i = 0; i < lampPositions.length; i++) {
    const lampX = lampPositions[i];
    // Halo luar lembut
    const haloOuter = k.add([
      k.circle(36),
      k.pos(lampX, FLOOR_Y - 32),
      k.color(255, 180, 80),
      k.opacity(0.08),
      k.anchor("center"),
      k.z(2),
    ]);
    // Pendar hangat inti
    const haloInner = k.add([
      k.circle(18),
      k.pos(lampX, FLOOR_Y - 32),
      k.color(255, 235, 150),
      k.opacity(0.18),
      k.anchor("center"),
      k.z(3),
    ]);
    haloOuter.onUpdate(() => {
      haloOuter.opacity = 0.06 + Math.sin(k.time() * 2.2 + i * 1.5) * 0.03;
    });
    haloInner.onUpdate(() => {
      haloInner.opacity = 0.14 + Math.sin(k.time() * 2.8 + i * 1.5) * 0.04;
    });
    k.add([
      k.sprite("decor_lamp"),
      k.pos(lampX, FLOOR_Y),
      k.anchor("bot"),
      k.z(5),
    ]);
  }

  // Kalkulasi awal posisi NPC kuis agar monster & dekorasi pohon bisa menghindarinya (L3)
  const nChallenges = challenges.length;
  const plannedNpcXes: number[] = [];
  for (let i = 0; i < nChallenges; i++) {
    let calcX = Math.round(160 + ((i + 1) * (ACT1_WIDTH - 360)) / (nChallenges + 1));
    while (
      (isInForbiddenZone(calcX) ||
        plannedNpcXes.some((px) => Math.abs(calcX - px) < 60) ||
        !GROUND_SEGMENTS.some(
          (seg) => calcX >= seg.x + 40 && calcX <= seg.x + seg.width - 40
        )) &&
      calcX < ACT1_WIDTH - 100
    ) {
      calcX += 8;
    }
    plannedNpcXes.push(calcX);
  }

  // ===== PEMAIN (SPRITE) =====
  // anchor('bot') dengan area shape (0, 0, 12, 22) otomatis di-offset KAPLAY ke (-6, -22, 12, 22)
  // Menjejak tepat di atas permukaan tanah (FLOOR_Y) tanpa tenggelam/melayang
  const player = k.add([
    k.sprite("player", { anim: "idle" }),
    k.pos(START_POS),
    k.scale(1),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 12, 22) }),
    k.body(),
    k.anchor("bot"),
    k.opacity(1),
    k.z(40),
    "player",
  ]);

  // ===== COMPANION PET (CUTE FANTASY) =====
  const pet = k.add([
    k.sprite("pet", { anim: "idle" }),
    k.pos(Math.max(8, player.pos.x - 20), player.pos.y),
    k.anchor("bot"),
    k.opacity(1),
    k.scale(0.85),
    k.z(35),
    "pet",
  ]);

  let facingRight = true;
  let respawnPos = k.vec2(START_POS.x, START_POS.y);

  // Aura perisai di sekitar pemain (Fase D)
  const shieldAura = k.add([
    k.circle(12),
    k.pos(player.pos.x, player.pos.y - 8),
    k.color(52, 152, 219),
    k.opacity(0),
    k.anchor("center"),
    k.z(41),
  ]);

  // State Combat & Timers Pemain
  let attackCooldown = 0;
  let attackAnimTimer = 0;
  let invulnTimer = 0.5; // Masa kebal 500ms saat spawn awal agar fisika stabil tanpa tabrakan palsu
  let knockbackTimer = 0;
  let knockbackDir = 0; // -1: kiri, 1: kanan

  // State Game Feel (Coyote Time, Jump Buffering & Partikel Debu — Pola JSLegendDev)
  let coyoteTimer = 0;
  let jumpBufferTimer = 0;
  let wasGrounded = true;
  let stepDustTimer = 0;

  // State Easter Egg Ayunan & Mode Damai (Fase P-3)
  let isSittingOnSwing = false;
  let isPeacefulMode = false;
  let lastNearSwing = false;

  // ===== BINTANG KENANGAN =====
  const defaultMemoryMessages = [
    "Makasih udah selalu ada",
    "Senyum terus ya!",
    "Kamu keren banget",
    "Dikit lagi sampai!",
  ];
  const memoryMessages = defaultMemoryMessages.map((def, idx) => {
    const custom = memories?.[idx];
    return custom && custom.trim() ? custom.trim() : def;
  });
  const memoryLocations = [
    { x: 220, y: 196, baseY: 196 },
    { x: 490, y: 176, baseY: 176 },
    { x: 780, y: 174, baseY: 174 }, // Bintang kenangan ketiga di atas platform jembatan (y: 182) (L6)
    { x: 930, y: 196, baseY: 196 },
  ];
  let memoryCount = 0;
  let nearbyChallengeId: string | null = null;
  let challengesDoneCount = 0;
  let lastHudKey = "";

  function emitHud(extra?: Partial<HudState>) {
    const speedLeft = Math.ceil(speedBuffTimer);
    const starLeft = Math.ceil(starBuffTimer);
    const progressPercent = Math.min(player.pos.x / (LEVEL_WIDTH - 50), 1) * 100;

    const currentKey = `${hearts},${hasShield},${speedLeft},${starLeft},${nearbyChallengeId || ""},${challengesDoneCount},${memoryCount},${Math.round(progressPercent)}`;
    if (!extra && currentKey === lastHudKey) return;
    lastHudKey = currentKey;

    onHudUpdate?.({
      hp: hearts,
      maxHp: V3_CONFIG.MAX_HP,
      hasShield,
      speedLeft,
      starLeft,
      nearbyChallengeId,
      challengesDone: challengesDoneCount,
      challengesTotal: challenges.length,
      memoriesCollected: memoryCount,
      totalMemories: memoryLocations.length,
      progressPercent,
      ...extra,
    });
  }

  emitHud();
  const memoryItems: Array<{ obj: MemoryGameObj; baseY: number }> = [];

  for (const location of memoryLocations) {
    const memory = k.add([
      k.sprite("memory_star"),
      k.pos(location.x, location.baseY),
      k.scale(1),
      k.area({ shape: new k.Rect(k.vec2(1, 1), 10, 10) }),
      k.anchor("center"),
      k.z(8),
      "memory",
    ]) as unknown as MemoryGameObj;
    memoryItems.push({ obj: memory, baseY: location.baseY });
  }

  for (const memory of memoryItems) {
    memory.obj.onCollide("player", () => {
      if (memory.obj.exists()) {
        const collectedPos = k.vec2(memory.obj.pos.x, memory.obj.pos.y);
        memory.obj.destroy();
        memoryCount++;
        emitHud({ memoriesCollected: memoryCount });
        playCollect();
        for (let i = 0; i < 8; i++) {
          k.add([
            k.rect(i % 2 === 0 ? 2 : 1, i % 2 === 0 ? 2 : 1),
            k.pos(collectedPos.x + (Math.random() - 0.5) * 10,
              collectedPos.y + (Math.random() - 0.5) * 10),
            k.color(255, 215, 0),
            k.opacity(1),
            k.lifespan(0.7, { fade: 0.5 }),
            k.move(k.Vec2.fromAngle(Math.random() * 360), 25 + Math.random() * 25),
            k.z(12),
          ]);
        }
        const msg = memoryMessages[Math.min(memoryCount - 1, memoryMessages.length - 1)];
        activeToast = {
          text: msg,
          type: "memory",
          worldX: collectedPos.x,
          worldY: collectedPos.y - 12,
          timer: 2.8,
          maxDuration: 2.8,
        };
        if (onFloatingNotification) {
          onFloatingNotification({ text: msg, type: "memory" });
        } else if (onMemoryToast) {
          onMemoryToast(msg);
        }
      }
    });
  }

  // ===== KOTAK KADO 16-BIT CHEST (SPRITE) =====
  const giftBasePos = k.vec2(1850, PEAK_FLOOR_Y);
  const gift = k.add([
    k.sprite("gift_chest", { anim: "sparkle" }),
    k.pos(giftBasePos),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 16, 16) }),
    k.anchor("bot"),
    k.z(10),
    "gift",
  ]);

  // Kubah Segel Ungu Berdenyut Menyelubungi Kotak Kado (Fase S-3)
  giftSealDome = k.add([
    k.circle(28),
    k.pos(giftBasePos.x, giftBasePos.y - 12),
    k.color(168, 85, 247), // #a855f7
    k.opacity(0.35),
    k.anchor("center"),
    k.z(11),
    "gift_seal_dome",
  ]);
  giftSealRing = k.add([
    k.circle(32),
    k.pos(giftBasePos.x, giftBasePos.y - 12),
    k.color(216, 180, 254), // #d8b4fe
    k.opacity(0.2),
    k.anchor("center"),
    k.z(11),
    "gift_seal_ring",
  ]);

  // ===== LENTERA CHECKPOINT (BABAK 1 di x=500 & BABAK 2 di x=1190) =====
  interface LanternCheckpoint {
    obj: VisualGameObj;
    aura: VisualGameObj;
    auraOuter: VisualGameObj;
    lit: boolean;
    x: number;
    floorY: number;
  }
  const checkpoints: LanternCheckpoint[] = [];
  const checkpointPositions = [500, 1190];
  for (const cpX of checkpointPositions) {
    const cpFloorY = getFloorYAt(cpX);
    const auraOuter = k.add([
      k.circle(38),
      k.pos(cpX, cpFloorY - 12),
      k.color(255, 170, 70),
      k.opacity(0),
      k.anchor("center"),
      k.z(2),
    ]) as unknown as VisualGameObj;
    const aura = k.add([
      k.circle(18),
      k.pos(cpX, cpFloorY - 12),
      k.color(255, 225, 120),
      k.opacity(0),
      k.anchor("center"),
      k.z(3),
    ]) as unknown as VisualGameObj;
    const obj = k.add([
      k.sprite("lantern_unlit"),
      k.pos(cpX, cpFloorY),
      k.area({ shape: new k.Rect(k.vec2(3, 5), 10, 18) }),
      k.anchor("bot"),
      k.z(6),
      "lantern",
    ]) as unknown as VisualGameObj;
    checkpoints.push({ obj, aura, auraOuter, lit: false, x: cpX, floorY: cpFloorY });
  }

  // ===== TAMAN PUNCAK SAKURA BERTINGKAT (x = 1150 – 1420, PEAK_FLOOR_Y = 188) =====
  // 1. Pagar kayu pendek di tepi belakang taman
  for (let fx = 1155; fx <= 1405; fx += 14) {
    k.add([
      k.rect(2, 10),
      k.pos(fx, PEAK_FLOOR_Y - 10),
      k.color(139, 107, 80),
      k.z(4),
    ]);
  }
  k.add([
    k.rect(250, 2),
    k.pos(1155, PEAK_FLOOR_Y - 7),
    k.color(112, 88, 64),
    k.z(4),
  ]);

  // 2. Semak bunga pink kecil
  for (const bx of [1165, 1205, 1335, 1395]) {
    k.add([
      k.rect(10, 5),
      k.pos(bx, PEAK_FLOOR_Y - 5),
      k.color(61, 139, 61),
      k.z(6),
    ]);
    k.add([
      k.rect(2, 2),
      k.pos(bx + 2, PEAK_FLOOR_Y - 6),
      k.color(255, 133, 162),
      k.z(7),
    ]);
    k.add([
      k.rect(2, 2),
      k.pos(bx + 6, PEAK_FLOOR_Y - 7),
      k.color(255, 194, 209),
      k.z(7),
    ]);
  }

  // 3. Dua Pohon Sakura Kecil di Latar Belakang (Depth Layer)
  k.add([
    k.sprite("decor_big_tree"),
    k.pos(1175, PEAK_FLOOR_Y + 1),
    k.scale(0.55),
    k.color(215, 195, 220),
    k.opacity(0.82),
    k.anchor("bot"),
    k.z(5),
  ]);
  k.add([
    k.sprite("decor_big_tree"),
    k.pos(1365, PEAK_FLOOR_Y + 1),
    k.scale(0.55),
    k.color(215, 195, 220),
    k.opacity(0.82),
    k.anchor("bot"),
    k.z(5),
  ]);

  // 4. Lampu Taman Gantung (Fairy String Lights) melengkung halus menghubungkan pohon
  function addFairyString(x0: number, y0: number, x1: number, y1: number, sag: number) {
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const wx = (1 - t) * x0 + t * x1;
      const wy = (1 - t) * y0 + t * y1 + Math.sin(t * Math.PI) * sag;
      k.add([
        k.rect(1, 1),
        k.pos(wx, wy),
        k.color(58, 32, 48),
        k.z(6),
      ]);
      if (i > 0 && i < steps && i % 2 === 0) {
        k.add([
          k.circle(4),
          k.pos(wx, wy + 1),
          k.color(255, 215, 100),
          k.opacity(0.25),
          k.anchor("center"),
          k.z(6),
        ]);
        k.add([
          k.rect(2, 2),
          k.pos(wx, wy + 1),
          k.color(255, 245, 180),
          k.opacity(0.95),
          k.anchor("center"),
          k.z(7),
        ]);
      }
    }
  }
  addFairyString(1175, PEAK_FLOOR_Y - 55, 1238, PEAK_FLOOR_Y - 95, 12);
  addFairyString(1302, PEAK_FLOOR_Y - 95, 1365, PEAK_FLOOR_Y - 55, 12);

  // 5. Alas Gundukan Rumput & Taman Piksel di Bawah Pohon Utama (Anti-Ngambang)
  k.add([
    k.rect(140, 4),
    k.pos(1270 - 70, PEAK_FLOOR_Y - 2),
    k.color(90, 65, 30),
    k.z(7),
  ]);
  k.add([
    k.rect(134, 4),
    k.pos(1270 - 67, PEAK_FLOOR_Y - 4),
    k.color(76, 168, 76),
    k.z(7),
  ]);
  k.add([
    k.rect(122, 2),
    k.pos(1270 - 61, PEAK_FLOOR_Y - 5),
    k.color(93, 184, 93),
    k.z(7),
  ]);

  // 6. Pohon Sakura Utama Raksasa (x = 1270, tinggi ~193px, akar tertanam 3px di alas rumput)
  k.add([
    k.sprite("decor_big_tree"),
    k.pos(1270, PEAK_FLOOR_Y + 3),
    k.scale(1.28),
    k.anchor("bot"),
    k.z(8),
    "decor_tree",
  ]);

  // 7. Ayunan Berdua (Couple Swing) di bawah dahan kiri pohon sakura
  const swingPivot = k.add([
    k.pos(1228, PEAK_FLOOR_Y - 96),
    k.rotate(0),
    k.z(9),
  ]);
  swingPivot.add([
    k.rect(1, 68),
    k.pos(-8, 0),
    k.color(194, 160, 120),
  ]);
  swingPivot.add([
    k.rect(1, 68),
    k.pos(8, 0),
    k.color(194, 160, 120),
  ]);
  swingPivot.add([
    k.rect(22, 4),
    k.pos(-11, 68),
    k.color(139, 90, 43),
  ]);
  swingPivot.onUpdate(() => {
    swingPivot.angle = Math.sin(k.time() * 1.4) * 4.5;
  });

  // Ambient Bloom lembut di bawah kanopi Pohon Sakura & Ayunan (Fase P-2)
  const sakuraAmbientGlow = k.add([
    k.circle(44),
    k.pos(1228, PEAK_FLOOR_Y - 45),
    k.color(255, 195, 215),
    k.opacity(0.12),
    k.anchor("center"),
    k.z(6),
  ]);
  sakuraAmbientGlow.onUpdate(() => {
    sakuraAmbientGlow.opacity = 0.09 + Math.sin(k.time() * 2) * 0.04;
  });

  // 8. Kunang-Kunang Emas (Golden Fireflies) 8 titik melayang perlahan
  const fireflyBases = [
    { x: 1190, y: PEAK_FLOOR_Y - 35, phase: 0.0 },
    { x: 1215, y: PEAK_FLOOR_Y - 60, phase: 1.2 },
    { x: 1240, y: PEAK_FLOOR_Y - 25, phase: 2.5 },
    { x: 1265, y: PEAK_FLOOR_Y - 75, phase: 3.8 },
    { x: 1290, y: PEAK_FLOOR_Y - 45, phase: 0.9 },
    { x: 1315, y: PEAK_FLOOR_Y - 65, phase: 4.3 },
    { x: 1345, y: PEAK_FLOOR_Y - 30, phase: 2.1 },
    { x: 1375, y: PEAK_FLOOR_Y - 50, phase: 5.0 },
  ];
  for (const fb of fireflyBases) {
    const ff = k.add([
      k.rect(2, 2),
      k.pos(fb.x, fb.y),
      k.color(255, 224, 102),
      k.opacity(0.7),
      k.z(43),
    ]);
    ff.onUpdate(() => {
      const t = k.time();
      ff.pos.x = fb.x + Math.sin(t * 1.3 + fb.phase) * 10;
      ff.pos.y = fb.y + Math.cos(t * 1.6 + fb.phase) * 7;
      ff.opacity = 0.35 + 0.55 * Math.abs(Math.sin(t * 2.2 + fb.phase));
    });
  }

  // ===== PARTNER NPC MENUNGGU DI TAMAN PUNCAK SAKURA (x = 1295, y = PEAK_FLOOR_Y) =====
  let partnerReunionTriggered = false;
  let isPartnerReunionActive = false;
  let partnerJoined = false;
  let treeHealTriggered = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partnerObj: any = k.add([
    k.sprite("partner", { anim: "idle" }),
    k.pos(1295, PEAK_FLOOR_Y),
    k.anchor("bot"),
    k.opacity(1),
    k.z(38),
    "partner_npc",
  ]);
  partnerObj.flipX = true; // menghadap ke kiri menyambut kedatangan pemain

  // Emote ♥ Mini Melayang saat Reuni Selesai (100% Zero-Canvas-Text)
  function spawnReunionHeartEmote() {
    const heartX = (player.pos.x + partnerObj.pos.x) / 2;
    const startY = Math.min(player.pos.y, partnerObj.pos.y) - 28;
    try {
      const heart = trackVfxParticle(k.add([
        k.sprite("emote_heart"),
        k.pos(heartX, startY),
        k.anchor("center"),
        k.opacity(1),
        k.lifespan(2.4, { fade: 0.8 }),
        k.z(50),
      ]));
      heart.onUpdate(() => {
        heart.pos.y -= 14 * k.dt();
        heart.pos.x = heartX + Math.sin(k.time() * 6) * 2;
      });
    } catch {
      // Fallback partikel hati prosedural bila sprite belum siap
      const fallbackHeart = trackVfxParticle(k.add([
        k.rect(6, 6),
        k.pos(heartX, startY),
        k.color(255, 105, 180),
        k.anchor("center"),
        k.opacity(1),
        k.lifespan(2.4, { fade: 0.8 }),
        k.z(50),
      ]));
      fallbackHeart.onUpdate(() => {
        fallbackHeart.pos.y -= 14 * k.dt();
      });
    }

    for (let i = 0; i < 6; i++) {
      trackVfxParticle(k.add([
        k.rect(1.5, 1.5),
        k.pos(heartX + (Math.random() - 0.5) * 14, startY + (Math.random() - 0.5) * 10),
        k.color(255, 182, 193),
        k.opacity(0.9),
        k.lifespan(1.4, { fade: 0.6 }),
        k.move(k.Vec2.fromAngle(Math.random() * 360), 10 + Math.random() * 15),
        k.z(49),
      ]));
    }
  }

  // ===== PARTIKEL SPARKLE DI DEKAT KADO =====
  function spawnGiftSparkle() {
    if (hasWon) return;
    const p = trackVfxParticle(k.add([
      k.rect(2, 2),
      k.pos(
        gift.pos.x + (Math.random() - 0.5) * 30,
        gift.pos.y - 10 - Math.random() * 20
      ),
      k.color(255, 215, 0),
      k.opacity(1),
      k.lifespan(1.5, { fade: 0.5 }),
      k.z(9),
    ]));
    p.onUpdate(() => {
      p.pos.y -= 8 * k.dt();
      p.pos.x += Math.sin(k.time() * 5 + p.pos.y) * 0.3;
    });
  }

  // ======================= NPC TANTANGAN KUIS (FASE D) =======================
  interface QuizNpcItem {
    challenge: ChallengeItem;
    index: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    resolved: boolean;
  }

  const quizNpcs: QuizNpcItem[] = [];

  for (let i = 0; i < nChallenges; i++) {
    const ch = challenges[i];
    const calcX = plannedNpcXes[i];

    const npcObj = k.add([
      k.sprite("npc_guide", { anim: "idle" }),
      k.pos(calcX, FLOOR_Y),
      k.anchor("bot"),
      k.opacity(1),
      k.z(20),
      "npc_quiz",
    ]);

    quizNpcs.push({
      challenge: ch,
      index: i,
      obj: npcObj,
      resolved: false,
    });
  }

  // ======================= MONSTER SYSTEM =======================
  interface SlimeMonster {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    minX: number;
    maxX: number;
    dir: number; // 1: kanan, -1: kiri
    alive: boolean;
  }

  interface BatMonster {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    centerX: number;
    baseY: number;
    dir: number;
    timer: number;
    alive: boolean;
  }

  const slimes: SlimeMonster[] = [];
  const bats: BatMonster[] = [];

  // Helper untuk memastikan posisi berada aman di dalam segmen lantai (L3)
  function findGroundSegmentForX(x: number) {
    for (const seg of GROUND_SEGMENTS) {
      if (x >= seg.x && x <= seg.x + seg.width) {
        return seg;
      }
    }
    return null;
  }

  // Spawn 3 Slimes pada posisi deterministik: 0.28, 0.52, 0.74 * ACT1_WIDTH
  const slimeTargetXes = [
    Math.round(0.28 * ACT1_WIDTH),
    Math.round(0.52 * ACT1_WIDTH),
    Math.round(0.74 * ACT1_WIDTH),
  ];

  for (const rawX of slimeTargetXes) {
    let spawnX = rawX;

    // Geser ke kanan per 10 px sampai >= 60 px dari NPC (L3)
    while (quizNpcs.some((q) => Math.abs(spawnX - q.obj.pos.x) < 60)) {
      spawnX += 10;
    }

    // Paksa ke dalam satu segmen lantai; bila jatuh di jurang atau margin < 16 px, pindahkan ke segmen berikutnya
    let seg = findGroundSegmentForX(spawnX);
    if (!seg || spawnX < seg.x + 16 || spawnX > seg.x + seg.width - 16) {
      const nextSeg = GROUND_SEGMENTS.find((s) => s.x + s.width > spawnX);
      if (nextSeg) {
        spawnX = nextSeg.x + 20;
        seg = nextSeg;
        while (quizNpcs.some((q) => Math.abs(spawnX - q.obj.pos.x) < 60)) {
          spawnX += 10;
        }
      }
    }

    const finalSeg = seg || GROUND_SEGMENTS[0];
    const segMinX = finalSeg.x + 12;
    const segMaxX = finalSeg.x + finalSeg.width - 12;

    let patrolMinX = Math.max(segMinX, spawnX - 40);
    let patrolMaxX = Math.min(segMaxX, spawnX + 40);

    // Rentang patroli dipotong agar tidak mencakup x NPC +- 40 (L3)
    for (const q of quizNpcs) {
      const nx = q.obj.pos.x;
      if (nx > spawnX && nx - 40 < patrolMaxX) {
        patrolMaxX = Math.max(spawnX + 10, nx - 40);
      }
      if (nx < spawnX && nx + 40 > patrolMinX) {
        patrolMinX = Math.min(spawnX - 10, nx + 40);
      }
    }

    if (patrolMaxX - patrolMinX < 20) {
      if (spawnX + 20 <= segMaxX) patrolMaxX = spawnX + 20;
      else if (spawnX - 20 >= segMinX) patrolMinX = spawnX - 20;
    }

    const slimeObj = k.add([
      k.sprite("monster_slime", { anim: "walk" }),
      k.pos(spawnX, FLOOR_Y),
      k.area({ shape: new k.Rect(k.vec2(0, 0), 18, 16) }),
      k.anchor("bot"),
      k.opacity(1),
      k.z(30),
      "monster",
      "monster_slime",
    ]);

    slimes.push({
      obj: slimeObj,
      minX: patrolMinX,
      maxX: patrolMaxX,
      dir: 1,
      alive: true,
    });
  }

  // Spawn 2 Kelelawar pada posisi deterministik: 0.40 dan 0.64 * ACT1_WIDTH
  const batTargetXes = [
    Math.round(0.40 * ACT1_WIDTH),
    Math.round(0.64 * ACT1_WIDTH),
  ];

  for (const bX of batTargetXes) {
    let finalBx = bX;
    while (
      quizNpcs.some((q) => Math.abs(finalBx - q.obj.pos.x) < 60) ||
      isInForbiddenZone(finalBx, 10)
    ) {
      finalBx += 10;
    }
    const batObj = k.add([
      k.sprite("monster_bat", { anim: "fly" }),
      k.pos(finalBx, FLOOR_Y - 50),
      k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 20) }),
      k.anchor("center"),
      k.opacity(1),
      k.z(30),
      "monster",
      "monster_bat",
    ]);

    bats.push({
      obj: batObj,
      centerX: finalBx,
      baseY: FLOOR_Y - 50,
      dir: 1,
      timer: Math.random() * 2, // Desinkronisasi fase terbang
      alive: true,
    });
  }

  // ======================= MONSTER SKELETON (Cute_Fantasy_Free) =======================
  interface SkeletonMonster {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    minX: number;
    maxX: number;
    dir: number;
    alive: boolean;
  }
  const skeletons: SkeletonMonster[] = [];

  const skelSpawns = [
    { x: 770, y: 182, minX: 755, maxX: 805 }, // Platform jembatan atas (y: 182, delta 42px) (L6)
    { x: 860, y: FLOOR_Y, minX: 835, maxX: 885 }, // Genteng jalan sebelum kado
  ];

  for (const sp of skelSpawns) {
    const skelObj = k.add([
      k.sprite("monster_skeleton", { anim: "walk" }),
      k.pos(sp.x, sp.y),
      k.area({ shape: new k.Rect(k.vec2(0, 0), 16, 22) }),
      k.anchor("bot"),
      k.opacity(1),
      k.z(30),
      "monster",
      "monster_skeleton",
    ]);

    skeletons.push({
      obj: skelObj,
      minX: sp.minX,
      maxX: sp.maxX,
      dir: -1,
      alive: true,
    });
  }

  // Mode dev: assertion checks untuk memvalidasi posisi (L3)
  if (debug) {
    for (const q of quizNpcs) {
      console.assert(!isInForbiddenZone(q.obj.pos.x), `[DevAssert] NPC ${q.index} in forbidden zone at ${q.obj.pos.x}`);
      const inGround = GROUND_SEGMENTS.some(
        (seg) => q.obj.pos.x >= seg.x + 30 && q.obj.pos.x <= seg.x + seg.width - 30
      );
      console.assert(inGround, `[DevAssert] NPC ${q.index} at ${q.obj.pos.x} not in ground segment`);
    }
    for (let i = 0; i < slimes.length; i++) {
      const s = slimes[i];
      const inGround = GROUND_SEGMENTS.some(
        (seg) => s.obj.pos.x >= seg.x + 10 && s.obj.pos.x <= seg.x + seg.width - 10
      );
      console.assert(inGround, `[DevAssert] Slime ${i} at ${s.obj.pos.x} in pit/gap!`);
      for (const q of quizNpcs) {
        console.assert(
          s.minX > q.obj.pos.x + 35 || s.maxX < q.obj.pos.x - 35,
          `[DevAssert] Slime ${i} patrol [${s.minX}, ${s.maxX}] crosses NPC at ${q.obj.pos.x}`
        );
      }
    }
  }

  // Efek monster kalah: partikel + hit impact sfx + screen shake + 16-bit arcade explosion VFX (Pola JSLegendDev)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function defeatMonster(monsterObj: any) {
    playMonsterDefeat();
    const pos = monsterObj.pos;
    k.shake(1.5);

    // 16-Bit Arcade Smoke Puff & Explosion VFX (Legacy Collection)
    trackVfxParticle(k.add([
      k.sprite("vfx_explosion", { anim: "explode" }),
      k.pos(pos.x, pos.y - 12),
      k.anchor("center"),
      k.opacity(1),
      k.lifespan(0.4, { fade: 0.1 }),
      k.z(55),
    ]));

    for (let i = 0; i < 4; i++) {
      trackVfxParticle(k.add([
        k.rect(2, 2),
        k.pos(pos.x + (Math.random() - 0.5) * 6, pos.y - 6 + (Math.random() - 0.5) * 6),
        k.color(255, 235, 120),
        k.opacity(1),
        k.lifespan(0.18, { fade: 0.08 }),
        k.move(k.Vec2.fromAngle(Math.random() * 360), 50 + Math.random() * 40),
        k.z(52),
      ]));
    }
    for (let i = 0; i < V3_CONFIG.PARTICLES; i++) {
      trackVfxParticle(k.add([
        k.rect(2, 2),
        k.pos(pos.x + (Math.random() - 0.5) * 8, pos.y - 6 + (Math.random() - 0.5) * 8),
        k.color(160, 230, 100),
        k.opacity(1),
        k.lifespan(0.5, { fade: 0.3 }),
        k.move(k.Vec2.fromAngle(Math.random() * 360), 40 + Math.random() * 50),
        k.z(50),
      ]));
    }
    monsterObj.destroy();
  }

  // Combat Juice: Hitstop (0.04s), Hit-Flash putih terang & Knockback 18px (0.1s sebelum meledak)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onMonsterHit(monsterObj: any) {
    // Getar haptik responsif saat serangan pedang mengenai monster (15 ms)
    triggerHaptic(15);

    // 1. Freeze-frame mikro 0.04 detik
    hitstopTimer = 0.04;

    // 2. Combo Counter
    comboCount++;
    comboTimer = COMBO_WINDOW;
    onComboUpdate?.({
      combo: comboCount,
      timeLeft: comboTimer,
      maxTime: COMBO_WINDOW,
    });

    // 3. Hit-Flash & Knockback
    const knockDir = player.pos.x < monsterObj.pos.x ? 1 : -1;
    monsterObj.pos.x += knockDir * 18;
    monsterObj.color = k.rgb(255, 255, 255);
    // Nonaktifkan area/collider agar musuh tidak mencederai pemain selama hit-flash
    if (monsterObj.area) {
      monsterObj.area.scale = k.vec2(0, 0);
    }

    // 4. Daftarkan untuk meledak setelah 0.1 detik
    pendingMonsterDeaths.push({
      obj: monsterObj,
      timer: 0.1,
    });
  }

  // Flash merah saat kena damage
  function triggerHurtFlash() {
    k.shake(2);
    const flash = k.add([
      k.rect(480, 270),
      k.pos(0, 0),
      k.color(255, 60, 60),
      k.opacity(0.35),
      k.lifespan(0.12, { fade: 0.08 }),
      k.fixed(),
      k.z(150),
    ]);
    void flash;
  }

  // ======================= SISTEM RESPAWN & LOSE HEART (L4) =======================
  function respawnPlayer() {
    hearts = V3_CONFIG.MAX_HP;
    player.pos = k.vec2(respawnPos.x, respawnPos.y);
    player.vel = k.vec2(0, 0);
    knockbackTimer = 0;
    invulnTimer = 0.8;
    hasShield = false;
    speedBuffTimer = 0;
    starBuffTimer = 0;
    shieldAura.opacity = 0;
    pet.pos.x = Math.max(8, player.pos.x - (facingRight ? 20 : -20));
    pet.pos.y = player.pos.y;
    k.setCamPos(Math.round(k.clamp(player.pos.x, 240, LEVEL_WIDTH - 240)), 135);
    emitHud();
  }

  function loseHeart(knockbackFromX?: number) {
    if (invulnTimer > 0 || hasWon || isCelebrating) return;

    if (hasShield) {
      // Perisai menyerap tepat 1 serangan monster
      hasShield = false;
      shieldAura.opacity = 0;
      playHurt();
      triggerHurtFlash();
      invulnTimer = V3_CONFIG.INVULN_SEC;
      emitHud({ hasShield: false });
      return;
    }

    hearts -= 1;
    playHurt();
    triggerHurtFlash();
    invulnTimer = V3_CONFIG.INVULN_SEC;

    // Partikel debu/pecahan hati
    for (let i = 0; i < 5; i++) {
      k.add([
        k.rect(2, 2),
        k.pos(player.pos.x + (Math.random() - 0.5) * 10, player.pos.y - 8),
        k.color(220, 60, 60),
        k.opacity(1),
        k.lifespan(0.4, { fade: 0.2 }),
        k.move(k.Vec2.fromAngle(Math.random() * 360), 40 + Math.random() * 30),
        k.z(50),
      ]);
    }

    if (hearts <= 0) {
      // Mekanik Khusus Pertarungan Boss (Fase S-3)
      if (bossFightActive && !bossDefeated) {
        if (partnerRescueCount < 2) {
          // Kondisi A: Partner Rescue (Maksimal 2x per pertarungan Boss)
          partnerRescueCount++;
          hearts = 2;
          invulnTimer = 2.0;
          player.opacity = 1;
          partnerObj.opacity = 1;
          // Pastikan posisi pemain tetap berada di dalam arena (x >= 1450)
          player.pos.x = Math.max(1460, player.pos.x);
          player.pos.y = PEAK_FLOOR_Y;
          partnerObj.pos.x = player.pos.x - (facingRight ? 18 : -18);
          partnerObj.pos.y = PEAK_FLOOR_Y;
          playPartnerRescue();

          // Ledakan partikel emas dan pink kebangkitan
          for (let i = 0; i < 20; i++) {
            k.add([
              k.rect(i % 2 === 0 ? 3 : 2, i % 2 === 0 ? 3 : 2),
              k.pos(player.pos.x + (Math.random() - 0.5) * 16, player.pos.y - 10 + (Math.random() - 0.5) * 16),
              k.color(i % 2 === 0 ? k.rgb(255, 215, 0) : k.rgb(255, 133, 162)),
              k.opacity(1),
              k.lifespan(1.4, { fade: 0.6 }),
              k.move(k.Vec2.fromAngle(Math.random() * 360), 30 + Math.random() * 40),
              k.z(55),
            ]);
          }

          activeToast = {
            text: "Jangan menyerah, aku di sini! Bangkit lagi!",
            type: "checkpoint",
            worldX: player.pos.x,
            worldY: player.pos.y - 32,
            timer: 3.0,
            maxDuration: 3.0,
          };
          if (onFloatingNotification) {
            onFloatingNotification({ text: "Jangan menyerah, aku di sini! Bangkit lagi!", type: "checkpoint" });
          } else if (onMemoryToast) {
            onMemoryToast("Jangan menyerah, aku di sini! Bangkit lagi!");
          }
          emitHud();
          return;
        } else {
          // Kondisi B: Jatah rescue habis -> Reset Boss Fight Bersih di dalam Arena (Kamera tetap terkunci di 1660)
          player.pos = k.vec2(1465, PEAK_FLOOR_Y);
          partnerObj.pos = k.vec2(1445, PEAK_FLOOR_Y);
          player.vel = k.vec2(0, 0);
          hearts = V3_CONFIG.MAX_HP;
          invulnTimer = 1.0;
          player.opacity = 1;
          partnerObj.opacity = 1;
          bossHp = BOSS_MAX_HP;
          partnerRescueCount = 0;
          isEnraged = false;
          bossState = "idle";
          bossAttackTimer = 1.8;
          if (bossObj) {
            bossObj.pos = k.vec2(1760, PEAK_FLOOR_Y);
            bossObj.flipX = false;
            bossObj.color = k.rgb(255, 255, 255);
            try { bossObj.play("idle"); } catch { /* ok */ }
          }
          onBossHpUpdate?.(bossHp, BOSS_MAX_HP, true, false);

          activeToast = {
            text: "Pertarungan diulang! Kamu pasti bisa!",
            type: "checkpoint",
            worldX: 1660,
            worldY: PEAK_FLOOR_Y - 32,
            timer: 3.0,
            maxDuration: 3.0,
          };
          if (onFloatingNotification) {
            onFloatingNotification({ text: "Pertarungan diulang! Kamu pasti bisa!", type: "checkpoint" });
          } else if (onMemoryToast) {
            onMemoryToast("Pertarungan diulang! Kamu pasti bisa!");
          }
          emitHud();
          return;
        }
      }

      respawnPlayer();
    } else {
      if (knockbackFromX !== undefined) {
        knockbackDir = player.pos.x < knockbackFromX ? -1 : 1;
        knockbackTimer = V3_CONFIG.KNOCKBACK.duration;
        player.vel.y = V3_CONFIG.KNOCKBACK.vy;
      }
      emitHud();
    }
  }

  function hurtPlayer(knockbackFromX?: number) {
    loseHeart(knockbackFromX);
  }

  // Helper Ganti Aset Spritesheet Dragon Boss & Animasi Bersih
  function setBossAction(spriteKey: "boss_dragon_idle" | "boss_dragon_breath" | "boss_dragon_tail", animName: string) {
    if (!bossObj) return;
    const currentFlip = bossObj.flipX;
    if (currentBossSpriteKey !== spriteKey) {
      try {
        bossObj.use(k.sprite(spriteKey, { anim: animName }));
        currentBossSpriteKey = spriteKey;
      } catch {
        // fallback
      }
    } else {
      try {
        bossObj.play(animName);
      } catch {
        // fallback
      }
    }
    bossObj.flipX = currentFlip;
  }

  // ======================= MEKANIK BOSS PENJAGA KADO (FASE S-3) =======================
  function damageBoss(amount = 1) {
    if (!bossObj || bossDefeated || bossStunned || duoAttackActive) return;

    // Getar haptik responsif saat pedang mengenai Boss (15 ms)
    triggerHaptic(15);

    bossHp = Math.max(1, bossHp - amount);
    triggerBossHitFlash();

    // Combo Counter
    comboCount++;
    comboTimer = COMBO_WINDOW;
    onComboUpdate?.({
      combo: comboCount,
      timeLeft: comboTimer,
      maxTime: COMBO_WINDOW,
    });

    onBossHpUpdate?.(bossHp, BOSS_MAX_HP, true, isEnraged);

    if (bossHp <= 1) {
      enterBossStunned();
    }
  }

  function triggerBossHitFlash() {
    if (!bossObj) return;
    hitstopTimer = 0.04;
    bossHitFlashTimer = 0.1;
    bossObj.color = k.rgb(255, 255, 255);
    setBossAction("boss_dragon_idle", "hurt");

    // Partikel percikan bayangan ungu dan emas
    for (let i = 0; i < 8; i++) {
      trackVfxParticle(k.add([
        k.rect(2, 2),
        k.pos(bossObj.pos.x + (Math.random() - 0.5) * 20, bossObj.pos.y - 24 + (Math.random() - 0.5) * 16),
        k.color(i % 2 === 0 ? k.rgb(255, 215, 0) : k.rgb(249, 115, 22)),
        k.opacity(1),
        k.lifespan(0.4, { fade: 0.2 }),
        k.move(k.Vec2.fromAngle(Math.random() * 360), 30 + Math.random() * 30),
        k.z(50),
      ]));
    }
  }

  function enterBossStunned() {
    bossStunned = true;
    bossState = "stunned";
    bossAttackTimer = 999;
    setBossAction("boss_dragon_idle", "stunned");

    for (let i = 0; i < 3; i++) {
      trackVfxParticle(k.add([
        k.sprite("weapon_slash", { frame: 4 }),
        k.pos(bossObj.pos.x - 12 + i * 12, bossObj.pos.y - 52),
        k.anchor("center"),
        k.scale(0.8),
        k.opacity(1),
        k.lifespan(4.0, { fade: 1.0 }),
        k.z(50),
        "dizzy_star",
      ]));
    }
    onDuoPromptUpdate?.(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function deflectDarkOrb(orb: any) {
    if (!orb || !orb.exists()) return;
    // Getar haptik tajam saat berhasil menangkis/deflect bola bayangan (25 ms)
    triggerHaptic(25);
    playDeflect();
    for (let i = 0; i < 12; i++) {
      trackVfxParticle(k.add([
        k.rect(2, 2),
        k.pos(orb.pos.x + (Math.random() - 0.5) * 12, orb.pos.y + (Math.random() - 0.5) * 12),
        k.color(255, 215, 0),
        k.opacity(1),
        k.lifespan(0.5, { fade: 0.3 }),
        k.move(k.Vec2.fromAngle(Math.random() * 360), 40 + Math.random() * 40),
        k.z(52),
      ]));
    }
    orb.color = k.rgb(255, 215, 0);
    const targetDir = bossObj && bossObj.pos.x > orb.pos.x ? 1 : -1;
    orb.use(k.move(k.vec2(targetDir, 0), 180));
    orb.tag("deflected_orb");
    orb.untag("dark_orb");
    orb.untag("fire_orb");

    orb.onCollide("boss", () => {
      damageBoss(2); // Bonus 2 damage dari deflect sukses!
      hitstopTimer = 0.08;
      playDeflect();
      for (let i = 0; i < 14; i++) {
        trackVfxParticle(k.add([
          k.rect(3, 3),
          k.pos(orb.pos.x + (Math.random() - 0.5) * 16, orb.pos.y + (Math.random() - 0.5) * 16),
          k.color(k.rgb(255, 215, 0)),
          k.opacity(1),
          k.lifespan(0.4, { fade: 0.2 }),
          k.move(k.Vec2.fromAngle(Math.random() * 360), 50 + Math.random() * 40),
          k.z(55),
        ]));
      }
      orb.destroy();
    });
  }

  function spawnFireOrb(startX: number, startY: number, dir: number) {
    const orb = k.add([
      k.circle(9),
      k.pos(startX, startY),
      k.anchor("center"),
      k.color(249, 115, 22), // #f97316 oranye-merah menyala
      k.area({ shape: new k.Rect(k.vec2(-9, -9), 18, 18) }),
      k.opacity(1),
      k.lifespan(3.5, { fade: 0.3 }),
      k.move(k.vec2(dir, 0), 105), // Kecepatan santai 105 px/s ramah pemain
      k.z(37),
      "dark_orb",
      "fire_orb",
    ]);
    // Inti putih-kuning terang di dalam bola api
    orb.add([
      k.circle(5),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(254, 240, 138), // #fef08a
      k.opacity(1),
    ]);
    // Pendar ambient luar (Fake Bloom) bola api naga
    orb.add([
      k.circle(18),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(249, 115, 22),
      k.opacity(0.14),
    ]);
    orb.onCollide("player", () => {
      hurtPlayer(orb.pos.x);
      orb.destroy();
    });
  }

  function spawnTailSlash(centerX: number, dir: number) {
    const tailVfx = k.add([
      k.rect(65, 28),
      k.pos(centerX, PEAK_FLOOR_Y - 14),
      k.anchor("center"),
      k.color(255, 69, 0), // Busur tebasan api merah-oranye
      k.area({ shape: new k.Rect(k.vec2(-32, -14), 64, 28) }),
      k.opacity(0.85),
      k.lifespan(0.35, { fade: 0.1 }),
      k.z(40),
      "boss_tail_swipe",
    ]);
    // Inti api kuning menyala
    tailVfx.add([
      k.rect(52, 18),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(255, 215, 0),
      k.opacity(0.9),
    ]);

    // Percikan lidah api
    for (let i = 0; i < 8; i++) {
      trackVfxParticle(k.add([
        k.rect(2, 2),
        k.pos(centerX + (Math.random() - 0.5) * 50, PEAK_FLOOR_Y - 4 - Math.random() * 20),
        k.color(i % 2 === 0 ? k.rgb(255, 140, 0) : k.rgb(255, 69, 0)),
        k.opacity(1),
        k.lifespan(0.35, { fade: 0.1 }),
        k.move(k.vec2(dir * 20 + (Math.random() - 0.5) * 30, -40 - Math.random() * 30), 45),
        k.z(42),
      ]));
    }

    tailVfx.onCollide("player", () => {
      hurtPlayer(bossObj ? bossObj.pos.x : centerX);
    });
  }

  function executeDuoAttack() {
    if (!bossStunned || duoAttackActive || bossDefeated || !bossObj) return;
    duoAttackActive = true;
    onDuoPromptUpdate?.(false);
    playDuoCutIn();

    onDuoCutIn?.(true, () => {
      performCrossSlash();
    });
  }

  function performCrossSlash() {
    if (!bossObj) return;
    // Pola getaran bertingkat saat Special Duo Combo Finisher ([40, 30, 60] ms)
    triggerHaptic([40, 30, 60]);

    isCrossSlashing = true;
    crossSlashTimer = 0.5;

    // Reposisi Player dan Partner di kedua sisi Boss
    player.pos = k.vec2(bossObj.pos.x - 38, PEAK_FLOOR_Y);
    facingRight = true;
    player.flipX = false;
    try { player.play("attack"); } catch { /* ok */ }

    partnerObj.pos = k.vec2(bossObj.pos.x + 38, PEAK_FLOOR_Y);
    partnerObj.flipX = true;
    try { partnerObj.play("attack"); } catch { /* ok */ }

    // Dua garis tebasan raksasa menyilang di atas Boss
    trackVfxParticle(k.add([
      k.rect(55, 3),
      k.pos(bossObj.pos.x - 24, bossObj.pos.y - 24),
      k.rotate(35),
      k.color(255, 215, 0),
      k.opacity(1),
      k.lifespan(0.35, { fade: 0.15 }),
      k.z(60),
    ]));
    trackVfxParticle(k.add([
      k.rect(55, 3),
      k.pos(bossObj.pos.x + 24, bossObj.pos.y - 24),
      k.rotate(-35),
      k.color(255, 133, 162),
      k.opacity(1),
      k.lifespan(0.35, { fade: 0.15 }),
      k.z(60),
    ]));

    // Ghost Trail (*Afterimage*) ganda saat Duo Finisher melesat menyilang (Fase P-2)
    spawnGhostTrail(player, k.rgb(255, 215, 0), 0.55);
    spawnGhostTrail(partnerObj, k.rgb(255, 133, 162), 0.55);
    pendingGhostTrails.push(
      { target: player, delay: 0.05, color: k.rgb(255, 215, 0), opacity: 0.4 },
      { target: partnerObj, delay: 0.05, color: k.rgb(255, 133, 162), opacity: 0.4 },
      { target: player, delay: 0.1, color: k.rgb(255, 240, 150), opacity: 0.25 },
      { target: partnerObj, delay: 0.1, color: k.rgb(255, 182, 193), opacity: 0.25 }
    );

    playDuoSlash();
    k.shake(6);
    hitstopTimer = 0.15;
  }

  // ======================= SERANGAN PEMAIN (PEDANG / BINTANG SIHIR) =======================
  function performAttack() {
    if (isPaused || isQuizPaused || hasWon || isCelebrating) return;
    if (bossStunned && !duoAttackActive) {
      executeDuoAttack();
      return;
    }
    if (attackCooldown > 0 || knockbackTimer > 0) return;

    attackCooldown = V3_CONFIG.ATTACK_COOLDOWN;
    attackAnimTimer = V3_CONFIG.ATTACK_ANIM_SEC;

    try {
      player.play("attack");
    } catch {
      // Fallback jika anim belum siap
    }

    playAttack();

    // Ghost Trail (*Afterimage*) pada tebasan pedang (Fase P-2)
    spawnGhostTrail(player, k.rgb(255, 230, 150), 0.45);
    pendingGhostTrails.push(
      { target: player, delay: 0.04, color: k.rgb(255, 215, 0), opacity: 0.35 },
      { target: player, delay: 0.08, color: k.rgb(255, 180, 50), opacity: 0.25 }
    );

    const dir = facingRight ? 1 : -1;

    // Jika memiliki buff power_star: serangan diganti tembakan proyektil bintang
    if (starBuffTimer > 0) {
      const starProj = k.add([
        k.sprite("weapon_slash", { frame: 4 }), // frame 4 adalah bintang
        k.pos(player.pos.x + dir * 10, player.pos.y - 10),
        k.area({ shape: new k.Rect(k.vec2(0, 0), 8, 8) }), // Perbaikan area simetris anchor center (L11)
        k.anchor("center"),
        k.opacity(1),
        k.lifespan(V3_CONFIG.STAR.lifespan, { fade: 0.1 }),
        k.move(k.vec2(dir, 0), V3_CONFIG.STAR.speed),
        k.z(50),
        "player_star_bullet",
      ]);

      starProj.onCollide("boss", () => {
        damageBoss(1);
        starProj.destroy();
      });
      starProj.onCollide("dark_orb", (orb) => {
        deflectDarkOrb(orb);
        starProj.destroy();
      });
      starProj.onCollide("fire_orb", (orb) => {
        deflectDarkOrb(orb);
        starProj.destroy();
      });
      starProj.onCollide("monster", (target) => {
        for (const s of slimes) {
          if (s.alive && s.obj === target) {
            s.alive = false;
            onMonsterHit(s.obj);
            starProj.destroy();
            return;
          }
        }
        for (const b of bats) {
          if (b.alive && b.obj === target) {
            b.alive = false;
            onMonsterHit(b.obj);
            starProj.destroy();
            return;
          }
        }
        for (const sk of skeletons) {
          if (sk.alive && sk.obj === target) {
            sk.alive = false;
            onMonsterHit(sk.obj);
            starProj.destroy();
            return;
          }
        }
      });
      return;
    }

    // Serangan Normal (Tebasan Jarak Dekat)
    const hitboxX = player.pos.x + (dir === 1 ? 2 : -20);
    const hitboxY = player.pos.y - 14;

    const slash = k.add([
      k.sprite("weapon_slash", { anim: "slash" }),
      k.pos(hitboxX + (dir === 1 ? 0 : 16), hitboxY),
      k.opacity(1),
      k.lifespan(0.15, { fade: 0.05 }),
      k.anchor("center"),
      k.z(50),
    ]);
    if (dir === -1) {
      slash.flipX = true;
    }

    // Ambient Bloom lembut di sekitar tebasan pedang (Fase P-2)
    trackVfxParticle(k.add([
      k.circle(18),
      k.pos(hitboxX + (dir === 1 ? 0 : 16), hitboxY),
      k.color(255, 225, 130),
      k.opacity(0.14),
      k.lifespan(0.15, { fade: 0.05 }),
      k.anchor("center"),
      k.z(49),
    ]));

    const hitbox = k.add([
      k.rect(V3_CONFIG.HITBOX.w, V3_CONFIG.HITBOX.h),
      k.pos(hitboxX, hitboxY),
      k.area(),
      k.opacity(0),
      k.lifespan(V3_CONFIG.HITBOX.duration),
      k.z(50),
      "player_attack",
    ]);

    hitbox.onCollide("boss", () => {
      damageBoss(1);
      hitbox.destroy();
    });
    hitbox.onCollide("dark_orb", (orb) => {
      deflectDarkOrb(orb);
      hitbox.destroy();
    });
    hitbox.onCollide("fire_orb", (orb) => {
      deflectDarkOrb(orb);
      hitbox.destroy();
    });

    hitbox.onCollide("monster", (target) => {
      for (const s of slimes) {
        if (s.alive && s.obj === target) {
          s.alive = false;
          onMonsterHit(s.obj);
          hitbox.destroy();
          return;
        }
      }
      for (const b of bats) {
        if (b.alive && b.obj === target) {
          b.alive = false;
          onMonsterHit(b.obj);
          hitbox.destroy();
          return;
        }
      }
      for (const sk of skeletons) {
        if (sk.alive && sk.obj === target) {
          sk.alive = false;
          onMonsterHit(sk.obj);
          hitbox.destroy();
          return;
        }
      }
    });
  }

  player.onCollide("gift", () => {
    if (!bossDefeated || hasWon || isCelebrating) return;
    isCelebrating = true;
    hasWon = true;

    stopBgm();
    playFanfare();
    k.shake(4);

    const colors = [
      k.rgb(255, 215, 0),
      k.rgb(255, 107, 107),
      k.rgb(57, 216, 111),
      k.rgb(74, 144, 217),
      k.rgb(255, 255, 255),
    ];

    for (let i = 0; i < 28; i++) {
      const pColor = colors[i % colors.length];
      k.add([
        k.rect(i % 2 === 0 ? 3 : 2, i % 2 === 0 ? 3 : 2),
        k.pos(gift.pos.x, gift.pos.y - 8),
        k.color(pColor),
        k.opacity(1),
        k.lifespan(1.2, { fade: 0.8 }),
        k.move(k.Vec2.fromAngle(Math.random() * 360), 30 + Math.random() * 70),
        k.z(25),
      ]);
    }

    k.wait(0.9, () => {
      isPaused = true;
      playWin();
      onWin();
    });
  });

  // ===== KONTROL LOMPAT & GAME FEEL (Coyote Time & Jump Buffering — Pola JSLegendDev) =====
  function spawnLandingDust(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      k.add([
        k.rect(2, 1),
        k.pos(x + (Math.random() - 0.5) * 10, y),
        k.color(180, 170, 140),
        k.opacity(0.8),
        k.lifespan(0.25, { fade: 0.15 }),
        k.move(k.vec2((Math.random() - 0.5) * 35, -8 - Math.random() * 10), 1),
        k.z(9),
      ]);
    }
  }

  function spawnStepDust(x: number, y: number) {
    k.add([
      k.rect(2, 1),
      k.pos(x, y),
      k.color(180, 170, 140),
      k.opacity(0.6),
      k.lifespan(0.2, { fade: 0.1 }),
      k.move(k.vec2(facingRight ? -15 : 15, -4), 1),
      k.z(9),
    ]);
  }

  // Controller Animasi Pemain Terpisah (Pola State Machine JSLegendDev)
  function updatePlayerAnimation(isMoving: boolean) {
    // Prioritas 1: Animasi Serangan (tidak boleh terpotong lari/idle)
    if (attackAnimTimer > 0) {
      if (player.curAnim() !== "attack") {
        try { player.play("attack"); } catch { /* ok */ }
      }
      return;
    }

    // Prioritas 2: Knockback / Terpental
    if (knockbackTimer > 0) {
      if (player.curAnim() !== "jump") {
        try { player.play("jump"); } catch { /* ok */ }
      }
      return;
    }

    // Prioritas 3: Di Udara (Lompat / Jatuh)
    if (!player.isGrounded()) {
      if (player.curAnim() !== "jump") {
        try { player.play("jump"); } catch { /* ok */ }
      }
      return;
    }

    // Prioritas 4: Lari di Atas Tanah
    if (isMoving) {
      if (player.curAnim() !== "run") {
        try { player.play("run"); } catch { /* ok */ }
      }
      return;
    }

    // Prioritas 5: Diam (Idle)
    if (player.curAnim() !== "idle") {
      try { player.play("idle"); } catch { /* ok */ }
    }
  }

  const executeJump = () => {
    if (isPaused || isQuizPaused || hasWon || knockbackTimer > 0) return;
    const jumpForce = speedBuffTimer > 0 ? BASE_JUMP_FORCE * V3_CONFIG.SPEED_BUFF.jumpMul : BASE_JUMP_FORCE;
    player.jump(jumpForce);
    playJump();
    coyoteTimer = 0;
    jumpBufferTimer = 0;
    // Squash & Stretch: deformasi memanjang saat melompat (Fase P-2)
    player.scale = k.vec2(0.88, 1.12);

    for (let i = 0; i < 4; i++) {
      k.add([
        k.rect(2, 2),
        k.pos(player.pos.x + (Math.random() - 0.5) * 8, player.pos.y),
        k.color(180, 170, 140),
        k.opacity(1),
        k.lifespan(0.3, { fade: 0.15 }),
        k.move(k.Vec2.fromAngle(180 + (Math.random() - 0.5) * 60), 25),
        k.z(9),
      ]);
    }
  };

  const tryJump = () => {
    jumpBufferTimer = 0.12; // Buffer input lompat 120ms untuk respon responsif
    if (player.isGrounded() || coyoteTimer > 0) {
      executeJump();
    }
  };

  // ===== CUTSCENE PROLOGUE MMORPG LIVE STAGE =====
  let cutsceneActive = isCutsceneActive;
  let cutsceneScene: 1 | 2 | 3 = 1;
  let cutsceneTimer = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cutsceneGift: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cutsceneShadow: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cutscenePartner: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cutsceneEmote: any = null;

  function initPrologueScene(scene: 1 | 2 | 3) {
    cutsceneScene = scene;
    cutsceneTimer = 0;

    if (scene === 1) {
      if (cutscenePartner) { cutscenePartner.destroy(); cutscenePartner = null; }
      if (cutsceneEmote) { cutsceneEmote.destroy(); cutsceneEmote = null; }
      if (!cutsceneGift) {
        cutsceneGift = k.add([
          k.sprite("gift_chest", { anim: "sparkle" }),
          k.pos(220, FLOOR_Y),
          k.anchor("bot"),
          k.z(45),
          "cutscene_actor",
        ]);
      } else {
        cutsceneGift.pos = k.vec2(220, FLOOR_Y);
      }
      if (!cutsceneShadow) {
        cutsceneShadow = k.add([
          k.sprite("monster_skeleton", { anim: "walk" }),
          k.pos(170, FLOOR_Y),
          k.anchor("bot"),
          k.color(140, 50, 200),
          k.z(46),
          "cutscene_actor",
        ]);
      } else {
        cutsceneShadow.pos = k.vec2(170, FLOOR_Y);
      }
      k.setCamPos(240, 135);
      for (let i = 0; i < 14; i++) {
        k.add([
          k.rect(i % 2 === 0 ? 3 : 2, i % 2 === 0 ? 3 : 2),
          k.pos(170 + (Math.random() - 0.5) * 24, FLOOR_Y - 14 + (Math.random() - 0.5) * 20),
          k.color(180, 80, 255),
          k.opacity(0.9),
          k.lifespan(0.8, { fade: 0.5 }),
          k.move(k.Vec2.fromAngle(Math.random() * 360), 25 + Math.random() * 30),
          k.z(50),
        ]);
      }
    } else if (scene === 2) {
      if (cutsceneGift) { cutsceneGift.destroy(); cutsceneGift = null; }
      if (cutsceneShadow) { cutsceneShadow.destroy(); cutsceneShadow = null; }
      if (cutsceneEmote) { cutsceneEmote.destroy(); cutsceneEmote = null; }
      if (!cutscenePartner) {
        cutscenePartner = k.add([
          k.sprite("partner", { anim: "run" }),
          k.pos(40, FLOOR_Y),
          k.anchor("bot"),
          k.z(45),
          "cutscene_actor",
        ]);
      } else {
        cutscenePartner.pos = k.vec2(40, FLOOR_Y);
        cutscenePartner.play("run");
      }
      k.setCamPos(200, 135);
    } else if (scene === 3) {
      if (cutsceneGift) { cutsceneGift.destroy(); cutsceneGift = null; }
      if (cutsceneShadow) { cutsceneShadow.destroy(); cutsceneShadow = null; }
      if (cutscenePartner) { cutscenePartner.destroy(); cutscenePartner = null; }
      if (cutsceneEmote) { cutsceneEmote.destroy(); cutsceneEmote = null; }
      k.setCamPos(240, 135);
    }
  }

  if (cutsceneActive) {
    initPrologueScene(1);
  }

  // Keyboard input listeners (abaikan saat pause, kuis, atau menang) (L2)
  const canAcceptInput = () => !isPaused && !isQuizPaused && !hasWon && !cutsceneActive && !isPartnerReunionActive && !isCrossSlashing;
  k.onKeyPress("space", () => {
    if (bossStunned && !duoAttackActive) { executeDuoAttack(); return; }
    if (canAcceptInput()) edgeInput.jump = true;
  });
  k.onKeyPress("up", () => { if (canAcceptInput()) edgeInput.jump = true; });
  k.onKeyPress("w", () => { if (canAcceptInput()) edgeInput.jump = true; });
  k.onKeyPress("f", () => {
    if (bossStunned && !duoAttackActive) { executeDuoAttack(); return; }
    if (canAcceptInput()) edgeInput.attack = true;
  });
  k.onKeyPress("j", () => {
    if (bossStunned && !duoAttackActive) { executeDuoAttack(); return; }
    if (canAcceptInput()) edgeInput.attack = true;
  });
  k.onKeyPress("enter", () => {
    if (bossStunned && !duoAttackActive) { executeDuoAttack(); return; }
  });
  k.onKeyPress("e", () => { if (canAcceptInput()) edgeInput.interact = true; });

  // ===== SPARKLE & SAKURA PETAL TIMERS =====
  let sparkleTimer = 0;
  let sakuraPetalTimer = 0;

  // ===== MAIN UPDATE LOOP =====
  k.onUpdate(() => {
    // 0. Pengecekan Pause (L2)
    if (isPaused || isQuizPaused) return;

    // Selebrasi kado: jalankan pembaruan selebrasi sebelum return saat hasWon (L5)
    if (hasWon) {
      if (isCelebrating) {
        gift.pos.x = giftBasePos.x + (Math.random() - 0.5) * 2;
        gift.pos.y = giftBasePos.y - 2 + (Math.random() - 0.5) * 2;
        const camX = Math.round(k.clamp(player.pos.x, 240, LEVEL_WIDTH - 240));
        k.setCamPos(camX, 135);
      }
      return;
    }

    const dt = k.dt();

    // 0.0 Update Cutscene Live Stage bila prolog aktif
    if (cutsceneActive) {
      cutsceneTimer += dt;
      if (cutsceneScene === 1) {
        k.setCamPos(240, 135);
        if (cutsceneShadow && cutsceneGift) {
          if (cutsceneTimer > 0.6) {
            cutsceneShadow.pos.x += 160 * dt;
            cutsceneGift.pos.x = cutsceneShadow.pos.x + 8;
            cutsceneGift.pos.y = cutsceneShadow.pos.y - 12;
            if (Math.random() < 0.25) {
              k.add([
                k.rect(2, 2),
                k.pos(cutsceneShadow.pos.x - 6, FLOOR_Y - 4 - Math.random() * 10),
                k.color(160, 60, 220),
                k.opacity(0.8),
                k.lifespan(0.4, { fade: 0.3 }),
                k.z(44),
              ]);
            }
          }
        }
      } else if (cutsceneScene === 2) {
        k.setCamPos(200, 135);
        if (cutscenePartner) {
          if (cutscenePartner.pos.x < 170) {
            cutscenePartner.pos.x += 140 * dt;
          } else if (cutsceneTimer < 1.8) {
            if (cutscenePartner.curAnim() !== "idle") {
              cutscenePartner.play("idle");
            }
            if (!cutsceneEmote) {
              cutsceneEmote = k.add([
                k.rect(3, 10),
                k.pos(cutscenePartner.pos.x, FLOOR_Y - 32),
                k.anchor("center"),
                k.color(255, 209, 102),
                k.opacity(1),
                k.z(50),
                "cutscene_actor",
              ]);
              k.add([
                k.rect(3, 3),
                k.pos(cutscenePartner.pos.x, FLOOR_Y - 24),
                k.anchor("center"),
                k.color(255, 209, 102),
                k.opacity(1),
                k.lifespan(1.2),
                k.z(50),
                "cutscene_actor",
              ]);
            }
          } else {
            if (cutsceneEmote) {
              cutsceneEmote.destroy();
              cutsceneEmote = null;
            }
            if (cutscenePartner.curAnim() !== "run") {
              cutscenePartner.play("run");
            }
            cutscenePartner.pos.x += 180 * dt;
          }
        }
      } else if (cutsceneScene === 3) {
        k.setCamPos(240, 135);
        pet.pos.y = FLOOR_Y - Math.abs(Math.sin(cutsceneTimer * 8)) * 6;
      }
      return;
    }

    // 0. Combat Juice: Hitstop mikro (0.04s freeze frame)
    if (hitstopTimer > 0) {
      hitstopTimer = Math.max(0, hitstopTimer - dt);
      return;
    }

    // 0.1 Combat Juice: Pending monster deaths (Hit-Flash 0.1s sebelum meledak)
    for (let i = pendingMonsterDeaths.length - 1; i >= 0; i--) {
      const pd = pendingMonsterDeaths[i];
      pd.timer -= dt;
      if (pd.timer <= 0) {
        defeatMonster(pd.obj);
        pendingMonsterDeaths.splice(i, 1);
      }
    }

    // 0.2 Combat Juice: Combo counter timer (jendela 3.0 detik)
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) {
        comboCount = 0;
        comboTimer = 0;
        onComboUpdate?.({ combo: 0, timeLeft: 0, maxTime: COMBO_WINDOW });
      } else {
        onComboUpdate?.({ combo: comboCount, timeLeft: comboTimer, maxTime: COMBO_WINDOW });
      }
    }

    // 0.3 Trigger Penguncian Arena & Intro Boss (x >= 1430)
    if (!bossFightTriggered && player.pos.x >= 1430) {
      bossFightTriggered = true;
      bossFightActive = true;

      // Gerbang Ungu Solid di x = 1420
      arenaGateCollider = k.add([
        k.pos(1420, PEAK_FLOOR_Y - 90),
        k.area({ shape: new k.Rect(k.vec2(0, 0), 12, 100) }),
        k.body({ isStatic: true }),
        k.opacity(0),
        k.z(10),
        "ground",
      ]);
      arenaGateVisual = k.add([
        k.rect(8, 88),
        k.pos(1422, PEAK_FLOOR_Y - 88),
        k.color(168, 85, 247),
        k.opacity(0.85),
        k.z(25),
        "arena_gate",
      ]);

      // Spawn Boss Naga di x = 1760, y = PEAK_FLOOR_Y (sprite 144x64, menghadap ke kiri/pemain secara natural)
      currentBossSpriteKey = "boss_dragon_idle";
      bossObj = k.add([
        k.sprite("boss_dragon_idle", { anim: "idle" }),
        k.pos(1760, PEAK_FLOOR_Y),
        k.scale(1),
        k.area({ shape: new k.Rect(k.vec2(-16, -42), 76, 42) }),
        k.anchor("bot"),
        k.opacity(1),
        k.z(38),
        "boss",
      ]);
      bossObj.flipX = false;

      // Kabut ungu tebal kemunculan Boss
      for (let i = 0; i < 22; i++) {
        k.add([
          k.rect(i % 2 === 0 ? 3 : 2, i % 2 === 0 ? 3 : 2),
          k.pos(1760 + (Math.random() - 0.5) * 32, PEAK_FLOOR_Y - 24 + (Math.random() - 0.5) * 32),
          k.color(180, 80, 255),
          k.opacity(1),
          k.lifespan(0.9, { fade: 0.5 }),
          k.move(k.Vec2.fromAngle(Math.random() * 360), 30 + Math.random() * 40),
          k.z(50),
        ]);
      }

      k.shake(4);
      playBossIntro();
      setBattleTempo(true);
      onBossTitleCard?.(true);
      bossTitleCardTimer = 2.0;
      bossIntroTimer = 1.5;
      bossState = "intro";
      onBossHpUpdate?.(bossHp, BOSS_MAX_HP, true, isEnraged);
    }

    // Timer Title Card Boss
    if (bossTitleCardTimer > 0) {
      bossTitleCardTimer = Math.max(0, bossTitleCardTimer - dt);
      if (bossTitleCardTimer <= 0) {
        onBossTitleCard?.(false);
      }
    }

    // Timer Hit-Flash Boss
    if (bossHitFlashTimer > 0) {
      bossHitFlashTimer = Math.max(0, bossHitFlashTimer - dt);
      if (bossHitFlashTimer <= 0 && bossObj) {
        bossObj.color = k.rgb(255, 255, 255);
        if (bossState === "idle") {
          setBossAction("boss_dragon_idle", "idle");
        }
      }
    }

    // Denyut Kubah Segel Ungu Kotak Kado
    if (giftSealDome && !bossDefeated) {
      giftSealDome.opacity = 0.3 + Math.sin(k.time() * 5) * 0.12;
      if (giftSealRing) {
        giftSealRing.scale = k.vec2(1 + Math.sin(k.time() * 4) * 0.08);
      }
    }

    // State Machine & AI Serangan Boss (Dragon Guardian)
    if (bossFightActive && !bossDefeated && !bossStunned && !duoAttackActive && bossObj) {
      if (bossHp <= 4 && !isEnraged) {
        isEnraged = true;
        onBossHpUpdate?.(bossHp, BOSS_MAX_HP, true, true);
      }

      if (isEnraged && Math.random() < 0.25) {
        k.add([
          k.rect(2, 2),
          k.pos(bossObj.pos.x + (Math.random() - 0.5) * 32, bossObj.pos.y - 12 - Math.random() * 24),
          k.color(239, 68, 68),
          k.opacity(0.8),
          k.lifespan(0.4, { fade: 0.2 }),
          k.move(k.vec2(0, -1), 25),
          k.z(40),
        ]);
      }

      if (bossState === "intro") {
        bossIntroTimer -= dt;
        if (bossIntroTimer <= 0) {
          bossState = "idle";
          bossAttackTimer = 1.0;
        }
      } else if (bossState === "idle") {
        // Sprite naga secara natural menghadap ke kiri. Jika pemain di sebelah kanan, flipX = true.
        bossObj.flipX = bossObj.pos.x < player.pos.x;
        setBossAction("boss_dragon_idle", "idle");
        bossAttackTimer -= dt;
        if (bossAttackTimer <= 0) {
          if (Math.random() < 0.5) {
            // Serangan 1: Semburan Bola Api (Breath)
            bossState = "telegraph_breath";
            bossTelegraphTimer = 0.7;
          } else {
            // Serangan 2: Kibasan Ekor (Tail Swipe)
            bossState = "telegraph_tail";
            bossTelegraphTimer = 0.7;
            const swipeDir = bossObj.flipX ? 1 : -1;
            const warningX = bossObj.pos.x + swipeDir * 38;

            // Garis lantai merah-oranye peringatan menyala di zona jangkauan ekor
            k.add([
              k.rect(65, 4),
              k.pos(warningX, PEAK_FLOOR_Y),
              k.anchor("center"),
              k.color(249, 115, 22), // #f97316
              k.opacity(0.95),
              k.lifespan(0.7, { fade: 0.1 }),
              k.z(35),
            ]);
            k.add([
              k.rect(65, 30),
              k.pos(warningX, PEAK_FLOOR_Y - 15),
              k.anchor("center"),
              k.color(239, 68, 68), // #ef4444
              k.opacity(0.3),
              k.lifespan(0.7, { fade: 0.1 }),
              k.z(34),
            ]);
          }
        }
      } else if (bossState === "telegraph_breath") {
        bossObj.flipX = bossObj.pos.x < player.pos.x;
        const shootDir = bossObj.flipX ? 1 : -1;
        const mouthX = bossObj.pos.x + shootDir * 42;
        const mouthY = bossObj.pos.y - 28;

        // Mulut naga berpendar oranye terang (pendaran api ancang-ancang)
        k.add([
          k.rect(2, 2),
          k.pos(mouthX + (Math.random() - 0.5) * 8, mouthY + (Math.random() - 0.5) * 8),
          k.color(Math.random() < 0.5 ? k.rgb(255, 140, 0) : k.rgb(255, 230, 100)),
          k.opacity(1),
          k.lifespan(0.25, { fade: 0.1 }),
          k.move(k.vec2(shootDir * 12, -10), 20),
          k.z(45),
        ]);

        bossTelegraphTimer -= dt;
        if (bossTelegraphTimer <= 0) {
          bossState = "breath_shooting";
          bossActionTimer = 0.45;
          setBossAction("boss_dragon_breath", "breath");
          playBossShoot();
          spawnFireOrb(mouthX, mouthY, shootDir);
        }
      } else if (bossState === "breath_shooting") {
        bossActionTimer -= dt;
        if (bossActionTimer <= 0) {
          bossState = "idle";
          setBossAction("boss_dragon_idle", "idle");
          bossAttackTimer = isEnraged ? 1.8 : 2.4; // Recovery window lega!
        }
      } else if (bossState === "telegraph_tail") {
        bossTelegraphTimer -= dt;
        if (bossTelegraphTimer <= 0) {
          bossState = "tail_swiping";
          bossActionTimer = 0.35;
          setBossAction("boss_dragon_tail", "tail");
          playBossSlam();
          k.shake(2.0);
          const swipeDir = bossObj.flipX ? 1 : -1;
          const warningX = bossObj.pos.x + swipeDir * 38;
          spawnTailSlash(warningX, swipeDir);
        }
      } else if (bossState === "tail_swiping") {
        bossActionTimer -= dt;
        if (bossActionTimer <= 0) {
          bossState = "idle";
          setBossAction("boss_dragon_idle", "idle");
          bossAttackTimer = isEnraged ? 1.8 : 2.4; // Recovery window lega!
        }
      }

      // Contact damage hanya terjadi jika pemain benar-benar menyentuh tubuh naga (bukan udara kosong di depan kepala)
      const dragonBodyMinX = bossObj.flipX ? bossObj.pos.x - 48 : bossObj.pos.x - 8;
      const dragonBodyMaxX = bossObj.flipX ? bossObj.pos.x + 8 : bossObj.pos.x + 48;
      const touchingDragonBody =
        player.pos.x >= dragonBodyMinX &&
        player.pos.x <= dragonBodyMaxX &&
        player.pos.y > PEAK_FLOOR_Y - 38 &&
        player.pos.y <= PEAK_FLOOR_Y + 4;

      if (
        invulnTimer <= 0 &&
        !bossStunned &&
        !duoAttackActive &&
        attackAnimTimer <= 0 &&
        touchingDragonBody
      ) {
        hurtPlayer(bossObj.pos.x);
      }
    }

    // AI Partner Attack berkala di Arena Boss (tiap 3.0s, 1 damage)
    if (bossFightActive && !bossDefeated && !bossStunned && !duoAttackActive && bossObj) {
      partnerAttackTimer += dt;
      if (partnerAttackTimer >= 3.0) {
        partnerAttackTimer = 0;
        const slashDir = bossObj.pos.x > partnerObj.pos.x ? 1 : -1;
        k.add([
          k.sprite("weapon_slash", { anim: "slash" }),
          k.pos(bossObj.pos.x + (slashDir === 1 ? -16 : 16), bossObj.pos.y - 24),
          k.opacity(1),
          k.lifespan(0.18, { fade: 0.05 }),
          k.anchor("center"),
          k.z(50),
        ]);
        try {
          partnerObj.play("attack");
        } catch { /* ok */ }
        damageBoss(1);
      }
    }

    // Eksekusi Cross-Slash Duo Finisher
    if (isCrossSlashing) {
      crossSlashTimer -= dt;
      if (crossSlashTimer <= 0) {
        isCrossSlashing = false;
        if (bossObj) {
          for (let i = 0; i < 45; i++) {
            const col = i % 3 === 0 ? k.rgb(255, 215, 0) : (i % 3 === 1 ? k.rgb(180, 80, 255) : k.rgb(255, 255, 255));
            k.add([
              k.rect(i % 2 === 0 ? 3 : 2, i % 2 === 0 ? 3 : 2),
              k.pos(bossObj.pos.x + (Math.random() - 0.5) * 60, bossObj.pos.y - 28 + (Math.random() - 0.5) * 36),
              k.color(col),
              k.opacity(1),
              k.lifespan(1.2, { fade: 0.6 }),
              k.move(k.Vec2.fromAngle(Math.random() * 360), 40 + Math.random() * 60),
              k.z(65),
            ]);
          }
          bossObj.destroy();
          bossObj = null;
        }
        bossDefeated = true;
        bossFightActive = false;
        onBossHpUpdate?.(0, BOSS_MAX_HP, false, false);

        if (arenaGateCollider) { arenaGateCollider.destroy(); arenaGateCollider = null; }
        if (arenaGateVisual) {
          for (let i = 0; i < 14; i++) {
            k.add([
              k.rect(2, 2),
              k.pos(arenaGateVisual.pos.x + (Math.random() - 0.5) * 8, arenaGateVisual.pos.y + Math.random() * 80),
              k.color(168, 85, 247),
              k.opacity(1),
              k.lifespan(0.6, { fade: 0.3 }),
              k.move(k.Vec2.fromAngle(Math.random() * 360), 30 + Math.random() * 30),
              k.z(30),
            ]);
          }
          arenaGateVisual.destroy();
          arenaGateVisual = null;
        }

        if (giftSealDome) {
          for (let i = 0; i < 18; i++) {
            k.add([
              k.rect(2, 2),
              k.pos(giftBasePos.x + (Math.random() - 0.5) * 24, giftBasePos.y - 12 + (Math.random() - 0.5) * 24),
              k.color(216, 180, 254),
              k.opacity(1),
              k.lifespan(0.7, { fade: 0.4 }),
              k.move(k.Vec2.fromAngle(Math.random() * 360), 35 + Math.random() * 35),
              k.z(20),
            ]);
          }
          giftSealDome.destroy();
          giftSealDome = null;
        }
        if (giftSealRing) {
          giftSealRing.destroy();
          giftSealRing = null;
        }

        setBattleTempo(false);
        celebrationSakuraRainActive = true;
        player.jump(180);
        partnerCelebrationJumpTimer = 0.45;
        pet.pos.y -= 15;
        spawnReunionHeartEmote();

        // Snapshot Momen Petualangan (Fase P-3)
        setTimeout(() => {
          try {
            const snap = k.screenshot();
            if (snap && typeof snap === "string") {
              onAdventureSnapshot?.(snap);
            }
          } catch {
            // Abaikan jika tidak didukung di lingkungan uji
          }
        }, 400);

        activeToast = {
          text: "Kado telah terbebas! Buka kado spesialmu!",
          type: "checkpoint",
          worldX: giftBasePos.x,
          worldY: giftBasePos.y - 28,
          timer: 4.0,
          maxDuration: 4.0,
        };
        if (onFloatingNotification) {
          onFloatingNotification({ text: "Kado telah terbebas! Buka kado spesialmu!", type: "checkpoint" });
        } else if (onMemoryToast) {
          onMemoryToast("Kado telah terbebas! Buka kado spesialmu!");
        }
      }
    }

    // Selebrasi Hujan Kelopak Sakura Terus-Menerus setelah Boss Kalah
    if (celebrationSakuraRainActive) {
      celebrationEmoteTimer += dt;
      if (celebrationEmoteTimer >= 1.8) {
        celebrationEmoteTimer = 0;
        spawnReunionHeartEmote();
      }
      if (Math.random() < 0.3) {
        const dropX = 1420 + Math.random() * 480;
        trackVfxParticle(k.add([
          k.rect(2, 2),
          k.pos(dropX, 40),
          k.color(255, 183, 197),
          k.opacity(0.85),
          k.lifespan(2.5, { fade: 0.6 }),
          k.move(k.vec2(0.2, 1), 45 + Math.random() * 25),
          k.z(25),
        ]));
      }
      if (Math.random() < 0.15) {
        const dropX = 1420 + Math.random() * 480;
        trackVfxParticle(k.add([
          k.rect(2, 2),
          k.pos(dropX, 60),
          k.color(255, 215, 0),
          k.opacity(0.9),
          k.lifespan(1.5, { fade: 0.5 }),
          k.move(k.vec2(0.1, 1), 30 + Math.random() * 20),
          k.z(25),
        ]));
      }
    }

    // Update Lompatan Selebrasi Manual Partner (100% Bebas TypeError .jump)
    if (partnerCelebrationJumpTimer > 0) {
      partnerCelebrationJumpTimer = Math.max(0, partnerCelebrationJumpTimer - dt);
      const prog = 1 - partnerCelebrationJumpTimer / 0.45;
      partnerObj.pos.y = PEAK_FLOOR_Y - Math.sin(prog * Math.PI) * 22;
    }

    // === Easter Egg: Duduk di Ayunan Berdua (Fase P-3) ===
    if (isSittingOnSwing) {
      const exitSwing =
        k.isKeyPressed("space") ||
        k.isKeyPressed("w") ||
        k.isKeyPressed("up") ||
        k.isKeyPressed("e") ||
        k.isKeyPressed("escape") ||
        k.isKeyDown("left") ||
        k.isKeyDown("a") ||
        k.isKeyDown("right") ||
        k.isKeyDown("d") ||
        virtualInput.left ||
        virtualInput.right ||
        virtualInput.jump ||
        edgeInput.jump ||
        edgeInput.attack ||
        edgeInput.interact;

      if (exitSwing) {
        edgeInput.jump = false;
        edgeInput.attack = false;
        edgeInput.interact = false;
        isSittingOnSwing = false;
        player.pos = k.vec2(1208, PEAK_FLOOR_Y);
        partnerObj.pos = k.vec2(1248, PEAK_FLOOR_Y);
        k.setCamScale(1.0);
        onSwingStateChange?.(false);
      } else {
        player.vel = k.vec2(0, 0);
        const curAngleRad = (swingPivot.angle || 0) * (Math.PI / 180);
        const seatX = 1228 + Math.sin(curAngleRad) * 68;
        const seatY = (PEAK_FLOOR_Y - 96) + Math.cos(curAngleRad) * 68;

        player.pos = k.vec2(seatX - 6, seatY);
        partnerObj.pos = k.vec2(seatX + 6, seatY);
        player.flipX = false;
        partnerObj.flipX = true;
        if (player.curAnim && player.curAnim() !== "idle") player.play("idle");
        if (partnerObj.curAnim && partnerObj.curAnim() !== "idle") partnerObj.play("idle");

        k.setCamScale(1.15);
        k.setCamPos(1228, PEAK_FLOOR_Y - 45);
        return;
      }
    }

    // 1. Baca Input Edge-Triggered
    if (edgeInput.jump) {
      edgeInput.jump = false;
      tryJump();
    }
    if (edgeInput.attack) {
      edgeInput.attack = false;
      performAttack();
    }
    if (edgeInput.interact) {
      edgeInput.interact = false;

      // 1. Hitung ulang NPC terdekat saat interaksi terjadi (jarak <= 28 px, grounded, belum selesai) (L8)
      let activeNpc: QuizNpcItem | null = null;
      let minD = 9999;
      if (player.isGrounded()) {
        for (const q of quizNpcs) {
          if (!q.resolved) {
            const d = Math.abs(player.pos.x - q.obj.pos.x);
            if (d <= V3_CONFIG.INTERACT_RANGE && d < minD) {
              minD = d;
              activeNpc = q;
            }
          }
        }
      }

      if (activeNpc) {
        isQuizPaused = true;
        if (lastPromptWasVisible) {
          onInteractionPromptUpdate?.(null);
          lastPromptWasVisible = false;
        }
        onOpenChallenge?.(activeNpc.challenge, activeNpc.index, quizNpcs.length);
        return;
      }

      // 2. Interaksi Duduk di Ayunan Berdua
      const nearSwingNow =
        (partnerJoined || isPeacefulMode) &&
        !isSittingOnSwing &&
        Math.abs(player.pos.x - 1228) <= 40 &&
        Math.abs(player.pos.y - PEAK_FLOOR_Y) <= 20;

      if (nearSwingNow) {
        isSittingOnSwing = true;
        onSwingPromptUpdate?.(null);
        onSwingStateChange?.(true);
        player.vel = k.vec2(0, 0);
        return;
      }

      // 3. Interaksi Buka Kado di Mode Damai
      if (isPeacefulMode && Math.abs(player.pos.x - 1850) <= 36) {
        onWin();
        return;
      }
    }

    // 2. Cooldown & Anim Serangan
    if (attackCooldown > 0) {
      attackCooldown = Math.max(0, attackCooldown - dt);
    }
    if (attackAnimTimer > 0) {
      attackAnimTimer = Math.max(0, attackAnimTimer - dt);
    }

    // Update Coyote Timer & Debu Pendaratan (Pola JSLegendDev)
    const isGroundedNow = player.isGrounded();
    if (isGroundedNow) {
      coyoteTimer = 0.12; // 120ms toleransi setelah lepas tepi platform
      if (!wasGrounded) {
        spawnLandingDust(player.pos.x, player.pos.y);
        // Squash & Stretch: deformasi memipih saat mendarat di genteng/lantai (Fase P-2)
        player.scale = k.vec2(1.15, 0.85);
      }
      wasGrounded = true;
    } else {
      coyoteTimer = Math.max(0, coyoteTimer - dt);
      wasGrounded = false;
    }

    // Konsumsi Jump Buffer jika menyentuh tanah atau masih dalam coyote time
    if (jumpBufferTimer > 0) {
      jumpBufferTimer = Math.max(0, jumpBufferTimer - dt);
      if (isGroundedNow || coyoteTimer > 0) {
        executeJump();
      }
    }

    // 3. Knockback Movement & Animasi Terpisah (Pola JSLegendDev)
    if (knockbackTimer > 0) {
      knockbackTimer = Math.max(0, knockbackTimer - dt);
      player.move(knockbackDir * V3_CONFIG.KNOCKBACK.speed, 0);
      updatePlayerAnimation(false);
    } else {
      // Kontrol Horizontal Normal
      const moveLeft = k.isKeyDown("left") || k.isKeyDown("a") || virtualInput.left;
      const moveRight = k.isKeyDown("right") || k.isKeyDown("d") || virtualInput.right;
      const curSpeed = speedBuffTimer > 0 ? BASE_SPEED * V3_CONFIG.SPEED_BUFF.moveMul : BASE_SPEED;
      let isMoving = false;

      if (moveLeft && !moveRight) {
        player.move(-curSpeed, 0);
        if (facingRight) { player.flipX = true; facingRight = false; }
        isMoving = true;
      } else if (moveRight && !moveLeft) {
        player.move(curSpeed, 0);
        if (!facingRight) { player.flipX = false; facingRight = true; }
        isMoving = true;
      }

      updatePlayerAnimation(isMoving);

      // Partikel debu langkah lari
      if (isGroundedNow && isMoving && attackAnimTimer <= 0) {
        stepDustTimer += dt;
        if (stepDustTimer > 0.22) {
          stepDustTimer = 0;
          spawnStepDust(player.pos.x + (facingRight ? -4 : 4), player.pos.y);
        }
      } else {
        stepDustTimer = 0;
      }
    }

    // Squash & Stretch: pemulihan elastis skala pemain menuju (1, 1) (Fase P-2)
    const scaleRecovery = Math.min(1, 14 * dt);
    player.scale.x += (1 - player.scale.x) * scaleRecovery;
    player.scale.y += (1 - player.scale.y) * scaleRecovery;
    if (player.scale.x < 0.2) player.scale.x = 0.2;

    // 4. Update Aura Perisai
    if (hasShield) {
      shieldAura.pos.x = player.pos.x;
      shieldAura.pos.y = player.pos.y - 8;
      shieldAura.opacity = 0.25 + Math.sin(k.time() * 6) * 0.1;
    } else {
      shieldAura.opacity = 0;
    }

    // 5. Gerak Monster Slime, Kelelawar, & Skeleton
    for (const s of slimes) {
      if (!s.alive) continue;
      s.obj.move(s.dir * V3_CONFIG.SLIME.speed, 0);
      if (s.obj.pos.x >= s.maxX) {
        s.dir = -1;
        s.obj.flipX = true;
      } else if (s.obj.pos.x <= s.minX) {
        s.dir = 1;
        s.obj.flipX = false;
      }
    }

    for (const b of bats) {
      if (!b.alive) continue;
      b.timer += dt;
      b.obj.move(b.dir * V3_CONFIG.BAT.speed, 0);
      const curX = b.obj.pos.x;
      if (curX >= b.centerX + 40) {
        b.dir = -1;
        b.obj.flipX = true;
      } else if (curX <= b.centerX - 40) {
        b.dir = 1;
        b.obj.flipX = false;
      }
      b.obj.pos.y = b.baseY + Math.sin(b.timer * 2 * Math.PI / V3_CONFIG.BAT.period) * V3_CONFIG.BAT.amp;
    }

    for (const sk of skeletons) {
      if (!sk.alive) continue;
      sk.obj.move(sk.dir * 26, 0);
      if (sk.obj.pos.x >= sk.maxX) {
        sk.dir = -1;
        sk.obj.flipX = false;
      } else if (sk.obj.pos.x <= sk.minX) {
        sk.dir = 1;
        sk.obj.flipX = true;
      }
    }

    // 6. Kontak Monster dan Pemain
    if (invulnTimer <= 0) {
      for (const s of slimes) {
        if (!s.alive) continue;
        if (Math.abs(player.pos.x - s.obj.pos.x) < 14 && Math.abs(player.pos.y - s.obj.pos.y) < 16) {
          hurtPlayer(s.obj.pos.x);
          break;
        }
      }
      for (const b of bats) {
        if (!b.alive) continue;
        if (Math.abs(player.pos.x - b.obj.pos.x) < 14 && Math.abs((player.pos.y - 8) - b.obj.pos.y) < 14) {
          hurtPlayer(b.obj.pos.x);
          break;
        }
      }
      for (const sk of skeletons) {
        if (!sk.alive) continue;
        if (Math.abs(player.pos.x - sk.obj.pos.x) < 14 && Math.abs(player.pos.y - sk.obj.pos.y) < 16) {
          hurtPlayer(sk.obj.pos.x);
          break;
        }
      }
    }

    // 7. Timer Invulnerability (Pastikan opacity pemain & partner kembali 1 dengan tegas)
    if (invulnTimer > 0) {
      invulnTimer = Math.max(0, invulnTimer - dt);
      player.opacity = Math.floor(invulnTimer * 10) % 2 === 0 ? 0.35 : 1;
      if (invulnTimer <= 0) {
        player.opacity = 1;
      }
    } else {
      player.opacity = 1;
    }
    partnerObj.opacity = 1;

    // 8. Timer Buff
    if (speedBuffTimer > 0) {
      speedBuffTimer = Math.max(0, speedBuffTimer - dt);
    }
    if (starBuffTimer > 0) {
      starBuffTimer = Math.max(0, starBuffTimer - dt);
    }

    // 9. Deteksi Jarak ke NPC Kuis & Prompt Interaksi (<= 28 px)
    let closestCandidateId: string | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let closestNpcObj: any = null;
    let closestNpcIndex = -1;
    let closestDist = 9999;

    for (const q of quizNpcs) {
      const dist = Math.abs(player.pos.x - q.obj.pos.x);
      if (!q.resolved) {
        if (dist <= V3_CONFIG.INTERACT_RANGE && player.isGrounded()) {
          if (dist < closestDist) {
            closestDist = dist;
            closestCandidateId = q.challenge.id;
            closestNpcObj = q.obj;
            closestNpcIndex = q.index;
          }
        }
      } else {
        q.obj.opacity = 0.6; // redup bila sudah selesai
      }
    }

    // Pemutakhiran posisi Balon Interaksi HTML/CSS tajam
    const currentCam = k.getCamPos();
    const currentCamX = currentCam.x;
    const currentCamYActual = currentCam.y;
    const scale = canvas.width / 480;

    if (closestCandidateId && closestNpcObj && !isQuizPaused && !hasWon) {
      const screenVirtX = closestNpcObj.pos.x - currentCamX + 240;
      // Posisi di atas kepala NPC diproyeksikan dengan memperhitungkan elevasi kamera vertikal
      const screenVirtY = closestNpcObj.pos.y - 26 - currentCamYActual + 135;
      onInteractionPromptUpdate?.({
        visible: true,
        x: screenVirtX * scale,
        y: screenVirtY * scale,
        challengeIndex: closestNpcIndex,
      });
      lastPromptWasVisible = true;
    } else if (lastPromptWasVisible) {
      onInteractionPromptUpdate?.(null);
      lastPromptWasVisible = false;
    }

    // Pemutakhiran posisi Lencana Selesai (✓) HTML Tajam di atas NPC
    const resolvedBadges: Array<{ index: number; x: number; y: number; visible: boolean }> = [];
    for (const q of quizNpcs) {
      if (q.resolved) {
        const screenVirtX = q.obj.pos.x - currentCamX + 240;
        const screenVirtY = q.obj.pos.y - 22 - currentCamYActual + 135;
        const isVisible = screenVirtX >= -30 && screenVirtX <= 510;
        resolvedBadges.push({
          index: q.index,
          x: screenVirtX * scale,
          y: screenVirtY * scale,
          visible: isVisible,
        });
      }
    }
    if (resolvedBadges.length > 0 || lastHadResolvedBadges) {
      onResolvedNpcBadgesUpdate?.(resolvedBadges);
      lastHadResolvedBadges = resolvedBadges.length > 0;
    }

    // Pemutakhiran Prompt Ayunan HTML/CSS Tajam (Fase P-3)
    const nearSwing =
      (partnerJoined || isPeacefulMode) &&
      !isSittingOnSwing &&
      Math.abs(player.pos.x - 1228) <= 40 &&
      Math.abs(player.pos.y - PEAK_FLOOR_Y) <= 20 &&
      !isQuizPaused &&
      !isCutsceneActive &&
      !isPaused &&
      !bossFightActive;

    if (nearSwing) {
      const swingVirtX = 1228 - currentCamX + 240;
      const swingVirtY = (PEAK_FLOOR_Y - 55) - currentCamYActual + 135;
      onSwingPromptUpdate?.({
        visible: true,
        x: swingVirtX * scale,
        y: swingVirtY * scale,
      });
      lastNearSwing = true;
    } else if (lastNearSwing) {
      onSwingPromptUpdate?.(null);
      lastNearSwing = false;
    }

    if (nearSwing && (edgeInput.interact || (k.isKeyPressed("e") && !isQuizPaused))) {
      edgeInput.interact = false;
      isSittingOnSwing = true;
      lastNearSwing = false;
      onSwingPromptUpdate?.(null);
      onSwingStateChange?.(true);
      player.vel = k.vec2(0, 0);
    }

    // Interaksi Kado di Mode Damai (Fase P-3)
    if (isPeacefulMode && Math.abs(player.pos.x - 1850) <= 36) {
      if (edgeInput.interact || (k.isKeyPressed("e") && !isQuizPaused)) {
        edgeInput.interact = false;
        onWin();
      }
    }

    // Pemutakhiran posisi World Toast (Bintang Kenangan & Checkpoint)
    if (activeToast) {
      activeToast.timer -= dt;
      if (activeToast.timer <= 0) {
        activeToast = null;
        if (lastToastWasVisible) {
          onFloatingNotificationUpdate?.(null);
          lastToastWasVisible = false;
        }
      } else {
        const screenVirtX = activeToast.worldX - currentCamX + 240;
        const progress = 1 - (activeToast.timer / activeToast.maxDuration);
        // Easing keluar halus untuk melayang naik (decelerating upward float)
        const easeOut = 1 - Math.pow(1 - progress, 2);
        const floatVirtY = easeOut * 20;
        const screenVirtY = (activeToast.worldY - floatVirtY) - currentCamYActual + 135;

        // Kurva opasitas: memudar masuk (0-10%), bertahan penuh (10-75%), memudar keluar halus (75-100%)
        let opacity = 1;
        if (progress < 0.1) {
          opacity = progress / 0.1;
        } else if (progress > 0.75) {
          opacity = Math.max(0, (1 - progress) / 0.25);
        }

        // Batasi koordinat horizontal agar teks selalu terbaca utuh di dalam layar
        const clampedVirtX = Math.max(70, Math.min(410, screenVirtX));
        const isVisible = screenVirtX >= -60 && screenVirtX <= 540;

        if (isVisible) {
          onFloatingNotificationUpdate?.({
            visible: true,
            text: activeToast.text,
            type: activeToast.type,
            x: clampedVirtX * scale,
            y: screenVirtY * scale,
            opacity,
          });
          lastToastWasVisible = true;
        } else if (lastToastWasVisible) {
          onFloatingNotificationUpdate?.(null);
          lastToastWasVisible = false;
        }
      }
    } else if (lastToastWasVisible) {
      onFloatingNotificationUpdate?.(null);
      lastToastWasVisible = false;
    }

    if (closestCandidateId !== nearbyChallengeId) {
      nearbyChallengeId = closestCandidateId;
      emitHud();
    }

    // === Kado melayang & berguncang saat selebrasi ===
    if (isCelebrating) {
      gift.pos.x = giftBasePos.x + (Math.random() - 0.5) * 2;
      gift.pos.y = giftBasePos.y - 2 + (Math.random() - 0.5) * 2;
    } else {
      gift.pos.y = giftBasePos.y + Math.sin(k.time() * 3) * 4;
    }

    // === Bintang kenangan melayang ===
    for (let i = 0; i < memoryItems.length; i++) {
      const memory = memoryItems[i];
      if (memory.obj.exists()) {
        memory.obj.pos.y = memory.baseY + Math.sin(k.time() * 2 + i * 1.4) * 4;
      }
    }

    // === Lentera checkpoint (Babak 1 di 500 & Babak 2 di 1190) ===
    for (const cp of checkpoints) {
      if (!cp.lit && Math.abs(player.pos.x - cp.x) < 24 && Math.abs(player.pos.y - cp.floorY) < 32) {
        cp.lit = true;
        cp.obj.use(k.sprite("lantern_lit"));
        cp.aura.opacity = 0.18;
        respawnPos = k.vec2(cp.x - 8, cp.floorY);
        playCheckpoint();
        for (let i = 0; i < 10; i++) {
          k.add([
            k.rect(i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1),
            k.pos(
              cp.x + (Math.random() - 0.5) * 18,
              cp.floorY - 10 - Math.random() * 18
            ),
            k.color(255, 209, 102),
            k.opacity(1),
            k.lifespan(1, { fade: 0.7 }),
            k.move(k.Vec2.fromAngle(Math.random() * 360), 15 + Math.random() * 20),
            k.z(7),
          ]);
        }
        activeToast = {
          text: "Checkpoint!",
          type: "checkpoint",
          worldX: cp.x,
          worldY: cp.floorY - 26,
          timer: 2.6,
          maxDuration: 2.6,
        };
        if (onFloatingNotification) {
          onFloatingNotification({ text: "Checkpoint!", type: "checkpoint" });
        } else if (onMemoryToast) {
          onMemoryToast("Checkpoint!");
        }
      }
      if (cp.lit) {
        cp.aura.opacity = 0.16 + (Math.sin(k.time() * 3) + 1) * 0.05;
        cp.auraOuter.opacity = 0.08 + (Math.sin(k.time() * 3) + 1) * 0.03;
      }
    }

    // === Full Heal Otomatis di Bawah Naungan Pohon Sakura Utama (x = 1270) ===
    if (!treeHealTriggered && Math.abs(player.pos.x - 1270) <= 45) {
      treeHealTriggered = true;
      hearts = V3_CONFIG.MAX_HP;
      emitHud();
      playBuff();
      for (let i = 0; i < 16; i++) {
        k.add([
          k.rect(i % 2 === 0 ? 3 : 2, i % 2 === 0 ? 3 : 2),
          k.pos(1270 + (Math.random() - 0.5) * 60, PEAK_FLOOR_Y - 16 - Math.random() * 30),
          k.color(46, 204, 113),
          k.opacity(1),
          k.lifespan(1.2, { fade: 0.8 }),
          k.move(k.vec2((Math.random() - 0.5) * 30, -20 - Math.random() * 30), 1),
          k.z(45),
        ]);
      }
      activeToast = {
        text: "Kekuatan Pulih Penuh di Bawah Naungan Pohon!",
        type: "checkpoint",
        worldX: 1270,
        worldY: PEAK_FLOOR_Y - 36,
        timer: 3.2,
        maxDuration: 3.2,
      };
    }

    // === Reuni Avatar Pasangan di Taman Puncak Sakura (x = 1295) ===
    if (!partnerReunionTriggered && Math.abs(player.pos.x - 1295) <= 40) {
      partnerReunionTriggered = true;
      isPartnerReunionActive = true;
      virtualInput.left = false;
      virtualInput.right = false;
      virtualInput.jump = false;
      virtualInput.attack = false;
      onPartnerReunion?.();
    }

    // === Update AI Co-op Partner (Mengikuti Halus & Alami di Setiap Ketinggian) ===
    if (partnerJoined && !isSittingOnSwing) {
      const targetPartnerX = player.pos.x - (facingRight ? 26 : -26);
      const distX = Math.abs(partnerObj.pos.x - targetPartnerX);

      let partnerSpeedX = 0;
      if (distX > 6) {
        const prevX = partnerObj.pos.x;
        partnerObj.pos.x += (targetPartnerX - partnerObj.pos.x) * (1 - Math.exp(-9 * dt));
        partnerSpeedX = Math.abs(partnerObj.pos.x - prevX) / (dt || 0.016);
      }
      partnerObj.pos.x = k.clamp(partnerObj.pos.x, 8, LEVEL_WIDTH - 8);

      // Hitung ketinggian lantai Partner berdasarkan helper getFloorYAt dan platform jembatan (100% anti-ngambang)
      let partnerBaseFloorY = getFloorYAt(partnerObj.pos.x);
      const currentPlatform = platforms.find(
        (plat) => partnerObj.pos.x >= plat.x - 4 && partnerObj.pos.x <= plat.x + plat.w + 4
      );

      if (currentPlatform && player.pos.y <= currentPlatform.y + 12) {
        partnerBaseFloorY = currentPlatform.y;
      }

      // Lompatan Partner mengikuti dinamika lompatan pemain
      let targetPartnerY = partnerBaseFloorY;
      const playerJumpDelta = Math.min(0, player.pos.y - getFloorYAt(player.pos.x));
      if (!player.isGrounded() && playerJumpDelta < -8) {
        targetPartnerY = partnerBaseFloorY + playerJumpDelta;
      }

      partnerObj.pos.y += (targetPartnerY - partnerObj.pos.y) * (1 - Math.exp(-14 * dt));

      partnerObj.flipX = !facingRight;
      const isPartnerJumping = Math.abs(partnerObj.pos.y - partnerBaseFloorY) > 8;
      const nextPartnerAnim = isPartnerJumping ? "jump" : (partnerSpeedX > 4 ? "run" : "idle");
      if (partnerObj.curAnim() !== nextPartnerAnim) {
        partnerObj.play(nextPartnerAnim);
      }
    }

    // === Jurang (Jatuh ke lubang mengurangi 1 hati & respawn konsisten) (L4) ===
    if (player.pos.y > getFloorYAt(player.pos.x) + 45 || player.pos.y > 270) {
      k.shake(3);
      loseHeart();
      if (hearts > 0) {
        player.pos = k.vec2(respawnPos.x, respawnPos.y);
        player.vel = k.vec2(0, 0);
        knockbackTimer = 0;
        invulnTimer = 0.8;
        pet.pos.x = Math.max(8, player.pos.x - (facingRight ? 20 : -20));
        pet.pos.y = player.pos.y;
        currentCamY = respawnPos.x > 1060 ? 108 : 135;
        k.setCamPos(Math.round(k.clamp(player.pos.x, 240, LEVEL_WIDTH - 240)), Math.round(currentCamY));
        emitHud();
      }
    }

    // === Update Kamera (Smooth Lerp Reveal Pohon Sakura saat x > 1060 & Kunci Arena Boss) ===
    let targetCamY = player.pos.x > 1060 ? 108 : 135;
    let targetCamX = Math.round(k.clamp(player.pos.x, 240, LEVEL_WIDTH - 240));

    if (bossFightActive && !bossDefeated) {
      targetCamX = 1660;
      targetCamY = 108;
    }

    if (!isSittingOnSwing) {
      currentCamY += (targetCamY - currentCamY) * (1 - Math.exp(-4 * dt));
      const roundCamY = Math.round(currentCamY);
      k.setCamPos(targetCamX, roundCamY);
    }

    // Lonceng angin lembut saat pemain pertama kali mencapai Dataran Tinggi Puncak
    if (!peakChimePlayed && player.pos.x >= 1150) {
      peakChimePlayed = true;
      playWindChime();
    }

    // === Update Parallax Kota Senja (0.25x tanpa celah) ===
    const off = -((targetCamX - 240) * PARALLAX_FACTOR);
    const x0 = Math.round(((off % BG_TILE_WIDTH) + BG_TILE_WIDTH) % BG_TILE_WIDTH);
    cityTiles[0].pos.x = x0 - BG_TILE_WIDTH;
    cityTiles[1].pos.x = x0;
    cityTiles[2].pos.x = x0 + BG_TILE_WIDTH;

    // === 1. Transisi Langit Dinamis (Fase P-2) ===
    let targetR = 255;
    let targetG = 140;
    let targetB = 60;
    let targetA = 0;
    let skyMode: "sunset" | "night" | "boss" | "dawn" = "sunset";

    if (bossDefeated) {
      // Babak 4: Fajar Keemasan (Golden Dawn)
      skyMode = "dawn";
      targetR = 255; targetG = 185; targetB = 120; targetA = 0.45;
    } else if (player.pos.x >= 1420) {
      // Babak 3: Tengah Malam Ungu Gelap Dramatis (Boss Naga)
      skyMode = "boss";
      targetR = 45; targetG = 12; targetB = 65; targetA = 0.68;
    } else if (player.pos.x >= 1050) {
      // Babak 2: Malam Berbintang Taman Sakura
      skyMode = "night";
      targetR = 20; targetG = 24; targetB = 60; targetA = 0.55;
    } else {
      // Babak 1: Senja Jingga Hangat
      skyMode = "sunset";
      targetR = 255; targetG = 140; targetB = 60; targetA = 0;
    }

    const skyLerp = Math.min(1, 2.2 * dt);
    currentSkyR += (targetR - currentSkyR) * skyLerp;
    currentSkyG += (targetG - currentSkyG) * skyLerp;
    currentSkyB += (targetB - currentSkyB) * skyLerp;
    currentSkyA += (targetA - currentSkyA) * skyLerp;

    skyOverlay.color = k.rgb(currentSkyR, currentSkyG, currentSkyB);
    skyOverlay.opacity = currentSkyA;

    // Kilatan petir super halus di langit Babak 3 (setiap ~9–13s)
    if (skyMode === "boss") {
      lightningTimer += dt;
      if (lightningTimer > 10.5) {
        lightningTimer = Math.random() * 2;
        skyLightning.opacity = 0.18;
      }
    }
    if (skyLightning.opacity > 0) {
      skyLightning.opacity = Math.max(0, skyLightning.opacity - 1.2 * dt);
    }

    // === 2. Kota yang "Bernapas" (Jendela Berkelip & Bintang Jatuh) ===
    const currentTime = k.time();
    for (const win of cityWindows) {
      win.obj.opacity = Math.max(
        0.12,
        Math.min(0.85, win.baseOpacity + Math.sin(currentTime * win.freq + win.phase) * 0.35)
      );
    }

    // Bintang Jatuh (Shooting Star) setiap 12–15 detik
    shootingStarTimer += dt;
    if (shootingStarTimer >= 13.5) {
      shootingStarTimer = (Math.random() - 0.5) * 3;
      const ssX = 20 + Math.random() * 300;
      const ssY = 8 + Math.random() * 45;
      trackVfxParticle(k.add([
        k.rect(8, 1.5),
        k.pos(ssX, ssY),
        k.rotate(32),
        k.color(255, 235, 160),
        k.opacity(0.85),
        k.lifespan(0.65, { fade: 0.4 }),
        k.move(k.vec2(220, 135), 1),
        k.fixed(),
        k.z(-85),
      ]));
    }

    // === 3. Foreground Parallax 1.25x & Transisi Dedaunan -> Sakura ===
    const fgCamX = targetCamX;
    const fgShift = (fgCamX - 240) * 1.25;
    const isSakuraZone = fgCamX >= 1050;

    for (const fg of fgElements) {
      const screenX = (((fg.baseX - fgShift) % FG_WIDTH) + FG_WIDTH) % FG_WIDTH - 40;
      fg.obj.pos.x = screenX;
      if (fg.kind === "leaf") {
        fg.obj.opacity = isSakuraZone
          ? Math.max(0, fg.obj.opacity - 1.5 * dt)
          : Math.min(0.24, fg.obj.opacity + 1.5 * dt);
      } else {
        fg.obj.opacity = isSakuraZone
          ? Math.min(0.28, fg.obj.opacity + 1.5 * dt)
          : Math.max(0, fg.obj.opacity - 1.5 * dt);
      }
    }

    // === 4. Update Pending Ghost Trails ===
    for (let i = pendingGhostTrails.length - 1; i >= 0; i--) {
      const pgt = pendingGhostTrails[i];
      pgt.delay -= dt;
      if (pgt.delay <= 0) {
        spawnGhostTrail(pgt.target, pgt.color, pgt.opacity);
        pendingGhostTrails.splice(i, 1);
      }
    }

    // === 5. Pulsa Lentera Checkpoint Aktif ===
    for (const cp of checkpoints) {
      if (cp.lit) {
        cp.aura.opacity = 0.15 + Math.sin(currentTime * 3 + cp.x) * 0.04;
        cp.auraOuter.opacity = 0.07 + Math.sin(currentTime * 2.2 + cp.x) * 0.03;
      }
    }

    // === 6. Bintang di Langit (Lebih Terang di Malam Sakura, Meredup di Fajar Emas) ===
    const baseStarOpacity = skyMode === "night" ? 0.8 : skyMode === "boss" ? 0.6 : skyMode === "dawn" ? 0.22 : 0.45;
    for (let i = 0; i < stars.length; i++) {
      stars[i].opacity = Math.max(0.1, baseStarOpacity + Math.sin(currentTime * 2 + i * 1.7) * 0.25);
    }

    // === Update Companion Pet (Mengikuti Halus & Responsif di Setiap Ketinggian) ===
    const petDt = k.dt();
    const targetPetX = player.pos.x - (facingRight ? 20 : -20);
    const distX = Math.abs(pet.pos.x - player.pos.x);

    let petSpeedX = 0;
    if (distX > 24) {
      const prevX = pet.pos.x;
      pet.pos.x += (targetPetX - pet.pos.x) * (1 - Math.exp(-8 * petDt));
      petSpeedX = Math.abs(pet.pos.x - prevX) / (petDt || 0.016);
    }
    pet.pos.x = k.clamp(pet.pos.x, 8, LEVEL_WIDTH - 8);

    let petBaseFloorY = getFloorYAt(pet.pos.x);
    const petPlatform = platforms.find(
      (plat) => pet.pos.x >= plat.x - 4 && pet.pos.x <= plat.x + plat.w + 4
    );
    if (petPlatform && player.pos.y <= petPlatform.y + 12) {
      petBaseFloorY = petPlatform.y;
    }
    const targetPetY = Math.min(player.pos.y, petBaseFloorY);
    pet.pos.y += (targetPetY - pet.pos.y) * (1 - Math.exp(-12 * petDt));

    pet.flipX = !facingRight;
    const nextPetAnim = petSpeedX > 4 ? "walk" : "idle";
    if (pet.curAnim() !== nextPetAnim) {
      pet.play(nextPetAnim);
    }

    // Partikel sparkle kado
    sparkleTimer += dt;
    if (sparkleTimer > 0.4) {
      sparkleTimer = 0;
      spawnGiftSparkle();
    }

    // Partikel kelopak bunga sakura melayang lembut di area Taman Sakura (x: 1160 – 1400)
    sakuraPetalTimer += dt;
    if (sakuraPetalTimer > 0.16) {
      sakuraPetalTimer = 0;
      const petalX = 1160 + Math.random() * 240;
      const petalY = PEAK_FLOOR_Y - 170 + Math.random() * 60;
      const petalColor = Math.random() < 0.6 ? k.rgb(255, 192, 203) : k.rgb(255, 182, 193);
      trackVfxParticle(k.add([
        k.rect(Math.random() < 0.5 ? 2 : 1, 2),
        k.pos(petalX, petalY),
        k.color(petalColor),
        k.opacity(0.85),
        k.lifespan(3.6, { fade: 0.8 }),
        k.move(k.vec2(14 + Math.random() * 20, 22 + Math.random() * 18), 1),
        k.z(42),
      ]));
    }

    // === HUD React overlay (hanya di-emit saat lastHudKey berubah) (L1) ===
    emitHud();
  });

  if (debug) {
    k.onKeyPress("f3", () => {
      k.debug.inspect = !k.debug.inspect;
    });
  }

  // ======================= GAME CONTROLLER =======================
  return {
    destroy: () => {
      if (lastPromptWasVisible) {
        onInteractionPromptUpdate?.(null);
        lastPromptWasVisible = false;
      }
      if (lastToastWasVisible) {
        onFloatingNotificationUpdate?.(null);
        lastToastWasVisible = false;
      }
      if (comboTimer > 0) {
        onComboUpdate?.({ combo: 0, timeLeft: 0, maxTime: COMBO_WINDOW });
      }
      if (cutsceneGift) { cutsceneGift.destroy(); cutsceneGift = null; }
      if (cutsceneShadow) { cutsceneShadow.destroy(); cutsceneShadow = null; }
      if (cutscenePartner) { cutscenePartner.destroy(); cutscenePartner = null; }
      if (cutsceneEmote) { cutsceneEmote.destroy(); cutsceneEmote = null; }
      try { k.destroyAll("cutscene_actor"); } catch { /* ok */ }
      try { k.quit(); } catch { /* ok */ }
      activeVfxParticles.length = 0;
      if (activeQuit) {
        activeQuit = null;
      }
    },
    triggerInteraction: () => {
      if (canAcceptInput()) {
        edgeInput.interact = true;
      }
    },
    setInput: (action: GameInputAction, pressed: boolean) => {
      if (action === "jump") {
        if (pressed && !virtualInput.jump && canAcceptInput()) {
          edgeInput.jump = true;
        }
        virtualInput.jump = pressed;
      } else if (action === "attack") {
        if (pressed && !virtualInput.attack && canAcceptInput()) {
          edgeInput.attack = true;
        }
        virtualInput.attack = pressed;
      } else if (action === "interact") {
        if (pressed && !virtualInput.interact && canAcceptInput()) {
          edgeInput.interact = true;
        }
        virtualInput.interact = pressed;
      } else if (action === "left" || action === "right") {
        virtualInput[action] = pressed;
      }
    },
    setMuted: (m: boolean) => {
      setMuted(m);
    },
    pause: () => { isPaused = true; },
    resume: () => {
      isPaused = false;
      edgeInput.jump = false;
      edgeInput.attack = false;
      edgeInput.interact = false;
    },
    resolveChallenge: (id: string, correct: boolean, buff?: BuffType) => {
      const q = quizNpcs.find((n) => n.challenge.id === id);
      if (!q || q.resolved) return;

      q.resolved = true;
      challengesDoneCount++;

      if (correct) {
        playBuff();
        if (buff === "shield") {
          hasShield = true;
        } else if (buff === "speed") {
          speedBuffTimer = V3_CONFIG.SPEED_BUFF.duration;
        } else if (buff === "power_star") {
          starBuffTimer = V3_CONFIG.STAR_BUFF.duration;
        }
      } else {
        k.shake(V3_CONFIG.QUIZ_WRONG_FX.shake);
        const flash = k.add([
          k.rect(480, 270),
          k.pos(0, 0),
          k.color(255, 40, 40),
          k.opacity(1),
          k.lifespan(V3_CONFIG.QUIZ_WRONG_FX.flashSec, { fade: 0.1 }),
          k.fixed(),
          k.z(150),
        ]);
        void flash;
        loseHeart();
      }

      edgeInput.jump = false;
      edgeInput.attack = false;
      edgeInput.interact = false;
      isQuizPaused = false;
      emitHud();
    },
    setPrologueScene: (scene: 1 | 2 | 3) => {
      cutsceneActive = true;
      initPrologueScene(scene);
    },
    endPrologueCutscene: () => {
      cutsceneActive = false;
      if (cutsceneGift) { cutsceneGift.destroy(); cutsceneGift = null; }
      if (cutsceneShadow) { cutsceneShadow.destroy(); cutsceneShadow = null; }
      if (cutscenePartner) { cutscenePartner.destroy(); cutscenePartner = null; }
      if (cutsceneEmote) { cutsceneEmote.destroy(); cutsceneEmote = null; }
      try { k.destroyAll("cutscene_actor"); } catch { /* ok */ }
      pet.pos.y = FLOOR_Y;
      const camX = Math.round(k.clamp(player.pos.x, 240, LEVEL_WIDTH - 240));
      k.setCamPos(camX, 135);
      isPaused = false;
      edgeInput.jump = false;
      edgeInput.attack = false;
      edgeInput.interact = false;
    },
    completePartnerReunion: () => {
      isPartnerReunionActive = false;
      partnerJoined = true;
      partnerObj.flipX = false;
      edgeInput.jump = false;
      edgeInput.attack = false;
      edgeInput.interact = false;
      spawnReunionHeartEmote();
    },
    triggerDuoAttack: () => {
      executeDuoAttack();
    },
    triggerSwingAction: () => {
      if (isSittingOnSwing) {
        isSittingOnSwing = false;
        player.pos = k.vec2(1208, PEAK_FLOOR_Y);
        partnerObj.pos = k.vec2(1248, PEAK_FLOOR_Y);
        k.setCamScale(1.0);
        onSwingStateChange?.(false);
      } else if (
        (partnerJoined || isPeacefulMode) &&
        Math.abs(player.pos.x - 1228) <= 45 &&
        Math.abs(player.pos.y - PEAK_FLOOR_Y) <= 25
      ) {
        isSittingOnSwing = true;
        onSwingPromptUpdate?.(null);
        onSwingStateChange?.(true);
        player.vel = k.vec2(0, 0);
      }
    },
    enterPeacefulMode: () => {
      isPeacefulMode = true;
      isPaused = false;
      hasWon = false;
      isCelebrating = false;
      bossFightActive = false;
      bossDefeated = true;

      for (const s of slimes) { s.alive = false; try { s.obj.destroy(); } catch { /* ok */ } }
      for (const b of bats) { b.alive = false; try { b.obj.destroy(); } catch { /* ok */ } }
      for (const sk of skeletons) { sk.alive = false; try { sk.obj.destroy(); } catch { /* ok */ } }
      if (bossObj) { try { bossObj.destroy(); } catch { /* ok */ } bossObj = null; }
      if (arenaGateCollider) { try { arenaGateCollider.destroy(); } catch { /* ok */ } arenaGateCollider = null; }
      if (arenaGateVisual) { try { arenaGateVisual.destroy(); } catch { /* ok */ } arenaGateVisual = null; }
      if (giftSealDome) { try { giftSealDome.destroy(); } catch { /* ok */ } giftSealDome = null; }
      if (giftSealRing) { try { giftSealRing.destroy(); } catch { /* ok */ } giftSealRing = null; }

      player.pos = k.vec2(1245, PEAK_FLOOR_Y);
      player.vel = k.vec2(0, 0);
      partnerObj.pos = k.vec2(1270, PEAK_FLOOR_Y);
      partnerJoined = true;
      pet.pos = k.vec2(1225, PEAK_FLOOR_Y);

      currentCamY = 108;
      k.setCamScale(1.0);
      k.setCamPos(1245, 108);

      currentSkyA = 0.55;
      celebrationSakuraRainActive = true;
      onBossHpUpdate?.(0, BOSS_MAX_HP, false, false);
    },
  };
}
