/**
 * sprites.ts — Procedural Pixel Art Generator & PNG Asset Pipeline
 * Sesuai spesifikasi PRD.md Bagian 4 & Bagian 6.
 * Mengonversi pixel art matrix menjadi offscreen canvas/dataURL atau memuat file PNG dari public/sprites/.
 * TANPA import React.
 */

import type { AvatarGender } from "../types";

type Palette = Record<string, string>;

/** Render pixel matrix ke offscreen canvas dan kembalikan dataURL */
function matrixToDataURL(
  matrix: string[],
  palette: Palette,
  scale: number = 1,
  outline?: string
): string {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const canvas = document.createElement("canvas");
  canvas.width = cols * scale;
  canvas.height = rows * scale;
  const ctx = canvas.getContext("2d")!;

  if (outline) {
    ctx.fillStyle = outline;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = matrix[y][x];
        if (ch === "." || ch === " " || !palette[ch]) continue;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if (ox === 0 && oy === 0) continue;
            const nx = x + ox;
            const ny = y + oy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const neighbor = matrix[ny][nx];
            if (neighbor === "." || neighbor === " " || !palette[neighbor]) {
              ctx.fillRect(nx * scale, ny * scale, scale, scale);
            }
          }
        }
      }
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = matrix[y][x];
      if (ch === "." || ch === " ") continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return canvas.toDataURL();
}


/** Helper: load image from URL or dataURL */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ======================= PALETTES =======================

const PLAYER_PALETTE: Palette = {
  H: "#8B4513",   // rambut/topi
  h: "#A0522D",   // rambut highlight
  S: "#FFD6A0",   // kulit
  s: "#FFCB8E",   // kulit shade
  E: "#1a1c2c",   // mata
  M: "#FF6B6B",   // mulut
  B: "#4A90D9",   // baju
  b: "#3A7BC8",   // baju shade
  P: "#2E5090",   // celana
  p: "#1E3A6E",   // celana shade
  K: "#8B4513",   // sepatu
  k: "#6B3410",   // sepatu shade
};

const FEMALE_PALETTE: Palette = {
  H: "#FF8C00",   // rambut oranye kemerahan
  h: "#FFA500",   // rambut highlight
  S: "#FFD6A0",   // kulit
  s: "#FFCB8E",   // kulit shade
  E: "#1a1c2c",   // mata
  M: "#FF6B6B",   // mulut
  B: "#FF69B4",   // gaun pink
  b: "#E05297",   // gaun pink shade
  P: "#FFF0F5",   // rok/kaus kaki
  p: "#FFDDEE",   // shade rok
  K: "#C71585",   // pita & sepatu
  k: "#A0106A",   // shade pita
};

const GROUND_PALETTE: Palette = {
  G: "#5DB85D",   // rumput hijau terang
  g: "#4CA84C",   // rumput medium
  d: "#3D8B3D",   // rumput gelap
  B: "#8B6914",   // tanah
  b: "#7A5A10",   // tanah shade
  r: "#9A7920",   // kerikil
  R: "#6B4A0E",   // tanah dalam
};

const PLATFORM_PALETTE: Palette = {
  W: "#A08060",   // kayu terang
  w: "#8B6B50",   // kayu medium
  D: "#705840",   // kayu gelap
  L: "#6B8E23",   // lumut
  l: "#556B2F",   // lumut gelap
  H: "#C0A070",   // highlight kayu
};

const SPIKE_PALETTE: Palette = {
  M: "#808080",   // logam
  m: "#606060",   // logam gelap
  R: "#CC3333",   // merah
  r: "#AA2222",   // merah gelap
  H: "#A0A0A0",   // highlight
  L: "#5DB85D",
  l: "#3D8B3D",
  d: "#2D6B2D",
  T: "#8B6914",
};

const GIFT_PALETTE: Palette = {
  R: "#E03131",   // merah kado
  r: "#C02020",   // merah shade
  Y: "#FFD700",   // pita kuning
  y: "#FFC000",   // pita shade
  W: "#FFFFFF",   // kilau
  H: "#FF5555",   // highlight
};

const GUIDE_PALETTE: Palette = {
  W: "#FFFFFF",   // bulu putih
  w: "#E8E8E8",   // bulu shade
  P: "#FFB6C1",   // pipi pink
  E: "#1a1c2c",   // mata
  N: "#FF9999",   // hidung
  I: "#F0F0F0",   // dalam telinga
  C: "#FFD700",   // aksesoris kamera (kuning)
  c: "#DAA520",   // aksesoris shade
};

const TREE_PALETTE: Palette = {
  L: "#4CA84C",   // daun hijau terang
  l: "#3D8B3D",   // daun hijau gelap
  d: "#2D6B2D",   // daun paling gelap
  T: "#8B6914",   // batang
  t: "#6B4A0E",   // batang gelap
  F: "#FF6B6B",   // buah
};

const SIGN_PALETTE: Palette = {
  W: "#C0A070",   // papan
  w: "#A08060",   // papan shade
  T: "#8B6914",   // tiang
  t: "#6B4A0E",   // tiang shade
  A: "#FFD700",   // panah kuning
};

const CLOUD_PALETTE: Palette = {
  W: "#FFFFFF",   // awan putih
  w: "#E8E8F0",   // awan shade
  l: "#D0D0E0",   // shadow
};

const MEMORY_PALETTE: Palette = {
  Y: "#FFD700",
  y: "#FFC000",
  W: "#FFFFFF",
  o: "#B8860B",
};

const MEMORY_STAR: string[] = [
  "...oYy...",
  "...Y.Y...",
  ".YYYYYYY.",
  ".YWWWWYW.",
  "oYWWYWWYo",
  "..YYYYY..",
  "...YYY...",
  "..YY.YY..",
];

const LANTERN_PALETTE: Palette = {
  I: "#5B4B38",
  i: "#3D3328",
  M: "#8B6914",
  m: "#6B4A0E",
  D: "#26314A",
  d: "#151B2D",
  Y: "#FFD166",
  y: "#FFB84D",
  W: "#FFF3B0",
};

const LANTERN_UNLIT: string[] = [
  "......M......",
  "......M......",
  "....MmmmM....",
  "...MIIIIIM...",
  "...IDDDDDI...",
  "...IDDdDDI...",
  "...IDDDDdI...",
  "...IDDDDDI...",
  "...IDDDDDI...",
  "....Iii iI....",
  "...IIIIIII...",
  "......M......",
  "......M......",
  "......m......",
  "......m......",
  "...mmm.mmm...",
];

