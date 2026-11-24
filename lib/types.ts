export type AvatarGender = "male" | "female";

export type BuffType = "shield" | "speed" | "power_star";

export interface ChallengeItem {
  id: string;
  question: string;
  imageUrl?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  buff: BuffType;
}

export const MAX_CHALLENGES = 3;

export const BUFF_META: Record<
  BuffType,
  { emoji: string; label: string; desc: string; durationSec: number | null }
> = {
  shield: {
    emoji: "🛡️",
    label: "Perisai Hati",
    desc: "Kebal 1x sentuhan monster",
    durationSec: null,
  },
  speed: {
    emoji: "⚡",
    label: "Sepatu Kilat",
    desc: "Lari dan lompat lebih cepat 15 detik",
    durationSec: 15,
  },
  power_star: {
    emoji: "✨",
    label: "Bintang Sihir",
    desc: "Serangan jarak jauh 20 detik",
    durationSec: 20,
  },
};

export interface GiftData {
  id: string;
  receiver_name: string;
  message_text: string;
  image_url: string;
  music_url?: string;
  created_at?: string;
  avatar?: AvatarGender;
  challenges?: ChallengeItem[];
  memory_messages?: string[];
}

export interface CreateGiftPayload {
  id: string;
  receiver_name: string;
  message_text: string;
  image_url: string;
  music_url?: string;
  avatar?: AvatarGender;
  challenges?: ChallengeItem[];
  memory_messages?: string[];
}

export interface NormalizedGiftData extends GiftData {
  avatar: AvatarGender;
  challenges: ChallengeItem[];
  memory_messages?: string[];
}

// Controller & Game State types for KAPLAY integration
export type GameInputAction =
  | "left"
  | "right"
  | "jump"
  | "attack"
  | "interact";

export interface HudState {
  hp: number;
  maxHp: number;
  hasShield: boolean;
  speedLeft: number; // detik tersisa (dibulatkan ke atas), 0 = tidak aktif
  starLeft: number; // idem
  nearbyChallengeId: string | null;
  challengesDone: number;
  challengesTotal: number;
  // Field backward compatibility v2
  memoriesCollected?: number;
  totalMemories?: number;
  progressPercent?: number;
}

export type GameHudState = HudState;

export interface GameController {
  destroy: () => void;
  setInput: (action: GameInputAction, pressed: boolean) => void;
  triggerInteraction?: () => void;
  setMuted?: (muted: boolean) => void;
  pause: () => void;
  resume: () => void;
  resolveChallenge?: (id: string, correct: boolean, buff?: BuffType) => void;
  setPrologueScene?: (scene: 1 | 2 | 3) => void;
  endPrologueCutscene?: () => void;
  completePartnerReunion?: () => void;
  triggerDuoAttack?: () => void;
  triggerSwingAction?: () => void;
  enterPeacefulMode?: () => void;
}

