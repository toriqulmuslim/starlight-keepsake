/**
 * sfx.ts — 8-Bit Procedural Sound Effects & BGM (Web Audio API)
 * Singleton audio engine tanpa dependensi React.
 * Mendukung audio unlock sinkron, WebAudio look-ahead BGM scheduler,
 * dan URL audio fallback yang aman dari pemblokiran autoplay.
 */

export type PresetId = "cozy_sunset" | "happy_birthday_retro" | "starlight_lullaby";

export type BgmSource =
  | { kind: "preset"; id: PresetId }
  | { kind: "url"; url: string }
  | { kind: "none" };

export type AudioStatus = "idle" | "playing" | "blocked" | "failed";

// ======================== STATE SINGLETON ========================

let audioCtx: AudioContext | null = null;
let muted = false;
let userMuted = false;
let tabHiddenMute = false;
let audioStatus: AudioStatus = "idle";
const statusListeners: Set<(s: AudioStatus) => void> = new Set();

let bgmGainNode: GainNode | null = null;
let bgmAudioEl: HTMLAudioElement | null = null;

// Look-ahead BGM scheduler state
let schedulerTimer: number | null = null;
let activePresetId: PresetId | null = null;
let currentStepIndex = 0;
let nextNoteTime = 0;
let bgmTempoMultiplier = 1.0;

function notifyStatus(status: AudioStatus): void {
  audioStatus = status;
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch {
      // Abaikan listener error
    }
  });
}

export function getAudioStatus(): AudioStatus {
  return audioStatus;
}

export function onAudioStatus(cb: (s: AudioStatus) => void): () => void {
  statusListeners.add(cb);
  cb(audioStatus);
  return () => {
    statusListeners.delete(cb);
  };
}

// ==================== CONTEXT & UNLOCK ====================

function getOrCreateContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/**
 * SINKRON: Buka kunci Web Audio API pada interaksi pengguna pertama (PRESS START).
 * Wajib dipanggil langsung di baris pertama event handler klik sebelum async / await / setState.
 */
export function unlockAudio(): void {
  const ctx = getOrCreateContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  // Putar 1 buffer kosong 1 sampel (membuka kunci audio di iOS Safari)
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Abaikan
  }
}

function getCtx(): AudioContext | null {
  if (muted) return null;
  const ctx = getOrCreateContext();
  if (!ctx) return null;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function applyEffectiveMute(): void {
  const effective = userMuted || tabHiddenMute;
  muted = effective;
  if (bgmAudioEl) {
    bgmAudioEl.muted = effective;
    bgmAudioEl.volume = effective ? 0 : 0.5;
  }
  if (bgmGainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      bgmGainNode.gain.cancelScheduledValues(now);
      bgmGainNode.gain.setValueAtTime(effective ? 0 : 0.22, now);
    } catch {
      // ignore
    }
  }
}

export function setMuted(m: boolean): void {
  userMuted = m;
  applyEffectiveMute();
}

/**
 * Bisukan sementara saat tab diminimalkan (visibilitychange)
 * tanpa menimpa preferensi mute manual pengguna.
 */
export function setTabHiddenMute(hidden: boolean): void {
  tabHiddenMute = hidden;
  applyEffectiveMute();
}

// ===================== RESOLVER BGM SOURCE =====================

export function resolveBgmSource(musicUrl: string | undefined): BgmSource {
  if (!musicUrl || typeof musicUrl !== "string") {
    return { kind: "none" };
  }

  const trimmed = musicUrl.trim();
  if (!trimmed) return { kind: "none" };

  if (trimmed === "preset:cozy" || trimmed === "cozy_sunset" || trimmed === "cozy") {
    return { kind: "preset", id: "cozy_sunset" };
  }
  if (trimmed === "preset:happy" || trimmed === "happy_birthday_retro" || trimmed === "happy") {
    return { kind: "preset", id: "happy_birthday_retro" };
  }
  if (trimmed === "preset:romantic" || trimmed === "starlight_lullaby" || trimmed === "romantic") {
    return { kind: "preset", id: "starlight_lullaby" };
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { kind: "url", url: trimmed };
  }

  return { kind: "none" };
}

// ====================== PROCEDURAL MELODIES ======================

interface NoteStep {
  f: number;     // Frekuensi Hz (0 = istirahat / rest)
  d: number;     // Durasi detik
  type?: OscillatorType;
}