const LANTERN_LIT: string[] = [
  "......M......",
  "......M......",
  "....MmmmM....",
  "...MWWWWWm...",
  "...IYyyyYI...",
  "...IYYYYYI...",
  "...IYyyyWI...",
  "...IYYYYYI...",
  "...IYYYyyI...",
  "....Iii iI....",
  "...IIIIIII...",
  "......M......",
  "......M......",
  "......m......",
  "......m......",
  "...mmm.mmm...",
];

// ======================= SPRITE DATA =======================

// --- PLAYER SPRITE (MALE) (16x16 frames, centered in 16x16) ---
const PLAYER_IDLE: string[] = [
  "....HHHh....",
  "...HHHHhh...",
  "...hHHHHh...",
  "...SSSSSS...",
  "...SEESSE...",
  "...SSMSSS...",
  "....SSSS....",
  "...BBBBBB...",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "...BBBBBB...",
  "...PPPPPP...",
  "..PPPPPPPp..",
  "..pPPPPPPp..",
  "...KK..KK...",
  "...kk..kk...",
];

const PLAYER_WALK1: string[] = [
  "....HHHh....",
  "...HHHHhh...",
  "...hHHHHh...",
  "...SSSSSS...",
  "...SEESSE...",
  "...SSMSSS...",
  "....SSSS....",
  "...BBBBBB...",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "...BBBBBB...",
  "...PPPPPP...",
  "..PPPPPPPp..",
  "..KK...pPp..",
  "..kk....KK..",
  "........kk..",
];

const PLAYER_WALK2: string[] = [
  "....HHHh....",
  "...HHHHhh...",
  "...hHHHHh...",
  "...SSSSSS...",
  "...SEESSE...",
  "...SSMSSS...",
  "....SSSS....",
  "...BBBBBB...",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "...BBBBBB...",
  "...PPPPPP...",
  "..PPPPPPPp..",
  "..pPp...KK..",
  "..KK....kk..",
  "..kk........",
];

const PLAYER_JUMP: string[] = [
  "....HHHh....",
  "...HHHHhh...",
  "...hHHHHh...",
  "...SSSSSS...",
  "...SEESSE...",
  "...SSMSSS...",
  "..S.SSSS.S..",
  "..SBBBBBBSS.",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "...BBBBBB...",
  "...PPPPPP...",
  "..PPPPPPPp..",
  "..KK...KK...",
  "..kk...kk...",
  "............",
];

// --- FEMALE PLAYER SPRITE (16x16 frames, gaun pink & rambut oranye/pita) ---
const FEMALE_IDLE: string[] = [
  "...KK..KK...",
  "..KkK..KkK..",
  "..hHHHHHhh..",
  "..hSSSSSSh..",
  "..hSEESSEh..",
  "..hSSMSSSh..",
  "...hSSSS....",
  "...BBBBBB...",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "..BBBBBBBB..",
  "..PPPPPPPP..",
  ".pPPPPPPPPp.",
  "..pPPPPPPp..",
  "...KK..KK...",
  "...kk..kk...",
];

const FEMALE_WALK1: string[] = [
  "...KK..KK...",
  "..KkK..KkK..",
  "..hHHHHHhh..",
  "..hSSSSSSh..",
  "..hSEESSEh..",
  "..hSSMSSSh..",
  "...hSSSS....",
  "...BBBBBB...",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "..BBBBBBBB..",
  "..PPPPPPPP..",
  ".pKK...PPp..",
  "..kk....KK..",
  "........KK..",
  "........kk..",
];

const FEMALE_WALK2: string[] = [
  "...KK..KK...",
  "..KkK..KkK..",
  "..hHHHHHhh..",
  "..hSSSSSSh..",
  "..hSEESSEh..",
  "..hSSMSSSh..",
  "...hSSSS....",
  "...BBBBBB...",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "..BBBBBBBB..",
  "..PPPPPPPP..",
  ".pPP...KKp..",
  "..KK....kk..",
  "..KK........",
  "..kk........",
];

const FEMALE_JUMP: string[] = [
  "...KK..KK...",
  "..KkK..KkK..",
  "..hHHHHHhh..",
  "..hSSSSSSh..",
  "..hSEESSEh..",
  "..hSSMSSSh..",
  "..S.SSSS.S..",
  "..SBBBBBBSS.",
  "..BBBBBBBb..",
  "..bBBBBBBb..",
  "..BBBBBBBB..",
  "..PPPPPPPP..",
  ".pPPPPPPPPp.",
  "..pPPPPPPp..",
  "..KK...KK...",
  "..kk...kk...",
];

// --- GROUND TILE (16x16, tileable) ---
const GROUND_TILE: string[] = [
  "GGgGGGgdGGGgGGGd",
  "gGGdGGGGgGGGdGGG",
  "GGGGgGGdGGGGGGgG",
  "BBBBBBBBBBBBBBBB",
  "BbBBBBrBBBBbBBBB",
  "BBBBbBBBBrBBBBBb",
  "BrBBBBBBBBBBrBBB",
  "BBBBBBBBBBBBBBBB",
  "BbBBrBBBBBbBBBrB",
  "BBBBBBBBBBBBBBBB",
  "BRBBBbBBBRBBBBBB",
  "BBBBBBRBBBBBBRBB",
  "BBrBBBBBBBrBBBBB",
  "BBBBBBBBBBBBBBBB",
  "BRBBBBBRBBBBBBRB",
  "RRRRRRRRRRRRRRRR",
];

// --- PLATFORM TILE (16x10) ---
const PLATFORM_TILE: string[] = [
  "LLlLLLlLLLlLLLlL",
  "HWHWHWHWHWHWHWHW",
  "WWWWWWWWWWWWWWWW",
  "WwWWWWwWWWWwWWWW",
  "WWWWwWWWWWWWWwWW",
  "wWWWWWWwWWWWWWWw",
  "WWDWWWWWWDWWWWWW",
  "DDDDDDDDDDDDDDDD",
  "DwDDDDDwDDDDDwDD",
  "DDDDDDDDDDDDDDDD",
];

// --- SPIKE (16x12) ---
const SPIKE_TILE: string[] = [
  "......L...L.....",
  "....LlL.LLlL....",
  "...LLLLLLLLLL...",
  "..lLLdddLLLdl...",
  "..lLdTLdTdLdl...",
  ".lLLTLLTLLLLdl.",
  ".lLLLTTLLLLdl..",
  ".lLdLLLLLdLLdl.",
  "lLLdLLLLLdLLLLl",
  "LLLddLLLdddLLLL",
  "lLlLLLLLLLlLLLl",
  ".lLLLLLLLLLLLl.",
];

