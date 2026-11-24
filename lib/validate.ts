import { ChallengeItem, BuffType } from "./types";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateReceiverName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: "Nama penerima wajib diisi" };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: "Nama penerima maksimal 50 karakter" };
  }
  return { isValid: true };
}

export function validateMessageText(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isValid: false, error: "Pesan kado wajib diisi" };
  }
  if (trimmed.length > 500) {
    return { isValid: false, error: "Pesan kado maksimal 500 karakter" };
  }
  return { isValid: true };
}

export function validateImageFile(file: File | null): ValidationResult {
  if (!file) {
    return { isValid: false, error: "Foto kado wajib diunggah" };
  }
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: "Format foto harus JPG, PNG, atau WebP" };
  }
  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxBytes) {
    return { isValid: false, error: "Ukuran foto maksimal 10 MB" };
  }
  return { isValid: true };
}

export function validateImageUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith("https://i.ibb.co/") || url.startsWith("https://images.unsplash.com/");
}

export function validateMusicUrl(url: string): ValidationResult {
  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: true }; // Opsional
  }

  // Izinkan Preset BGM 8-bit bawaan
  if (trimmed.startsWith("preset:")) {
    const validPresets = ["preset:cozy", "preset:happy", "preset:romantic"];
    if (validPresets.includes(trimmed)) {
      return { isValid: true };
    }
    return { isValid: false, error: "Preset musik tidak valid" };
  }

  // Tolak skema tidak aman
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) {
    return { isValid: false, error: "URL musik tidak valid" };
  }

  if (!trimmed.startsWith("https://")) {
    return { isValid: false, error: "URL musik harus diawali https:// atau pilih preset" };
  }

  const cleanUrl = trimmed.split("?")[0].toLowerCase();
  if (!cleanUrl.endsWith(".mp3")) {
    return { isValid: false, error: "URL musik harus berakhiran .mp3 langsung" };
  }

  return { isValid: true };
}

export function validateAvatar(avatar?: string): ValidationResult {
  if (!avatar) return { isValid: true }; // Default "male"
  if (avatar === "male" || avatar === "female") {
    return { isValid: true };
  }
  return { isValid: false, error: "Avatar harus 'male' atau 'female'" };
}

export function validateChallengeItem(item: ChallengeItem): ValidationResult {
  if (!item.id || !item.id.trim()) {
    return { isValid: false, error: "ID kuis wajib diisi" };
  }

  const trimmedQuestion = item.question ? item.question.trim() : "";
  if (!trimmedQuestion) {
    return { isValid: false, error: "Pertanyaan kuis tidak boleh kosong" };
  }
  if (trimmedQuestion.length > 140) {
    return { isValid: false, error: "Pertanyaan kuis maksimal 140 karakter" };
  }

  if (item.imageUrl) {
    const trimmedImg = item.imageUrl.trim();
    if (trimmedImg.startsWith("javascript:") || trimmedImg.startsWith("data:")) {
      return { isValid: false, error: "URL foto kuis tidak aman" };
    }
    if (!trimmedImg.startsWith("https://")) {
      return { isValid: false, error: "URL foto kuis harus diawali https://" };
    }
  }

  if (!Array.isArray(item.options) || item.options.length !== 4) {
    return { isValid: false, error: "Kuis harus memiliki tepat 4 pilihan jawaban" };
  }

  for (let i = 0; i < 4; i++) {
    const opt = item.options[i];
    const trimmedOpt = typeof opt === "string" ? opt.trim() : "";
    if (!trimmedOpt) {
      return { isValid: false, error: `Pilihan jawaban ${String.fromCharCode(65 + i)} tidak boleh kosong` };
    }
    if (trimmedOpt.length > 60) {
      return { isValid: false, error: `Pilihan jawaban ${String.fromCharCode(65 + i)} maksimal 60 karakter` };
    }
  }

  if (![0, 1, 2, 3].includes(item.correctIndex)) {
    return { isValid: false, error: "Jawaban benar harus berupa pilihan A, B, C, atau D" };
  }

  const validBuffs: BuffType[] = ["shield", "speed", "power_star"];
  if (!validBuffs.includes(item.buff)) {
    return { isValid: false, error: "Hadiah buff tidak valid" };
  }

  return { isValid: true };
}

export function validateChallenges(challenges?: ChallengeItem[]): ValidationResult {
  if (!challenges || challenges.length === 0) {
    return { isValid: true }; // Opsional
  }

  if (challenges.length > 3) {
    return { isValid: false, error: "Tantangan kuis maksimal 3 soal" };
  }

  const ids = new Set<string>();
  for (let i = 0; i < challenges.length; i++) {
    const item = challenges[i];
    const val = validateChallengeItem(item);
    if (!val.isValid) {
      return { isValid: false, error: `Soal #${i + 1}: ${val.error}` };
    }
    if (ids.has(item.id)) {
      return { isValid: false, error: `Soal #${i + 1} memiliki ID duplikat` };
    }
    ids.add(item.id);
  }

  return { isValid: true };
}

export function validateMemoryMessages(messages?: string[]): ValidationResult {
  if (!messages || messages.length === 0) {
    return { isValid: true }; // Opsional
  }

  if (messages.length > 4) {
    return { isValid: false, error: "Pesan bintang kenangan maksimal 4 pesan" };
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (typeof msg === "string" && msg.trim().length > 40) {
      return {
        isValid: false,
        error: `Pesan bintang #${i + 1} maksimal 40 karakter`,
      };
    }
  }

  return { isValid: true };
}