// Frekuensi nada dasar (Hz)
const N_G3 = 196.00;
const N_A3 = 220.00;
const N_B3 = 246.94;
const N_C4 = 261.63;
const N_D4 = 293.66;
const N_E4 = 329.63;
const N_F4 = 349.23;
const N_G4 = 392.00;
const N_A4 = 440.00;
const N_B4 = 493.88;
const N_C5 = 523.25;
const N_D5 = 587.33;
const N_E5 = 659.25;
const N_F5 = 698.46;
const N_G5 = 783.99;

/** Cozy Sunset: Santai, hangat, tempo sedang (~9.6 detik total loop) */
const MELODY_COZY_SUNSET: NoteStep[] = [
  { f: N_C4, d: 0.35, type: "square" },
  { f: N_E4, d: 0.35, type: "square" },
  { f: N_G4, d: 0.35, type: "triangle" },
  { f: N_E4, d: 0.35, type: "square" },
  { f: N_A4, d: 0.45, type: "square" },
  { f: N_G4, d: 0.35, type: "triangle" },
  { f: N_E4, d: 0.55, type: "triangle" },
  { f: 0,    d: 0.20 },
  { f: N_F4, d: 0.35, type: "square" },
  { f: N_A4, d: 0.35, type: "triangle" },
  { f: N_C5, d: 0.35, type: "square" },
  { f: N_A4, d: 0.35, type: "triangle" },
  { f: N_G4, d: 0.45, type: "triangle" },
  { f: N_E4, d: 0.35, type: "square" },
  { f: N_D4, d: 0.60, type: "triangle" },
  { f: 0,    d: 0.25 },
  // Baris kedua variasi hangat
  { f: N_E4, d: 0.35, type: "square" },
  { f: N_G4, d: 0.35, type: "triangle" },
  { f: N_B4, d: 0.40, type: "square" },
  { f: N_C5, d: 0.60, type: "triangle" },
  { f: N_A4, d: 0.35, type: "square" },
  { f: N_G4, d: 0.35, type: "triangle" },
  { f: N_E4, d: 0.40, type: "square" },
  { f: N_D4, d: 0.40, type: "triangle" },
  { f: N_C4, d: 0.70, type: "triangle" },
  { f: 0,    d: 0.35 },
];

/** Happy Birthday Retro: Ceria, lincah (~8.9 detik total loop) */
const MELODY_HAPPY_BIRTHDAY: NoteStep[] = [
  { f: N_C4, d: 0.25, type: "square" },
  { f: N_C4, d: 0.25, type: "square" },
  { f: N_D4, d: 0.45, type: "square" },
  { f: N_C4, d: 0.45, type: "square" },
  { f: N_F4, d: 0.45, type: "square" },
  { f: N_E4, d: 0.80, type: "square" },
  { f: 0,    d: 0.20 },
  { f: N_C4, d: 0.25, type: "square" },
  { f: N_C4, d: 0.25, type: "square" },
  { f: N_D4, d: 0.45, type: "square" },
  { f: N_C4, d: 0.45, type: "square" },
  { f: N_G4, d: 0.45, type: "square" },
  { f: N_F4, d: 0.80, type: "square" },
  { f: 0,    d: 0.20 },
  { f: N_C4, d: 0.25, type: "square" },
  { f: N_C4, d: 0.25, type: "square" },
  { f: N_C5, d: 0.45, type: "square" },
  { f: N_A4, d: 0.45, type: "square" },
  { f: N_F4, d: 0.40, type: "square" },
  { f: N_E4, d: 0.40, type: "square" },
  { f: N_D4, d: 0.60, type: "square" },
  { f: 0,    d: 0.20 },
  { f: N_B4, d: 0.25, type: "square" },
  { f: N_B4, d: 0.25, type: "square" },
  { f: N_A4, d: 0.45, type: "square" },
  { f: N_F4, d: 0.45, type: "square" },
  { f: N_G4, d: 0.45, type: "square" },
  { f: N_F4, d: 0.85, type: "square" },
  { f: 0,    d: 0.35 },
];