// --- GIFT (16x16, 2 frames) ---
const GIFT_FRAME1: string[] = [
  "....YYYY....",
  "...Y.YY.Y...",
  "..RRRRRRRR..",
  ".RRRRYYRRRr.",
  ".RRRRYYRRRr.",
  ".RRRRYYRRRr.",
  ".YYYYYYYYYy.",
  ".RRRRYYRRRr.",
  ".RRRRYYRRRr.",
  ".RRRRYYRRRr.",
  ".RRRRYYRRRr.",
  ".RRRRYYRRRr.",
  ".rrrrrrrrrr.",
  "............",
  "............",
  "............",
];

const GIFT_FRAME2: string[] = [
  "..W.YYYY..W.",
  "...Y.YY.Y...",
  "W.RRRRRRRR..",
  ".RRHRYYRRRr.",
  ".RRRRYYRRRr.",
  ".RRRRYYRHRr.",
  ".YYYYYYYYYy.",
  ".RRRRYYRRRr.",
  ".RHRRYYRRRr.",
  ".RRRRYYRRRr.",
  ".RRRRYYRRHr.",
  ".RRRRYYRRRr.",
  ".rrrrrrrrrr.",
  ".........W..",
  "..W.........",
  "............",
];

// --- NPC GUIDE KUIS (16x16, 2 frames) ---
const GUIDE_FRAME1: string[] = [
  ".WW......WW.",
  ".WIW....WIW.",
  ".WIW....WIW.",
  ".WIW....WIW.",
  ".WWW....WWW.",
  "..WWWWWWWW..",
  ".WWWWWWWWWW.",
  ".WWEEWWWEWW.",
  ".WWWWNWWWWW.",
  ".WPWWWWWWPW.",
  "..WWWWWWWW..",
  "..wWWWWWWw..",
  "...CCCCCC...",
  "...cccccc...",
  "..WW....WW..",
  "..ww....ww..",
];

const GUIDE_FRAME2: string[] = [
  ".WW......WW.",
  ".WIW....WIW.",
  ".WIW....WIW.",
  ".WIW....WIW.",
  ".WWW....WWW.",
  "..WWWWWWWW..",
  ".WWWWWWWWWW.",
  ".WWEEWWWEWW.",
  ".WWWWNWWWWW.",
  ".WPWWWWWWPW.",
  "..WWWWWWWW..",
  "..wWWWWWWw..",
  "...CCCCCC...",
  "...cccccc...",
  "...WW..WW...",
  "...ww..ww...",
];

// --- BUBBLE DIALOG ICON (12x10 pixel art) ---
const BUBBLE_PALETTE: Palette = {
  W: "#FFFFFF",
  D: "#1e1629",
  y: "#ffd166",
};

const BUBBLE_SPRITE: string[] = [
  "..WWWWWWWW..",
  ".WWWWWWWWWW.",
  "WWWWWWWWWWWW",
  "WW.D..D..D.W",
  "WW.........W",
  ".WWWWWWWWWW.",
  "..WWWWWWWW..",
  "....WW......",
  "...WW.......",
  "..WW........",
];

// --- DECORATIONS ---
const TREE_SPRITE: string[] = [
  "......LLL.....",
  ".....LLLLl....",
  "....LLLLLLl...",
  "...LLLLFLLLl..",
  "..LLLLLLLLLLl.",
  "..lLLdLLLdLLl.",
  "...lLLLLLLl...",
  "....lLLLLl....",
  ".....TTT......",
  ".....TtT......",
  ".....TTT......",
  ".....TtT......",
];

const SIGN_SPRITE: string[] = [
  "..WWWWWWWW..",
  ".WwwwwwwwwW.",
  ".WwAAAAAAwW.",
  ".WwwAAAwwwW.",
  ".WwwwAwwwwW.",
  "..WWWWWWWW..",
  ".....TT.....",
  ".....Tt.....",
  ".....TT.....",
  ".....TT.....",
];

const CLOUD_SPRITE: string[] = [
  "....WWWW....",
  "..WWWWWWWW..",
  ".WWWWWWWWWw.",
  "WWWWWWWWWWWw",
  "WWWwWWWwWWWl",
  ".lllllllllll",
];

// --- HEART HUD (8x8) ---
const HEART_PALETTE: Palette = {
  R: "#FF3333",
  r: "#CC2222",
  P: "#FF6666",
  d: "#990000",
};
const HEART_FULL: string[] = [
  ".RR.RR.",
  "RPPRRPR",
  "RPRRRPR",
  "RRRRRRR",
  ".RRRRr.",
  "..Rrr..",
  "...r...",
];
const HEART_EMPTY: string[] = [
  ".dd.dd.",
  "d..dd.d",
  "d.ddd.d",
  "ddddddd",
  ".ddddd.",
  "..ddd..",
  "...d...",
];

// ======================= SPRITE_CONFIG =======================

export type SpriteKey =
  | "player"
  | "npc_guide"
  | "monster_slime"
  | "monster_bat"
  | "weapon_slash"
  | "tileset_ground"
  | "bg_sky"
  | "bg_city_mid"
  | "decor_lamp"
  | "pet"
  | "monster_skeleton"
  | "vfx_explosion"
  | "gift_chest"
  | "decor_big_tree"
  | "emote_heart"
  | "boss_dragon_idle"
  | "boss_dragon_breath"
  | "boss_dragon_tail";

export interface SpriteDef {
  file: (avatar?: AvatarGender) => string;
  sliceX: number;
  sliceY: number;
  frameW: number;
  frameH: number;
  expectedW: number;
  expectedH: number;
  facesRight?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  anims?: Record<string, any>;
}

