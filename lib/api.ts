import {
  GiftData,
  CreateGiftPayload,
  NormalizedGiftData,
  AvatarGender,
  ChallengeItem,
  MAX_CHALLENGES,
  BUFF_META,
  HudState,
  GameHudState,
  GameController,
} from "./types";
import { DEV_FIXTURES, DEMO_FIXTURES } from "./devFixtures";
import { validateImageUrl, validateMusicUrl } from "./validate";

export type {
  GiftData,
  CreateGiftPayload,
  NormalizedGiftData,
  HudState,
  GameHudState,
  GameController,
};
export { MAX_CHALLENGES, BUFF_META };

export interface ApiResponse<T = unknown> {
  status: "success" | "error" | "not_found";
  message?: string;
  id?: string;
  data?: T;
}

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

/** Normalisasi data kado dari server agar backward-compatible dengan link v1/v2 */
export function normalizeGiftData(raw: Partial<GiftData>): NormalizedGiftData {
  let avatar: AvatarGender = "male";
  if (raw.avatar === "male" || raw.avatar === "female") {
    avatar = raw.avatar;
  }

  let challenges: ChallengeItem[] = [];
  if (Array.isArray(raw.challenges)) {
    challenges = raw.challenges
      .filter((item): item is ChallengeItem => {
        if (!item || typeof item !== "object") return false;
        if (typeof item.question !== "string" || !item.question.trim()) return false;
        if (!Array.isArray(item.options) || item.options.length !== 4) return false;
        if (!item.options.every((opt) => typeof opt === "string" && opt.trim())) return false;
        if (![0, 1, 2, 3].includes(item.correctIndex)) return false;
        if (!["shield", "speed", "power_star"].includes(item.buff)) return false;
        return true;
      })
      .slice(0, MAX_CHALLENGES)
      .map((item, idx) => ({
        id: item.id || `chal_${idx + 1}`,
        question: item.question.trim().slice(0, 140),
        imageUrl:
          typeof item.imageUrl === "string" && item.imageUrl.trim().startsWith("https://")
            ? item.imageUrl.trim()
            : undefined,
        options: [
          String(item.options[0]).trim().slice(0, 60),
          String(item.options[1]).trim().slice(0, 60),
          String(item.options[2]).trim().slice(0, 60),
          String(item.options[3]).trim().slice(0, 60),
        ] as [string, string, string, string],
        correctIndex: item.correctIndex as 0 | 1 | 2 | 3,
        buff: item.buff as ChallengeItem["buff"],
      }));
  }

  const rawImg = typeof raw.image_url === "string" ? raw.image_url.trim() : "";
  const finalImageUrl = validateImageUrl(rawImg) ? rawImg : "";

  let finalMusicUrl: string | undefined = undefined;
  if (typeof raw.music_url === "string" && raw.music_url.trim()) {
    const musicTrim = raw.music_url.trim();
    if (validateMusicUrl(musicTrim).isValid) {
      finalMusicUrl = musicTrim;
    }
  }

  let memory_messages: string[] | undefined = undefined;
  if (Array.isArray(raw.memory_messages)) {
    memory_messages = raw.memory_messages
      .filter((m): m is string => typeof m === "string")
      .slice(0, 4)
      .map((m) => m.trim().slice(0, 40));
  }

  return {
    id: raw.id || "",
    receiver_name: raw.receiver_name || "",
    message_text: raw.message_text || "",
    image_url: finalImageUrl,
    music_url: finalMusicUrl,
    created_at: raw.created_at || undefined,
    avatar,
    challenges,
    memory_messages,
  };
}

export async function createGift(payload: CreateGiftPayload): Promise<string> {
  if (!GAS_URL || GAS_URL.includes("YOUR_GAS_DEPLOYMENT_ID")) {
    throw new Error(
      "URL Google Apps Script belum dikonfigurasi. Periksa file .env.local"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik

  try {
    // PENTING: GAS tidak menangani preflight CORS OPTIONS.
    // Gunakan 'text/plain;charset=utf-8' agar browser mengirim Simple Request (no preflight).
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gagal menghubungi server GAS (${response.status})`);
    }

    const text = await response.text();
    let result: ApiResponse;
    try {
      result = JSON.parse(text) as ApiResponse;
    } catch {
      throw new Error("Server sedang sibuk, coba lagi.");
    }

    if (result.status === "success" && result.id) {
      return result.id;
    }

    // Idempoten: bila GAS membalas "ID sudah dipakai" untuk id yang sama, anggap sukses
    if (result.status === "error" && result.message === "ID sudah dipakai") {
      return payload.id;
    }

    throw new Error(result.message || "Gagal menyimpan kado.");
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Penyimpanan kado melebihi batas waktu (timeout). Silakan coba lagi.");
      }
      throw err;
    }
    throw new Error("Server sedang sibuk, coba lagi.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchGift(id: string): Promise<GiftData> {
  // Jalur demo publik (tersedia di mode development maupun production)
  if (id.startsWith("demo-")) {
    const fixture = DEMO_FIXTURES[id];
    if (fixture) {
      return normalizeGiftData(fixture);
    }
  }

  // Jalur dev fixtures khusus mode development
  if (process.env.NODE_ENV === "development" && id.startsWith("dev-")) {
    const fixture = DEV_FIXTURES[id];
    if (fixture) {
      return normalizeGiftData(fixture);
    }
  }

  if (!GAS_URL || GAS_URL.includes("YOUR_GAS_DEPLOYMENT_ID")) {
    throw new Error(
      "URL Google Apps Script belum dikonfigurasi. Periksa file .env.local"
    );
  }

  // Cek cache di sessionStorage untuk meminimalkan beban GAS
  const cacheKey = `gift_${id}`;
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return normalizeGiftData(JSON.parse(cached));
      }
    } catch {
      // Abaikan jika sessionStorage error
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik

  try {
    const url = `${GAS_URL}?id=${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data kado");
    }

    const text = await response.text();
    let result: ApiResponse<Partial<GiftData>>;
    try {
      result = JSON.parse(text) as ApiResponse<Partial<GiftData>>;
    } catch {
      throw new Error("Server sedang sibuk, coba lagi.");
    }

    if (result.status === "success" && result.data) {
      const normalized = normalizeGiftData(result.data);
      // Simpan ke cache
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
        } catch {
          // Abaikan
        }
      }
      return normalized;
    }

    throw new Error(result.message || "Kado tidak ditemukan atau telah kedaluwarsa.");
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Pengambilan kado melebihi batas waktu (timeout). Silakan periksa koneksi.");
      }
      throw err;
    }
    throw new Error("Server sedang sibuk, coba lagi.");
  } finally {
    clearTimeout(timeoutId);
  }
}