/** Starlight Lullaby: Lembut, manis, berarpeggio (~9.4 detik total loop) */
const MELODY_STARLIGHT: NoteStep[] = [
  { f: N_E4, d: 0.45, type: "triangle" },
  { f: N_G4, d: 0.45, type: "triangle" },
  { f: N_B4, d: 0.45, type: "triangle" },
  { f: N_D5, d: 0.45, type: "triangle" },
  { f: N_C5, d: 0.65, type: "triangle" },
  { f: N_G4, d: 0.35, type: "triangle" },
  { f: N_E4, d: 0.75, type: "triangle" },
  { f: 0,    d: 0.25 },
  { f: N_A4, d: 0.45, type: "triangle" },
  { f: N_C5, d: 0.45, type: "triangle" },
  { f: N_E5, d: 0.45, type: "triangle" },
  { f: N_D5, d: 0.45, type: "triangle" },
  { f: N_B4, d: 0.65, type: "triangle" },
  { f: N_G4, d: 0.35, type: "triangle" },
  { f: N_A4, d: 0.75, type: "triangle" },
  { f: 0,    d: 0.25 },
  { f: N_F4, d: 0.45, type: "triangle" },
  { f: N_A4, d: 0.45, type: "triangle" },
  { f: N_C5, d: 0.45, type: "triangle" },
  { f: N_G4, d: 0.45, type: "triangle" },
  { f: N_B4, d: 0.45, type: "triangle" },
  { f: N_C5, d: 0.85, type: "triangle" },
  { f: 0,    d: 0.35 },
];

function getMelodyForPreset(id: PresetId): NoteStep[] {
  if (id === "happy_birthday_retro") return MELODY_HAPPY_BIRTHDAY;
  if (id === "starlight_lullaby") return MELODY_STARLIGHT;
  return MELODY_COZY_SUNSET;
}

// ================= LOOK-AHEAD BGM SCHEDULER =================

function schedulePresetNotes(): void {
  if (!activePresetId || !audioCtx) return;

  const melody = getMelodyForPreset(activePresetId);
  const lookAheadTime = audioCtx.currentTime + 0.1; // Jadwalkan 100 ms ke depan

  // Buat Master Gain untuk BGM jika belum ada
  if (!bgmGainNode) {
    bgmGainNode = audioCtx.createGain();
    bgmGainNode.gain.setValueAtTime(muted ? 0 : 0.22, audioCtx.currentTime);
    bgmGainNode.connect(audioCtx.destination);
  }

  while (nextNoteTime < lookAheadTime) {
    const step = melody[currentStepIndex];
    const stepDuration = step.d / bgmTempoMultiplier;

    if (step.f > 0 && !muted) {
      try {
        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        osc.type = step.type || "triangle";
        osc.frequency.setValueAtTime(step.f, nextNoteTime);

        // Gain ramp singkat untuk mencegah klik audio
        const noteVolume = osc.type === "square" ? 0.07 : 0.12;
        noteGain.gain.setValueAtTime(0, nextNoteTime);
        noteGain.gain.linearRampToValueAtTime(noteVolume, nextNoteTime + 0.02);
        noteGain.gain.setValueAtTime(noteVolume, Math.max(nextNoteTime + 0.02, nextNoteTime + stepDuration - 0.02));
        noteGain.gain.linearRampToValueAtTime(0, nextNoteTime + stepDuration);

        osc.connect(noteGain);
        noteGain.connect(bgmGainNode);
        osc.start(nextNoteTime);
        osc.stop(nextNoteTime + stepDuration);
      } catch {
        // Abaikan bila context tertutup
      }
    }

    nextNoteTime += stepDuration;
    currentStepIndex = (currentStepIndex + 1) % melody.length;
  }
}

/**
 * Mengubah tempo musik latar secara dinamis (misal 1.25x saat pertarungan Boss).
 */
export function setBattleTempo(fast: boolean): void {
  bgmTempoMultiplier = fast ? 1.25 : 1.0;
  if (bgmAudioEl) {
    try {
      bgmAudioEl.playbackRate = fast ? 1.2 : 1.0;
    } catch {
      // ignore
    }
  }
}

// ====================== KONTROL UTAMA BGM ======================

/**
 * Hentikan pemutaran BGM secara idempoten.
 */