export const SPRITE_CONFIG: Record<SpriteKey, SpriteDef> = {
  player: {
    file: (avatar) => `/sprites/${avatar === "female" ? "player_female.png" : "player_male.png"}`,
    sliceX: 6,
    sliceY: 4,
    frameW: 32,
    frameH: 24,
    expectedW: 192,
    expectedH: 96,
    anims: {
      idle: { from: 0, to: 5, loop: true, speed: 6 },
      run: { from: 6, to: 11, loop: true, speed: 10 },
      jump: { from: 12, to: 13, loop: false },
      attack: { from: 18, to: 23, loop: false, speed: 18 },
    },
  },
  npc_guide: {
    file: () => "/sprites/npc_guide.png",
    sliceX: 6,
    sliceY: 1,
    frameW: 32,
    frameH: 24,
    expectedW: 192,
    expectedH: 24,
    anims: {
      idle: { from: 0, to: 5, loop: true, speed: 4 },
    },
  },
  monster_slime: {
    file: () => "/sprites/monster_slime.png",
    sliceX: 4,
    sliceY: 1,
    frameW: 32,
    frameH: 20,
    expectedW: 128,
    expectedH: 20,
    anims: {
      walk: { from: 0, to: 3, loop: true, speed: 6 },
    },
  },
  monster_bat: {
    file: () => "/sprites/monster_bat.png",
    sliceX: 4,
    sliceY: 1,
    frameW: 32,
    frameH: 32,
    expectedW: 128,
    expectedH: 32,
    anims: {
      fly: { from: 0, to: 3, loop: true, speed: 8 },
    },
  },
  weapon_slash: {
    file: () => "/sprites/weapon_slash.png",
    sliceX: 5,
    sliceY: 1,
    frameW: 16,
    frameH: 16,
    expectedW: 80,
    expectedH: 16,
    anims: {
      slash: { from: 0, to: 3, loop: false, speed: 20 },
      star: { from: 4, to: 4 },
    },
  },
  tileset_ground: {
    file: () => "/sprites/tileset_ground.png",
    sliceX: 3,
    sliceY: 1,
    frameW: 16,
    frameH: 16,
    expectedW: 48,
    expectedH: 16,
  },
  bg_sky: {
    file: () => "/sprites/bg_sky.png",
    sliceX: 1,
    sliceY: 1,
    frameW: 320,
    frameH: 180,
    expectedW: 320,
    expectedH: 180,
  },
  bg_city_mid: {
    file: () => "/sprites/bg_city_mid.png",
    sliceX: 1,
    sliceY: 1,
    frameW: 320,
    frameH: 180,
    expectedW: 320,
    expectedH: 180,
  },
  decor_lamp: {
    file: () => "/sprites/decor_lamp.png",
    sliceX: 1,
    sliceY: 1,
    frameW: 20,
    frameH: 40,
    expectedW: 20,
    expectedH: 40,
  },
  pet: {
    file: () => "/sprites/pet.png",
    sliceX: 4,
    sliceY: 4,
    frameW: 16,
    frameH: 16,
    expectedW: 64,
    expectedH: 64,
    facesRight: true,
    anims: {
      idle: { from: 0, to: 1, loop: true, speed: 3 },
      walk: { from: 0, to: 3, loop: true, speed: 8 },
    },
  },
  monster_skeleton: {
    file: () => "/sprites/monster_skeleton.png",
    sliceX: 6,
    sliceY: 1,
    frameW: 32,
    frameH: 24,
    expectedW: 192,
    expectedH: 24,
    anims: {
      walk: { from: 0, to: 5, loop: true, speed: 6 },
    },
  },
  vfx_explosion: {
    file: () => "/sprites/vfx_explosion.png",
    sliceX: 8,
    sliceY: 1,
    frameW: 32,
    frameH: 32,
    expectedW: 256,
    expectedH: 32,
    anims: {
      explode: { from: 0, to: 7, loop: false, speed: 20 },
    },
  },
  gift_chest: {
    file: () => "/sprites/gift_chest.png",
    sliceX: 2,
    sliceY: 1,
    frameW: 16,
    frameH: 16,
    expectedW: 32,
    expectedH: 16,
    anims: {
      sparkle: { from: 0, to: 1, loop: true, speed: 2 },
    },
  },
  decor_big_tree: {
    file: () => "/sprites/decor_big_tree.png",
    sliceX: 1,
    sliceY: 1,
    frameW: 154,
    frameH: 151,
    expectedW: 154,
    expectedH: 151,
  },
  emote_heart: {
    file: () => "",
    sliceX: 1,
    sliceY: 1,
    frameW: 18,
    frameH: 18,
    expectedW: 18,
    expectedH: 18,
  },
  boss_dragon_idle: {
    file: () => "/sprites/boss_dragon_idle.png",
    sliceX: 6,
    sliceY: 1,
    frameW: 144,
    frameH: 64,
    expectedW: 864,
    expectedH: 64,
    facesRight: false,
    anims: {
      idle: { from: 0, to: 5, loop: true, speed: 6 },
      hurt: { from: 1, to: 2, loop: false, speed: 8 },
      stunned: { from: 1, to: 2, loop: true, speed: 3 },
    },
  },
  boss_dragon_breath: {
    file: () => "/sprites/boss_dragon_breath.png",
    sliceX: 7,
    sliceY: 1,
    frameW: 144,
    frameH: 64,
    expectedW: 1008,
    expectedH: 64,
    facesRight: false,
    anims: {
      breath: { from: 0, to: 6, loop: false, speed: 8 },
    },
  },
  boss_dragon_tail: {
    file: () => "/sprites/boss_dragon_tail.png",
    sliceX: 8,
    sliceY: 1,
    frameW: 144,
    frameH: 64,
    expectedW: 1152,
    expectedH: 64,
    facesRight: false,
    anims: {
      tail: { from: 0, to: 7, loop: false, speed: 9 },
    },
  },
};

// ======================= PROCEDURAL FALLBACK BUILDERS =======================

async function buildPlayerFallbackSheet(avatar: AvatarGender): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 96;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const palette = avatar === "female" ? FEMALE_PALETTE : PLAYER_PALETTE;
  const frames = avatar === "female"
    ? { idle: FEMALE_IDLE, walk1: FEMALE_WALK1, walk2: FEMALE_WALK2, jump: FEMALE_JUMP }
    : { idle: PLAYER_IDLE, walk1: PLAYER_WALK1, walk2: PLAYER_WALK2, jump: PLAYER_JUMP };

  const idleImg = await loadImage(matrixToDataURL(frames.idle, palette, 1, "#1e1629"));
  const walk1Img = await loadImage(matrixToDataURL(frames.walk1, palette, 1, "#1e1629"));
  const walk2Img = await loadImage(matrixToDataURL(frames.walk2, palette, 1, "#1e1629"));
  const jumpImg = await loadImage(matrixToDataURL(frames.jump, palette, 1, "#1e1629"));

  const drawF = (img: HTMLImageElement, col: number, row: number, offsetX = 8, offsetY = 8) => {
    ctx.drawImage(img, col * 32 + offsetX, row * 24 + offsetY);
  };

  // Row 0: Idle (frames 0..5)
  for (let c = 0; c < 6; c++) {
    drawF(idleImg, c, 0, 8, c % 2 === 1 ? 9 : 8);
  }

  // Row 1: Run (frames 6..11)
  drawF(walk1Img, 0, 1, 8, 8);
  drawF(idleImg, 1, 1, 8, 8);
  drawF(walk2Img, 2, 1, 8, 8);
  drawF(walk1Img, 3, 1, 8, 8);
  drawF(idleImg, 4, 1, 8, 8);
  drawF(walk2Img, 5, 1, 8, 8);

  // Row 2: Jump (frames 12..13)
  drawF(jumpImg, 0, 2, 8, 7);
  drawF(jumpImg, 1, 2, 8, 8);

  // Row 3: Attack (frames 18..23)
  for (let c = 0; c < 6; c++) {
    drawF(c < 3 ? jumpImg : idleImg, c, 3, 8 + (c % 2), 8);
  }

  return canvas.toDataURL();
}


async function buildNpcFallbackSheet(): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 24;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const guide1 = await loadImage(matrixToDataURL(GUIDE_FRAME1, GUIDE_PALETTE, 1, "#1e1629"));
  const guide2 = await loadImage(matrixToDataURL(GUIDE_FRAME2, GUIDE_PALETTE, 1, "#1e1629"));

  for (let c = 0; c < 6; c++) {
    ctx.drawImage(c % 2 === 0 ? guide1 : guide2, c * 32 + 10, 8);
  }

  return canvas.toDataURL();
}


function buildSlimeFallbackSheet(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 20;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const slimeF1 = [
    "................",
    ".....GGGG.......",
    "....GggggG......",
    "...GggEgggG.....",
    "..GgggEggggG....",
    "..GggggggggG....",
    ".GggggggggggG...",
    ".GggggggggggG...",
    ".GggEEggEEggG...",
    ".GggggggggggG...",
    ".GgDDDDDDDDgG...",
    "..GGGGGGGGGG....",
  ];
  const slimeF2 = [
    "................",
    "................",
    ".....GGGG.......",
    "....GggggG......",
    "...GggEgggG.....",
    "..GggggggggG....",
    ".GggggggggggG...",
    "GggggggggggggG..",
    "GggEEggggEEggG..",
    "GggggggggggggG..",
    "GggDDDDDDDDggG..",
    ".GGGGGGGGGGGG...",
  ];
  const palette: Palette = {
    G: "#1b4d1b",
    g: "#44bd32",
    E: "#ffffff",
    D: "#27ae60",
  };

  const c1 = matrixToDataURL(slimeF1, palette, 1);
  const c2 = matrixToDataURL(slimeF2, palette, 1);

  const img1 = new Image();
  img1.src = c1;
  const img2 = new Image();
  img2.src = c2;

  ctx.drawImage(img1, 0 * 32 + 8, 8);
  ctx.drawImage(img2, 1 * 32 + 8, 8);
  ctx.drawImage(img1, 2 * 32 + 8, 8);
  ctx.drawImage(img2, 3 * 32 + 8, 8);

  return canvas.toDataURL();
}


function buildBatFallbackSheet(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const batF1 = [
    "................",
    "..B..........B..",
    ".BB..........BB.",
    ".BbB..B..B..BbB.",
    ".BbbBBbbBBbbBbB.",
    "..BbbbEEEEbbBb..",
    "...BbbbRRbbBb...",
    "....BbbbbbbB....",
    ".....BbbbbB.....",
    "......BbbB......",
    ".......BB.......",
  ];
  const batF2 = [
    "................",
    "......B..B......",
    ".....BBbbBB.....",
    "....BbbEEEEbB...",
    "..BBBbbbRRbbBBB.",
    ".BbbbBbbbbBbbbb.",
    ".Bbb..BbbB..bbB.",
    "..B....BB....B..",
    "................",
    "................",
    "................",
  ];
  const palette: Palette = {
    B: "#1e1629",
    b: "#6c5ce7",
    E: "#a29bfe",
    R: "#ff7675",
  };

  const img1 = new Image();
  img1.src = matrixToDataURL(batF1, palette, 1);
  const img2 = new Image();
  img2.src = matrixToDataURL(batF2, palette, 1);

  ctx.drawImage(img1, 0 * 32 + 8, 10);
  ctx.drawImage(img2, 1 * 32 + 8, 10);
  ctx.drawImage(img1, 2 * 32 + 8, 10);
  ctx.drawImage(img2, 3 * 32 + 8, 10);

  return canvas.toDataURL();
}


function buildLampFallback(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 20;
  canvas.height = 40;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  // Tiang
  ctx.fillStyle = "#2a2f33";
  ctx.fillRect(8, 12, 4, 28);
  // Lentera
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(5, 4, 10, 8);
  // Top cap
  ctx.fillStyle = "#383d45";
  ctx.fillRect(4, 2, 12, 3);

  return canvas.toDataURL();
}

const SAKURA_PALETTE: Palette = {
  L: "#ffc2d1",   // kelopak sakura terang
  l: "#ff85a2",   // kelopak sakura medium
  d: "#d94f70",   // kelopak sakura gelap
  T: "#7e482b",   // batang pohon
  t: "#5e3020",   // bayangan batang
  F: "#ffeef2",   // kuncup bunga
};

function buildBigTreeFallback(): string {
  return matrixToDataURL(TREE_SPRITE, SAKURA_PALETTE, 12, "#1e1629");
}