export function stopBgm(): void {
  if (schedulerTimer !== null) {
    window.clearInterval(schedulerTimer);
    schedulerTimer = null;
  }

  if (bgmGainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      bgmGainNode.gain.cancelScheduledValues(now);
      bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, now);
      bgmGainNode.gain.linearRampToValueAtTime(0, now + 0.03);
      const nodeToDisconnect = bgmGainNode;
      setTimeout(() => {
        try {
          nodeToDisconnect.disconnect();
        } catch {}
      }, 35);
    } catch {
      try {
        bgmGainNode.disconnect();
      } catch {}
    }
    bgmGainNode = null;
  }

  if (bgmAudioEl) {
    try {
      bgmAudioEl.onerror = null;
      bgmAudioEl.onended = null;
      bgmAudioEl.pause();
      bgmAudioEl.removeAttribute("src");
      bgmAudioEl.load();
    } catch {
      // Abaikan
    }
    bgmAudioEl = null;
  }

  activePresetId = null;
  currentStepIndex = 0;
  notifyStatus("idle");
}

/**
 * Memulai BGM dengan penanganan error aman tanpa pernah melempar exception.
 */
export function startBgm(src: BgmSource): void {
  stopBgm();

  if (src.kind === "none") {
    notifyStatus("idle");
    return;
  }

  if (src.kind === "preset") {
    activePresetId = src.id;
    currentStepIndex = 0;

    const ctx = getOrCreateContext();
    if (!ctx) {
      notifyStatus("failed");
      return;
    }

    if (!ctx.onstatechange) {
      ctx.onstatechange = () => {
        if (ctx.state === "running" && activePresetId) {
          notifyStatus("playing");
        }
      };
    }

    const startScheduling = () => {
      nextNoteTime = ctx.currentTime + 0.05;
      if (schedulerTimer !== null) {
        window.clearInterval(schedulerTimer);
      }
      schedulerTimer = window.setInterval(schedulePresetNotes, 25);
      if (ctx.state === "running") {
        notifyStatus("playing");
      } else {
        notifyStatus("blocked");
      }
    };

    if (ctx.state === "suspended") {
      ctx
        .resume()
        .then(() => {
          if (activePresetId === src.id && ctx.state === "running") {
            notifyStatus("playing");
          }
        })
        .catch(() => {
          if (activePresetId === src.id) {
            notifyStatus("blocked");
          }
        });
    }

    startScheduling();
    return;
  }

  if (src.kind === "url") {
    try {
      const audio = new Audio();
      audio.loop = true;
      audio.preload = "auto";
      audio.muted = muted;
      audio.volume = muted ? 0 : 0.5;
      audio.src = src.url;

      bgmAudioEl = audio;

      audio.onerror = () => {
        console.warn("Gagal memuat URL audio BGM:", src.url);
        notifyStatus("failed");
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (bgmAudioEl !== audio) {
              try {
                audio.pause();
              } catch {}
              return;
            }
            notifyStatus("playing");
          })
          .catch((err: Error) => {
            if (bgmAudioEl !== audio) return;
            if (err.name === "NotAllowedError") {
              notifyStatus("blocked");
            } else {
              console.warn("Error pemutaran audio URL:", err);
              notifyStatus("failed");
            }
          });
      } else {
        notifyStatus("playing");
      }
    } catch (err) {
      console.warn("Exception saat memulai BGM URL:", err);
      notifyStatus("failed");
    }
  }
}

/** Kompatibilitas mundur untuk pemanggil lama */
export function startPresetBgm(presetId: string): void {
  startBgm(resolveBgmSource(presetId));
}

/** Pause audio saat tab disembunyikan (visibilitychange hidden) */
export function pauseAudio(): void {
  if (bgmAudioEl) {
    try {
      bgmAudioEl.pause();
    } catch {
      // ignore
    }
  }
  if (audioCtx && audioCtx.state === "running") {
    audioCtx.suspend().catch(() => {});
  }
}

/** Lanjutkan audio saat tab kembali aktif */
export function resumeAudio(): void {
  if (muted) return;
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  if (bgmAudioEl) {
    bgmAudioEl.play().catch(() => {});
  }
}

// ======================== SOUND EFFECTS (SFX) ========================

export function playJump(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(520, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.13);
}

export function playAttack(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.085);
}

export function playMonsterDefeat(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.19);
}

export function playHurt(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.16);
}

export function playDialog(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.07);
}

export function playCorrect(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const dur = 0.07;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    const t = ctx.currentTime + i * dur;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0, t + dur * 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  });
}

export function playWrong(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [196, 147];
  const dur = 0.1;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    const t = ctx.currentTime + i * dur;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.linearRampToValueAtTime(0, t + dur * 0.95);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  });
}