function drawProceduralDragon(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  frameType: "idle" | "breath" | "tail",
  f: number
) {
  // Tubuh Naga Merah Crimson
  ctx.fillStyle = "#520c1e";
  ctx.fillRect(ox + 10, oy + 12, 38, 30);
  ctx.fillStyle = "#6b1316";
  ctx.fillRect(ox + 14, oy + 16, 30, 24);

  // Sayap Naga Merah
  ctx.fillStyle = "#370e24";
  ctx.beginPath();
  ctx.moveTo(ox + 42, oy + 18);
  ctx.lineTo(ox + 60, oy - 4);
  ctx.lineTo(ox + 32, oy + 8);
  ctx.closePath();
  ctx.fill();

  // Ekor Naga Melengkung
  ctx.fillStyle = "#520c1e";
  if (frameType === "tail") {
    const tailOff = Math.sin(f) * 8;
    ctx.fillRect(ox + 46, oy + 26 + tailOff, 22, 8);
    ctx.fillRect(ox + 68, oy + 20 + tailOff, 8, 10);
  } else {
    ctx.fillRect(ox + 46, oy + 26, 18, 8);
    ctx.fillRect(ox + 60, oy + 22, 6, 8);
  }

  // Leher & Kepala Naga (menghadap ke kiri)
  ctx.fillStyle = "#6b1316";
  ctx.fillRect(ox, oy + 8, 16, 20);
  ctx.fillStyle = "#a32515";
  ctx.fillRect(ox - 4, oy + 12, 12, 14);

  // Tanduk Emas & Mata Naga Menyala
  ctx.fillStyle = "#ff8d07";
  ctx.fillRect(ox + 6, oy + 2, 4, 8);
  ctx.fillStyle = "#ffd685";
  ctx.fillRect(ox - 1, oy + 13, 3, 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(ox - 1, oy + 14, 1, 1);

  // Kaki & Cakar Naga (Menjejak di y = 60..63)
  ctx.fillStyle = "#370e24";
  ctx.fillRect(ox + 12, oy + 38, 8, 8);
  ctx.fillRect(ox + 34, oy + 38, 8, 8);
  ctx.fillStyle = "#ffd685";
  ctx.fillRect(ox + 10, oy + 44, 4, 2);
  ctx.fillRect(ox + 32, oy + 44, 4, 2);

  // Semburan Api untuk Breath
  if (frameType === "breath" && f >= 2) {
    const blastLen = (f - 1) * 10;
    ctx.fillStyle = "#f24a02";
    ctx.fillRect(ox - 6 - blastLen, oy + 14, blastLen, 12);
    ctx.fillStyle = "#ff8d07";
    ctx.fillRect(ox - 4 - blastLen, oy + 16, blastLen - 2, 8);
    ctx.fillStyle = "#ffd685";
    ctx.fillRect(ox - 2 - blastLen, oy + 18, blastLen - 4, 4);
  }
}

function buildBossDragonIdleFallback(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 864; // 6 frames * 144 px
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  for (let f = 0; f < 6; f++) {
    drawProceduralDragon(ctx, f * 144 + 65, 18, "idle", f);
  }
  return canvas.toDataURL();
}

function buildBossDragonBreathFallback(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1008; // 7 frames * 144 px
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  for (let f = 0; f < 7; f++) {
    drawProceduralDragon(ctx, f * 144 + 65, 18, "breath", f);
  }
  return canvas.toDataURL();
}

function buildBossDragonTailFallback(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1152; // 8 frames * 144 px
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  for (let f = 0; f < 8; f++) {
    drawProceduralDragon(ctx, f * 144 + 65, 18, "tail", f);
  }
  return canvas.toDataURL();
}

const EMOTE_HEART_MATRIX: string[] = [
  ".........",
  "..RR.RR..",
  ".RPPRRPR.",
  ".RPRRRPR.",
  ".RRRRRRR.",
  "..RRRRr..",
  "...Rrr...",
  "....r....",
  ".........",
];

function buildEmoteHeart(): string {
  return matrixToDataURL(EMOTE_HEART_MATRIX, HEART_PALETTE, 2, "#200510");
}


function buildCityFarFallback(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#201834";
  ctx.fillRect(20, 90, 35, 90);
  ctx.fillRect(70, 75, 40, 105);
  ctx.fillRect(125, 105, 30, 75);
  ctx.fillRect(170, 65, 50, 115);
  ctx.fillRect(235, 85, 45, 95);
  ctx.fillRect(295, 100, 25, 80);

  return canvas.toDataURL();
}


function buildCityMidFallback(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#181226";
  ctx.fillRect(0, 110, 45, 70);
  ctx.fillRect(55, 95, 55, 85);
  ctx.fillRect(120, 120, 40, 60);
  ctx.fillRect(175, 85, 60, 95);
  ctx.fillRect(250, 105, 50, 75);

  return canvas.toDataURL();
}


function buildWeaponFallbackSheet(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 80;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const slashFrames = [
    [
      "................",
      ".......WW.......",
      "......WwwW......",
      ".....WwwwwW.....",
      "......WwwW......",
      ".......WW.......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
    [
      ".........WW.....",
      ".......WWwwW....",
      ".....WWwwwwW....",
      "....WwwwwwwW....",
      "....WwwwwW......",
      ".....WWWW.......",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
    [
      "...........WW...",
      ".........WWwwW..",
      ".......WWwwwwW..",
      ".....WWwwwwwW...",
      "...WWwwwwwWW....",
      "..WwwwwwWW......",
      "..WwwwWW........",
      "...WWW..........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
    [
      ".............WW.",
      "...........WWwwW",
      ".........WWwwwwW",
      ".......WWwwwwWW.",
      ".....WWwwwwWW...",
      "...WWwwwwWW.....",
      "..WwwwwWW.......",
      "..WwwWW.........",
      "...WW...........",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  ];

  const starFrame = [
    ".......YY.......",
    "......YYYY......",
    "....YYYYYYYY....",
    "...YYYYYYYYYY...",
    "..YYYYWWWWYYYY..",
    ".YYYYWWWWWWYYYY.",
    "YYYYWWWWWWWWYYYY",
    "....YYYYYYYY....",
    "....YYYYYYYY....",
    "YYYYWWWWWWWWYYYY",
    ".YYYYWWWWWWYYYY.",
    "..YYYYWWWWYYYY..",
    "...YYYYYYYYYY...",
    "....YYYYYYYY....",
    "......YYYY......",
    ".......YY.......",
  ];

  const slashPalette: Palette = { W: "#ffffff", w: "#dfe6e9" };
  const starPalette: Palette = { Y: "#ffd700", W: "#ffffff" };

  for (let i = 0; i < 4; i++) {
    const img = new Image();
    img.src = matrixToDataURL(slashFrames[i], slashPalette, 1);
    ctx.drawImage(img, i * 16, 0);
  }
  const starImg = new Image();
  starImg.src = matrixToDataURL(starFrame, starPalette, 1);
  ctx.drawImage(starImg, 4 * 16, 0);

  return canvas.toDataURL();
}


function buildGroundTilesetFallbackSheet(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const topImg = new Image();
  topImg.src = matrixToDataURL(GROUND_TILE, GROUND_PALETTE, 1);
  const platImg = new Image();
  platImg.src = matrixToDataURL(PLATFORM_TILE, PLATFORM_PALETTE, 1);

  ctx.drawImage(topImg, 0, 0);
  // Ground fill
  ctx.fillStyle = "#6B4A0E";
  ctx.fillRect(16, 0, 16, 16);
  ctx.fillStyle = "#8B6914";
  ctx.fillRect(18, 2, 4, 3);
  ctx.fillRect(26, 8, 3, 4);

  // Platform
  ctx.drawImage(platImg, 32, 0);

  return canvas.toDataURL();
}


function buildSkyFallback(): string {
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 320;
  skyCanvas.height = 180;
  const skyCtx = skyCanvas.getContext("2d")!;
  const skyGradient = skyCtx.createLinearGradient(0, 0, 0, 180);
  skyGradient.addColorStop(0, "#181534");   // Deep twilight indigo
  skyGradient.addColorStop(0.35, "#3d2b56"); // Warm dusk purple
  skyGradient.addColorStop(0.68, "#c85a53"); // Cozy sunset rose
  skyGradient.addColorStop(1, "#f9ca68");   // Warm horizon golden glow
  skyCtx.fillStyle = skyGradient;
  skyCtx.fillRect(0, 0, 320, 180);
  return skyCanvas.toDataURL();
}

function buildPetFallbackSheet(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  // 4x4 frames of 16x16
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const ox = col * 16;
      const oy = row * 16;
      // Badan ayam putih
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(ox + 4, oy + 5, 8, 7);
      ctx.fillStyle = "#1e1629";
      ctx.strokeRect(ox + 3.5, oy + 4.5, 9, 8);
      // Jengger merah
      ctx.fillStyle = "#e03131";
      ctx.fillRect(ox + 6, oy + 3, 3, 2);
      // Paruh kuning
      ctx.fillStyle = "#f59f00";
      ctx.fillRect(ox + 10, oy + 7, 2, 2);
      // Mata
      ctx.fillStyle = "#1e1629";
      ctx.fillRect(ox + 8, oy + 6, 1, 1);
      // Kaki
      ctx.fillStyle = "#f59f00";
      const hop = col % 2 === 0 ? 0 : 1;
      ctx.fillRect(ox + 5, oy + 12 - hop, 2, 2);
      ctx.fillRect(ox + 8, oy + 12 + hop, 2, 2);
    }
  }
  return canvas.toDataURL();
}


export interface SpriteLoaderCtx {
  loadSprite: (id: string, src: string) => unknown;
}

function buildSkeletonFallbackSheet(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 24;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  for (let c = 0; c < 6; c++) {
    const ox = c * 32 + 10;
    // Skull
    ctx.fillStyle = "#dfe6e9";
    ctx.fillRect(ox + 3, 2, 6, 6);
    // Eye sockets
    ctx.fillStyle = "#1e272e";
    ctx.fillRect(ox + 4, 4, 1, 1);
    ctx.fillRect(ox + 7, 4, 1, 1);
    // Ribs & spine
    ctx.fillStyle = "#b2bec3";
    ctx.fillRect(ox + 5, 8, 2, 7);
    ctx.fillRect(ox + 3, 10, 6, 1);
    ctx.fillRect(ox + 4, 12, 4, 1);
    // Legs
    const bob = c % 2 === 0 ? 0 : 1;
    ctx.fillRect(ox + 3, 15, 2, 7 - bob);
    ctx.fillRect(ox + 7, 15, 2, 7 + bob);
  }
  return canvas.toDataURL();
}


function buildExplosionFallbackSheet(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  for (let c = 0; c < 8; c++) {
    const cx = c * 32 + 16;
    const cy = 16;
    const r = (c + 1) * 1.8;
    ctx.fillStyle = c < 4 ? "#ffeaa7" : "#fdcb6e";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, r - 3), 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas.toDataURL();
}


async function buildGiftChestFallbackSheet(): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const g1 = await loadImage(matrixToDataURL(GIFT_FRAME1, GIFT_PALETTE, 1));
  const g2 = await loadImage(matrixToDataURL(GIFT_FRAME2, GIFT_PALETTE, 1));
  ctx.drawImage(g1, 2, 0);
  ctx.drawImage(g2, 18, 0);
  return canvas.toDataURL();
}


// ======================= PREFLIGHT & ASSET LOADER =======================

/** Preflight periksa keberadaan dan ukuran file PNG dengan timeout 4 detik */
async function preflightImage(
  url: string,
  expectedW: number,
  expectedH: number
): Promise<{ valid: boolean; img?: HTMLImageElement }> {
  return new Promise((resolve) => {
    let resolved = false;
    const img = new Image();

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ valid: false });
      }
    }, 4000);

    img.onload = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      if (img.naturalWidth === expectedW && img.naturalHeight === expectedH) {
        resolve({ valid: true, img });
      } else {
        console.warn(
          `[SpritePreflight] ${url} ukuran salah: didapat ${img.naturalWidth}x${img.naturalHeight}, diharapkan ${expectedW}x${expectedH}`
        );
        resolve({ valid: false });
      }
    };

    img.onerror = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      resolve({ valid: false });
    };

    img.src = url;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KCtx = any;

/**
 * registerSprites(k, avatar): Muat semua sprite PNG dengan fallback otomatis
 * Sesuai algoritma loader persis di PRD.md Bagian 4 & Bagian 6.
 */
export async function registerSprites(
  k: KCtx,
  avatar: AvatarGender = "male",
  onProgress?: (percent: number) => void
): Promise<Record<SpriteKey, "png" | "fallback">> {
  const results: Partial<Record<SpriteKey, "png" | "fallback">> = {};
  onProgress?.(8);

  // Preflight paralel untuk SEMUA aset sekaligus dengan anggaran waktu 4 detik (C5)
  const keys: SpriteKey[] = [
    "player",
    "npc_guide",
    "monster_slime",
    "monster_bat",
    "weapon_slash",
    "tileset_ground",
    "bg_sky",
    "bg_city_mid",
    "decor_lamp",
    "pet",
    "monster_skeleton",
    "vfx_explosion",
    "gift_chest",
    "decor_big_tree",
    "emote_heart",
    "boss_dragon_idle",
    "boss_dragon_breath",
    "boss_dragon_tail",
  ];

  const totalAssets = keys.length + 4; // 18 sprite keys + 3 tiles + 1 partner = 22
  let completedAssets = 0;
  const notifyAssetDone = () => {
    completedAssets++;
    const pct = Math.min(90, Math.round(8 + (completedAssets / totalAssets) * 82));
    onProgress?.(pct);
  };

  const loadPromises: Promise<unknown>[] = [];
  const safeLoad = (name: string, src: string, opt?: unknown) => {
    try {
      const res = k.loadSprite(name, src, opt);
      if (res && typeof res.then === "function") {
        loadPromises.push(res);
      }
    } catch {
      // Abaikan jika pemuatan sprite gagal
    }
  };

  // Muat sprite dasar non-configurable yang selalu prosedural v2 (bintang kenangan, lentera, emote hati)
  safeLoad("memory_star", matrixToDataURL(MEMORY_STAR, MEMORY_PALETTE, 1, "#1e1629"));
  safeLoad("lantern_unlit", matrixToDataURL(LANTERN_UNLIT, LANTERN_PALETTE));
  safeLoad("lantern_lit", matrixToDataURL(LANTERN_LIT, LANTERN_PALETTE));
  safeLoad("emote_heart", buildEmoteHeart());

  // Gift strip
  const giftFrames = [GIFT_FRAME1, GIFT_FRAME2];
  const giftStrip = document.createElement("canvas");
  giftStrip.width = 12 * 2;
  giftStrip.height = 16;
  const giftCtx = giftStrip.getContext("2d")!;
  for (let i = 0; i < 2; i++) {
    const gImg = await loadImage(matrixToDataURL(giftFrames[i], GIFT_PALETTE));
    giftCtx.drawImage(gImg, i * 12, 0);
  }
  safeLoad("gift", giftStrip.toDataURL(), {
    sliceX: 2,
    anims: { sparkle: { from: 0, to: 1, loop: true, speed: 3 } },
  });

  const [
    preflightResults,
    groundPre,
    platPre,
    wallPre,
  ] = await Promise.all([
    Promise.all(
      keys.map(async (key) => {
        const def = SPRITE_CONFIG[key];
        const url = def.file(avatar);
        const pre = await preflightImage(url, def.expectedW, def.expectedH);
        notifyAssetDone();
        return { key, pre, url, def };
      })
    ),
    preflightImage("/sprites/ground.png", 16, 16).then((res) => { notifyAssetDone(); return res; }),
    preflightImage("/sprites/platform.png", 16, 16).then((res) => { notifyAssetDone(); return res; }),
    preflightImage("/sprites/building_wall.png", 16, 16).then((res) => { notifyAssetDone(); return res; }),
  ]);

  for (const item of preflightResults) {
    const { key, pre, url, def } = item;
    if (pre.valid) {
      results[key] = "png";
      safeLoad(key, url, {
        sliceX: def.sliceX,
        sliceY: def.sliceY,
        anims: def.anims,
      });
    } else {
      results[key] = "fallback";
      let fallbackDataUrl = "";
      switch (key) {
        case "player":
          fallbackDataUrl = await buildPlayerFallbackSheet(avatar);
          break;
        case "npc_guide":
          fallbackDataUrl = await buildNpcFallbackSheet();
          break;
        case "monster_slime":
          fallbackDataUrl = buildSlimeFallbackSheet();
          break;
        case "monster_bat":
          fallbackDataUrl = buildBatFallbackSheet();
          break;
        case "weapon_slash":
          fallbackDataUrl = buildWeaponFallbackSheet();
          break;
        case "tileset_ground":
          fallbackDataUrl = buildGroundTilesetFallbackSheet();
          break;
        case "bg_sky":
          fallbackDataUrl = buildSkyFallback();
          break;
        case "bg_city_mid":
          fallbackDataUrl = buildCityMidFallback();
          break;
        case "decor_lamp":
          fallbackDataUrl = buildLampFallback();
          break;
        case "pet":
          fallbackDataUrl = buildPetFallbackSheet();
          break;
        case "monster_skeleton":
          fallbackDataUrl = buildSkeletonFallbackSheet();
          break;
        case "vfx_explosion":
          fallbackDataUrl = buildExplosionFallbackSheet();
          break;
        case "gift_chest":
          fallbackDataUrl = await buildGiftChestFallbackSheet();
          break;
        case "decor_big_tree":
          fallbackDataUrl = buildBigTreeFallback();
          break;
        case "emote_heart":
          fallbackDataUrl = buildEmoteHeart();
          break;
        case "boss_dragon_idle":
          fallbackDataUrl = buildBossDragonIdleFallback();
          break;
        case "boss_dragon_breath":
          fallbackDataUrl = buildBossDragonBreathFallback();
          break;
        case "boss_dragon_tail":
          fallbackDataUrl = buildBossDragonTailFallback();
          break;
      }

      safeLoad(key, fallbackDataUrl, {
        sliceX: def.sliceX,
        sliceY: def.sliceY,
        anims: def.anims,
      });
    }
  }

  // Juga muat langit v2 sebagai sky_gradient jika belum ada
  safeLoad("sky_gradient", buildSkyFallback());

  // Ground & platform 16-bit tiles dengan fallback aman
  if (groundPre.valid) {
    safeLoad("ground", "/sprites/ground.png");
  } else {
    safeLoad("ground", matrixToDataURL(GROUND_TILE, GROUND_PALETTE));
  }

  if (platPre.valid) {
    safeLoad("platform", "/sprites/platform.png");
  } else {
    safeLoad("platform", matrixToDataURL(PLATFORM_TILE, PLATFORM_PALETTE));
  }

  if (wallPre.valid) {
    safeLoad("building_wall", "/sprites/building_wall.png");
  } else {
    safeLoad("building_wall", matrixToDataURL(GROUND_TILE, GROUND_PALETTE));
  }

  // Muat sprite partner (kebalikan gender pemain) untuk cutscene prolog & co-op
  const partnerGender: AvatarGender = avatar === "female" ? "male" : "female";
  const partnerUrl = SPRITE_CONFIG.player.file(partnerGender);
  const partnerPre = await preflightImage(
    partnerUrl,
    SPRITE_CONFIG.player.expectedW,
    SPRITE_CONFIG.player.expectedH
  );
  notifyAssetDone();
  if (partnerPre.valid) {
    safeLoad("partner", partnerUrl, {
      sliceX: SPRITE_CONFIG.player.sliceX,
      sliceY: SPRITE_CONFIG.player.sliceY,
      anims: SPRITE_CONFIG.player.anims,
    });
  } else {
    const partnerFallback = await buildPlayerFallbackSheet(partnerGender);
    safeLoad("partner", partnerFallback, {
      sliceX: SPRITE_CONFIG.player.sliceX,
      sliceY: SPRITE_CONFIG.player.sliceY,
      anims: SPRITE_CONFIG.player.anims,
    });
  }

  // Tunggu semua aset k.loadSprite selesai dimuat (C5)
  await Promise.all(loadPromises);
  onProgress?.(95);
  await new Promise<void>((resolve) => {
    if (typeof k.onLoad === "function") {
      k.onLoad(() => resolve());
    } else {
      resolve();
    }
  });
  onProgress?.(100);

  if (process.env.NODE_ENV === "development") {
    console.info("[SpriteLoader] Hasil Pemuatan Aset:", results);
  }

  return results as Record<SpriteKey, "png" | "fallback">;
}