export function playBuff(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
  const dur = 0.05;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const t = ctx.currentTime + i * dur;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0, t + dur * 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  });
}

export function playWin(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
  const dur = 0.12;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    const t = ctx.currentTime + i * dur;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0, t + dur * 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  });
}

export function playFanfare(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [
    { f: 523, d: 0.1 },
    { f: 659, d: 0.1 },
    { f: 784, d: 0.1 },
    { f: 1047, d: 0.14 },
    { f: 880, d: 0.1 },
    { f: 1047, d: 0.1 },
    { f: 1319, d: 0.35 },
  ];

  let curTime = ctx.currentTime;
  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(n.f, curTime);
    gain.gain.setValueAtTime(0.14, curTime);
    gain.gain.linearRampToValueAtTime(0, curTime + n.d * 0.95);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(curTime);
    osc.stop(curTime + n.d);
    curTime += n.d * 0.9;
  });
}

export function playCollect(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [659, 784, 988];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const t = ctx.currentTime + i * 0.09;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  });
}

export function playCheckpoint(): void {
  const ctx = getCtx();
  if (!ctx) return;

  [392, 523].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  });
}

/**
 * Lonceng angin lembut (soft wind chime) saat pemain pertama kali mencapai Dataran Tinggi Puncak.
 * Menggunakan deretan frekuensi pentatonik beresonansi halus dengan decay eksponensial.
 */
export function playWindChime(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [1318.51, 1661.22, 1975.53, 2637.02]; // E6, G#6, B6, E7
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.08 + Math.random() * 0.03;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.25);
  });
}

/** SFX Intro Boss: Gemuruh misterius bernada rendah */
export function playBossIntro(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(110, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 1.2);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.45);
}

/** SFX Boss Slam: Dentuman hentakan tanah berat */
export function playBossSlam(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.35);
  gain.gain.setValueAtTime(0.24, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.36);
}

/** SFX Boss Shoot: Desingan bola energi bayangan */
export function playBossShoot(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.22);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.23);
}

/** SFX Deflect: Denting pantulan pedang tajam */
export function playDeflect(): void {
  const ctx = getCtx();
  if (!ctx) return;

  [1200, 1800, 2400].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    const t = ctx.currentTime + idx * 0.02;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  });
}

/** SFX Partner Rescue: Arpeggio kebangkitan cahaya emas */
export function playPartnerRescue(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [440, 554, 659, 880, 1108]; // A4 -> C#6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.06;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);
  });
}

/** SFX Duo Cut-In: Pengisian energi sinematik */
export function playDuoCutIn(): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.5);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.65);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.68);
}

/** SFX Duo Slash: Tebasan ganda spektakuler & ledakan */
export function playDuoSlash(): void {
  const ctx = getCtx();
  if (!ctx) return;

  // Slash 1
  const s1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  s1.type = "sawtooth";
  s1.frequency.setValueAtTime(960, ctx.currentTime);
  s1.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.18);
  g1.gain.setValueAtTime(0.2, ctx.currentTime);
  g1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
  s1.connect(g1);
  g1.connect(ctx.destination);
  s1.start(ctx.currentTime);
  s1.stop(ctx.currentTime + 0.2);

  // Slash 2
  const s2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  s2.type = "square";
  const t2 = ctx.currentTime + 0.08;
  s2.frequency.setValueAtTime(1280, t2);
  s2.frequency.exponentialRampToValueAtTime(220, t2 + 0.22);
  g2.gain.setValueAtTime(0.2, t2);
  g2.gain.linearRampToValueAtTime(0, t2 + 0.22);
  s2.connect(g2);
  g2.connect(ctx.destination);
  s2.start(t2);
  s2.stop(t2 + 0.24);

  // Boom rumble
  const boom = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boom.type = "triangle";
  const tb = ctx.currentTime + 0.16;
  boom.frequency.setValueAtTime(130, tb);
  boom.frequency.exponentialRampToValueAtTime(30, tb + 0.8);
  boomGain.gain.setValueAtTime(0.28, tb);
  boomGain.gain.linearRampToValueAtTime(0, tb + 0.8);
  boom.connect(boomGain);
  boomGain.connect(ctx.destination);
  boom.start(tb);
  boom.stop(tb + 0.82);
}

export function destroyAudio(): void {
  stopBgm();
  bgmGainNode = null;
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}