/** Wrapper kompatibilitas untuk createGame v2 */
export async function loadAllSprites(
  k: KCtx,
  avatar: AvatarGender = "male",
  onProgress?: (percent: number) => void
): Promise<void> {
  await registerSprites(k, avatar, onProgress);
}

/**
 * Render preview avatar (16-bit 32x24 pada kanvas 32x32) ke kanvas HTML elemen.
 * Menampilkan frame idle pertama dari PNG (bila ada) atau fallback prosedural.
 */
export async function drawAvatarPreview(
  canvas: HTMLCanvasElement,
  gender: AvatarGender
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const url = SPRITE_CONFIG.player.file(gender);
  const pre = await preflightImage(url, 192, 96);

  canvas.width = 32;
  canvas.height = 32;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 32, 32);

  if (pre.valid && pre.img) {
    // Frame 0 idle dari player sheet (32x24), menapak rapi di tengah-bawah kanvas
    ctx.drawImage(pre.img, 0, 0, 32, 24, 0, 4, 32, 24);
  } else {
    const palette = gender === "female" ? FEMALE_PALETTE : PLAYER_PALETTE;
    const idleMatrix = gender === "female" ? FEMALE_IDLE : PLAYER_IDLE;
    const dataUrl = matrixToDataURL(idleMatrix, palette, 2, "#1e1629");
    const img = await loadImage(dataUrl);
    ctx.drawImage(img, (32 - img.width) / 2, (32 - img.height) / 2);
  }
}
