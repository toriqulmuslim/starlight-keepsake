"use client";

import React, { useEffect, useRef, useState } from "react";
import { createGame, GameController, GameHudState } from "@/lib/game/createGame";
import type { AvatarGender, ChallengeItem } from "@/lib/types";
import { setTabHiddenMute } from "@/lib/game/sfx";
import { drawAvatarPreview } from "@/lib/game/sprites";
import ChallengeModal from "./ChallengeModal";
import ReunionModal from "./ReunionModal";
import RetroButton from "./RetroButton";
import {
  PixelHeart,
  PixelShield,
  PixelLightning,
  PixelStar,
  PixelSparkle,
  PixelScroll,
  PixelTouch,
  PixelAudio,
  PixelPause,
  PixelPlay,
  PixelHelp,
  PixelGamepad,
  PixelSword,
  PixelChat,
  PixelCheck,
  PixelAlert,
} from "./PixelIcons";

/**
 * Fungsi murni penghitung skala Full-Viewport 16:9 anti-burik
 * Basis resolusi virtual Hi-Bit: 480×270 (Rasio 16:9 proporsional maksimal viewport tanpa batasan integer)
 */
export function computeScale(availW: number, availH: number): number {
  if (availW <= 0 || availH <= 0) return 1;
  return Math.min(availW / 480, availH / 270);
}

interface GameCanvasProps {
  onWin: () => void;
  receiverName: string;
  avatar?: AvatarGender;
  challenges?: ChallengeItem[];
  isTouch?: boolean;
  isMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  controllerRef?: React.MutableRefObject<GameController | null>;
  onNearbyChallengeChange?: (nearbyId: string | null) => void;
  isCutsceneActive?: boolean;
  onLoadProgress?: (percent: number) => void;
  memories?: string[];
  onAdventureSnapshot?: (dataUrl: string) => void;
}

export default function GameCanvas({
  onWin,
  receiverName,
  avatar = "male",
  challenges = [],
  isTouch = false,
  isMuted = false,
  onMutedChange,
  controllerRef,
  onNearbyChallengeChange,
  isCutsceneActive = false,
  onLoadProgress,
  memories,
  onAdventureSnapshot,
}: GameCanvasProps) {
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onWinRef = useRef(onWin);
  const receiverNameRef = useRef(receiverName);
  const avatarRef = useRef(avatar);
  const challengesRef = useRef(challenges);
  const isTouchRef = useRef(isTouch);
  const isMutedRef = useRef(isMuted);
  const isCutsceneActiveRef = useRef(isCutsceneActive);
  const onLoadProgressRef = useRef(onLoadProgress);
  const memoriesRef = useRef(memories);
  const onAdventureSnapshotRef = useRef(onAdventureSnapshot);

  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 270 });
  const lastDispatchedSizeRef = useRef({ width: 480, height: 270 });

  // Status fase siklus hidup canvas (C2)
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);

  const [hud, setHud] = useState<GameHudState>({
    hp: 3,
    maxHp: 3,
    hasShield: false,
    speedLeft: 0,
    starLeft: 0,
    nearbyChallengeId: null,
    challengesDone: 0,
    challengesTotal: challenges.length,
    memoriesCollected: 0,
    totalMemories: 4,
    progressPercent: 0,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // State Kuis Aktif (Challenge Modal)
  const [activeChallengeData, setActiveChallengeData] = useState<{
    challenge: ChallengeItem;
    index: number;
    total: number;
  } | null>(null);
  const [showReunionModal, setShowReunionModal] = useState(false);

  // State Boss Penjaga Kado & Finisher Serangan Duo (Fase S-3)
  const [bossHpData, setBossHpData] = useState<{
    hp: number;
    maxHp: number;
    visible: boolean;
    isEnraged: boolean;
  } | null>(null);
  const [showBossTitleCard, setShowBossTitleCard] = useState(false);
  const [showDuoPrompt, setShowDuoPrompt] = useState(false);
  const [duoCutInData, setDuoCutInData] = useState<{
    visible: boolean;
    onFinished?: () => void;
  } | null>(null);
  const playerCutInCanvasRef = useRef<HTMLCanvasElement>(null);
  const partnerCutInCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render Potret Avatar Cut-In HD & Timer Penyelesaian Otomatis (1.6s)
  useEffect(() => {
    if (duoCutInData && duoCutInData.visible) {
      if (playerCutInCanvasRef.current) {
        drawAvatarPreview(playerCutInCanvasRef.current, avatar);
      }
      if (partnerCutInCanvasRef.current) {
        const partnerAvatar = avatar === "male" ? "female" : "male";
        drawAvatarPreview(partnerCutInCanvasRef.current, partnerAvatar);
      }
      const timer = setTimeout(() => {
        setDuoCutInData((prev) => (prev ? { ...prev, visible: false } : null));
        duoCutInData.onFinished?.();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [duoCutInData, avatar]);

  // Ref DOM Balon Interaksi HTML Tajam (Nol Re-render React)
  const interactionBubbleRef = useRef<HTMLDivElement>(null);

  // Ref DOM Balon Interaksi Ayunan HTML Tajam (Fase P-3)
  const swingPromptRef = useRef<HTMLDivElement>(null);
  const [isSittingOnSwing, setIsSittingOnSwing] = useState(false);

  // Ref DOM Lencana Selesai (✓) HTML Tajam (Nol Re-render React)
  const resolvedBadgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Ref DOM World Toast (Bintang Kenangan & Checkpoint) Tajam (Nol Re-render React)
  const worldToastRef = useRef<HTMLDivElement>(null);
  const worldToastInnerRef = useRef<HTMLDivElement>(null);
  const worldToastTextRef = useRef<HTMLSpanElement>(null);
  const worldToastIconCheckpointRef = useRef<HTMLSpanElement>(null);
  const worldToastIconMemoryRef = useRef<HTMLSpanElement>(null);

  // Ref DOM HTML Combo Counter Tajam (Nol Re-render React)
  const comboContainerRef = useRef<HTMLDivElement>(null);
  const comboCountTextRef = useRef<HTMLSpanElement>(null);
  const comboBarRef = useRef<HTMLDivElement>(null);
  const lastComboRef = useRef<number>(0);

  useEffect(() => {
    onWinRef.current = onWin;
    receiverNameRef.current = receiverName;
    avatarRef.current = avatar;
    challengesRef.current = challenges;
    isTouchRef.current = isTouch;
    isMutedRef.current = isMuted;
    isCutsceneActiveRef.current = isCutsceneActive;
    onLoadProgressRef.current = onLoadProgress;
  }, [onWin, receiverName, avatar, challenges, isTouch, isMuted, isCutsceneActive, onLoadProgress]);

  const controllerMutedRef = useRef<GameController | null>(null);

  useEffect(() => {
    controllerMutedRef.current?.setMuted?.(isMuted);
  }, [isMuted]);

  // Jeda gameplay di belakang saat prolog / cutscene berlangsung
  useEffect(() => {
    if (isCutsceneActive) {
      controllerMutedRef.current?.pause?.();
    } else if (!isPaused) {
      controllerMutedRef.current?.resume?.();
    }
  }, [isCutsceneActive, isPaused]);

  // Alirkan nearbyChallengeId ke parent untuk aktivasi tombol 💬 di mobile DPad
  const onNearbyChallengeChangeRef = useRef(onNearbyChallengeChange);
  useEffect(() => {
    onNearbyChallengeChangeRef.current = onNearbyChallengeChange;
  }, [onNearbyChallengeChange]);

  const handleHudUpdate = (nextHud: GameHudState) => {
    setHud((prev) => {
      if (
        prev.hp === nextHud.hp &&
        prev.maxHp === nextHud.maxHp &&
        prev.hasShield === nextHud.hasShield &&
        prev.speedLeft === nextHud.speedLeft &&
        prev.starLeft === nextHud.starLeft &&
        prev.nearbyChallengeId === nextHud.nearbyChallengeId &&
        prev.challengesDone === nextHud.challengesDone &&
        prev.challengesTotal === nextHud.challengesTotal &&
        prev.memoriesCollected === nextHud.memoriesCollected &&
        prev.totalMemories === nextHud.totalMemories &&
        prev.progressPercent === nextHud.progressPercent
      ) {
        return prev;
      }
      return nextHud;
    });
    onNearbyChallengeChangeRef.current?.(nextHud.nearbyChallengeId);
  };

  // Penanganan tab visibility (Pause saat hidden, tampilkan overlay jeda saat visible)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabHiddenMute(true);
        controllerMutedRef.current?.pause?.();
        setIsAutoPaused(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleResumeAutoPause = () => {
    setIsAutoPaused(false);
    setTabHiddenMute(false);
    if (!isPaused && !isCutsceneActiveRef.current) {
      controllerMutedRef.current?.resume?.();
    }
  };

  // Hitung ulang skala bulat pada ResizeObserver, visualViewport, dan orientationchange (C1)
  useEffect(() => {
    let rafId: number | null = null;

    const updateDimensions = () => {
      if (!outerContainerRef.current) return;
      const rect = outerContainerRef.current.getBoundingClientRect();
      const scale = computeScale(rect.width, rect.height);
      const targetW = Math.round(480 * scale);
      const targetH = Math.round(270 * scale);

      setCanvasSize((prev) => {
        if (prev.width === targetW && prev.height === targetH) return prev;
        return { width: targetW, height: targetH };
      });
    };

    const onResize = (e?: Event) => {
      // Abaikan event sintetis untuk mencegah loop tak berujung (C1)
      if (e && !e.isTrusted) return;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateDimensions);
    };

    updateDimensions();

    const ro = new ResizeObserver(() => onResize());
    if (outerContainerRef.current) {
      ro.observe(outerContainerRef.current);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", onResize);
      }
    };
  }, []);

  // Dispatch window resize HANYA saat canvasSize telah selesai diterapkan di DOM (C1)
  useEffect(() => {
    if (
      canvasSize.width !== lastDispatchedSizeRef.current.width ||
      canvasSize.height !== lastDispatchedSizeRef.current.height
    ) {
      lastDispatchedSizeRef.current = canvasSize;
      window.dispatchEvent(new Event("resize"));

      if (process.env.NODE_ENV === "development") {
        const canvasEl = containerRef.current?.querySelector("canvas");
        if (canvasEl && outerContainerRef.current) {
          const rect = outerContainerRef.current.getBoundingClientRect();
          const expectedScale = computeScale(rect.width, rect.height);
          const actualScale = canvasEl.getBoundingClientRect().width / 480;
          if (Math.abs(actualScale - expectedScale) > 0.05) {
            console.warn(
              `[ScaleCheck] Scale mismatch: expected ${expectedScale}, got ${actualScale}`
            );
          }
        }
      }
    }
  }, [canvasSize]);

  // Inisialisasi Game KAPLAY dengan status loading & error screen (C2)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let localController: GameController | null = null;
    let canvas: HTMLCanvasElement | null = null;

    setPhase("loading");

    const timer = setTimeout(() => {
      if (cancelled) return;

      // Bersihkan canvas sebelumnya
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      canvas = document.createElement("canvas");
      canvas.className =
        "pixel-canvas w-full h-full max-w-full max-h-full block object-contain select-none";
      container.appendChild(canvas);

      createGame({
        canvas,
        receiverName: receiverNameRef.current,
        avatar: avatarRef.current,
        challenges: challengesRef.current,
        isTouch: isTouchRef.current,
        isMuted: isMutedRef.current,
        memories: memoriesRef.current,
        isCutsceneActive: isCutsceneActiveRef.current,
        onLoadProgress: (pct) => onLoadProgressRef.current?.(pct),
        debug: process.env.NODE_ENV === "development",
        onHudUpdate: handleHudUpdate,
        onOpenChallenge: (challenge, index, total) => {
          setActiveChallengeData({ challenge, index, total });
        },
        onPartnerReunion: () => {
          setShowReunionModal(true);
        },
        onInteractionPromptUpdate: (data) => {
          const el = interactionBubbleRef.current;
          if (!el) return;
          if (!data || !data.visible) {
            el.style.display = "none";
          } else {
            el.style.display = "block";
            el.style.transform = `translate3d(${Math.round(data.x)}px, ${Math.round(data.y)}px, 0)`;
          }
        },
        onResolvedNpcBadgesUpdate: (badges) => {
          const badgeMap = new Map(badges.map((b) => [b.index, b]));
          challengesRef.current.forEach((_, idx) => {
            const el = resolvedBadgeRefs.current[idx];
            if (!el) return;
            const data = badgeMap.get(idx);
            if (!data || !data.visible) {
              el.style.display = "none";
            } else {
              el.style.display = "flex";
              el.style.transform = `translate3d(${Math.round(data.x)}px, ${Math.round(data.y)}px, 0)`;
            }
          });
        },
        onFloatingNotificationUpdate: (data) => {
          const el = worldToastRef.current;
          const inner = worldToastInnerRef.current;
          const textEl = worldToastTextRef.current;
          const iconCp = worldToastIconCheckpointRef.current;
          const iconMem = worldToastIconMemoryRef.current;
          if (!el || !inner) return;

          if (!data || !data.visible) {
            el.style.display = "none";
          } else {
            el.style.display = "block";
            el.style.transform = `translate3d(${Math.round(data.x)}px, ${Math.round(data.y)}px, 0)`;
            inner.style.opacity = data.opacity.toFixed(2);
            if (textEl && textEl.textContent !== data.text) {
              textEl.textContent = data.text;
            }
            if (iconCp && iconMem) {
              if (data.type === "checkpoint") {
                iconCp.style.display = "inline-flex";
                iconMem.style.display = "none";
              } else {
                iconCp.style.display = "none";
                iconMem.style.display = "inline-flex";
              }
            }
          }
        },
        onComboUpdate: (data) => {
          const el = comboContainerRef.current;
          const textEl = comboCountTextRef.current;
          const barEl = comboBarRef.current;
          if (!el) return;

          if (data.combo < 2) {
            el.style.display = "none";
            lastComboRef.current = 0;
          } else {
            el.style.display = "flex";
            if (textEl) {
              textEl.textContent = `${data.combo}x COMBO!`;
            }
            if (barEl) {
              const pct = Math.max(0, Math.min(100, (data.timeLeft / data.maxTime) * 100));
              barEl.style.width = `${pct}%`;
            }
            if (data.combo > lastComboRef.current) {
              el.classList.remove("animate-retro-bounce");
              void el.offsetWidth;
              el.classList.add("animate-retro-bounce");
              lastComboRef.current = data.combo;
            }
          }
        },
        onBossHpUpdate: (hp, maxHp, visible, isEnraged) => {
          setBossHpData({ hp, maxHp, visible, isEnraged });
        },
        onBossTitleCard: (visible) => {
          setShowBossTitleCard(visible);
        },
        onDuoPromptUpdate: (visible) => {
          setShowDuoPrompt(visible);
        },
        onDuoCutIn: (visible, onFinished) => {
          setDuoCutInData({ visible, onFinished });
        },
        onSwingPromptUpdate: (data) => {
          const el = swingPromptRef.current;
          if (!el) return;
          if (!data || !data.visible) {
            el.style.display = "none";
          } else {
            el.style.display = "block";
            el.style.transform = `translate3d(${Math.round(data.x)}px, ${Math.round(data.y)}px, 0)`;
          }
        },
        onSwingStateChange: (sitting) => {
          setIsSittingOnSwing(sitting);
          if (sitting && swingPromptRef.current) {
            swingPromptRef.current.style.display = "none";
          }
        },
        onAdventureSnapshot: (dataUrl) => {
          onAdventureSnapshotRef.current?.(dataUrl);
        },
        onWin: () => {
          onWinRef.current();
        },
      })
        .then((controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }
          localController = controller;
          if (controllerRef) {
            controllerRef.current = controller;
          }
          controllerMutedRef.current = controller;
          setPhase("ready");
        })
        .catch((err) => {
          if (err instanceof Error && err.message === "createGame dibatalkan") {
            return;
          }
          console.error("Gagal menginisialisasi game:", err);
          if (!cancelled) {
            setPhase("error");
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (localController) {
        localController.destroy();
      }
      if (controllerRef) {
        controllerRef.current = null;
      }
      controllerMutedRef.current = null;
      try {
        if (canvas && container.contains(canvas)) {
          container.removeChild(canvas);
        }
      } catch {
        // Abaikan
      }
    };
  }, [controllerRef, retryCount]);

  // togglePause murni tanpa efek samping di dalam updater (C3)
  const togglePause = () => {
    const next = !isPaused;
    if (next) controllerMutedRef.current?.pause();
    else controllerMutedRef.current?.resume();
    setIsPaused(next);
  };

  const handleAnswerChallenge = (correct: boolean) => {
    if (!activeChallengeData) return;
    const { challenge } = activeChallengeData;
    setActiveChallengeData(null);
    controllerMutedRef.current?.resolveChallenge?.(
      challenge.id,
      correct,
      correct ? challenge.buff : undefined
    );
  };

  return (
    <div
      ref={outerContainerRef}
      className="relative w-full h-[100dvh] flex items-center justify-center bg-[#1a1c2c] overflow-hidden"
    >
      {/* Wrapper Skala Bulat Anti-Burik (Centering Flexbox murni) */}
      <div
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
        className="relative flex items-center justify-center overflow-visible"
      >
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center"
        />

        {/* Lapisan Vignette Sinematik Tipis (Fase P-2) */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 65%, rgba(10, 8, 22, 0.38) 100%)",
          }}
        />

        {/* Balon Interaksi HTML Tajam di atas NPC */}
        <div
          ref={interactionBubbleRef}
          style={{ display: "none" }}
          className="absolute left-0 top-0 z-[45] pointer-events-none"
        >
          <div className="relative -translate-x-1/2 -translate-y-full pb-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                const controller = controllerRef?.current || controllerMutedRef.current;
                controller?.triggerInteraction?.();
              }}
              className="group cursor-pointer select-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs bg-white hover:bg-[#fffef0] border-2 border-[#1a1c2c] shadow-[2px_2px_0px_#0c0d19] active:translate-y-[1px] transition-all animate-retro-bob"
              aria-label="Buka Tantangan Kuis"
            >
              {/* Ikon Piksel */}
              <PixelScroll size={13} className="shrink-0" />

              {/* Teks Singkat Sangat Tajam */}
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#1a1c2c] font-bold tracking-tight whitespace-nowrap">
                Buka Kuis
              </span>

              {/* Tombol Keycap E (Desktop) atau Sentuh (Mobile) */}
              {isTouch ? (
                <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded-[2px] bg-[#ffd166] text-[#1a1c2c] font-bold border border-[#1a1c2c] shadow-[1px_1px_0px_#1a1c2c] shrink-0 flex items-center gap-1">
                  TAP <PixelTouch size={10} className="shrink-0" />
                </span>
              ) : (
                <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded-[2px] bg-[#f0f2f5] text-[#1a1c2c] font-bold border border-[#1a1c2c] shadow-[1px_1px_0px_#1a1c2c] shrink-0 group-hover:bg-[#ffd166] transition-colors">
                  E
                </span>
              )}
            </button>

            {/* Ekor Panah Segitiga Menunjuk ke Bawah (Kepala NPC) */}
            <div className="absolute left-1/2 bottom-0.5 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-[#1a1c2c] pointer-events-none">
              <div className="absolute -left-[3px] -top-[6px] w-0 h-0 border-x-[3px] border-x-transparent border-t-[4px] border-t-white pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Balon Interaksi Ayunan HTML Tajam (Fase P-3) */}
        <div
          ref={swingPromptRef}
          style={{ display: "none" }}
          className="absolute left-0 top-0 z-[180] pointer-events-none"
        >
          <div className="relative -translate-x-1/2 -translate-y-full pb-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                const controller = controllerRef?.current || controllerMutedRef.current;
                controller?.triggerSwingAction?.();
              }}
              className="group cursor-pointer select-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs bg-[#1a1c2c]/95 hover:bg-[#282548] border-2 border-[#ffd166] shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all animate-retro-bob"
              aria-label="Duduk di Ayunan"
            >
              <PixelHeart size={12} className="text-[#f472b6] shrink-0 animate-pulse" />
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#ffd166] font-bold tracking-tight whitespace-nowrap">
                {isTouch ? "TAP" : "[E]"}
              </span>
              <span className="font-pixel text-[9px] sm:text-[10px] text-white font-bold tracking-tight whitespace-nowrap">
                DUDUK BERAYUN
              </span>
            </button>
            <div className="absolute left-1/2 bottom-0.5 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-[#ffd166] pointer-events-none" />
          </div>
        </div>

        {/* Lencana Selesai (✓) HTML Tajam di atas NPC Kuis (Nol Re-render React) */}
        {challenges.map((ch, idx) => (
          <div
            key={`resolved-badge-${ch.id || idx}`}
            ref={(el) => {
              resolvedBadgeRefs.current[idx] = el;
            }}
            style={{ display: "none" }}
            className="absolute left-0 top-0 z-[44] pointer-events-none select-none items-center justify-center -translate-x-1/2 -translate-y-full"
            aria-label="Tantangan kuis selesai"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-xs border-2 border-[#1a1c2c] bg-[#10ac84] shadow-[2px_2px_0px_#0c0d19,inset_1px_1px_0px_#7bed9f]">
              <PixelCheck size={12} className="text-white" />
            </div>
          </div>
        ))}

        {/* World Toast Balon Tajam di Atas Bintang Kenangan & Checkpoint (Nol Re-render React) */}
        <div
          ref={worldToastRef}
          style={{ display: "none" }}
          className="absolute left-0 top-0 z-[48] pointer-events-none select-none"
        >
          <div
            ref={worldToastInnerRef}
            className="relative -translate-x-1/2 -translate-y-full pb-1 pointer-events-none transition-opacity duration-150"
          >
            <aside
              aria-live="polite"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs border-2 border-[#1a1c2c] bg-[#121324]/95 backdrop-blur-md shadow-[3px_3px_0px_#0c0d19,inset_1px_1px_0px_rgba(255,209,102,0.4)] text-white whitespace-nowrap"
            >
              <span ref={worldToastIconCheckpointRef} style={{ display: "none" }} className="shrink-0 text-[#ffd166]">
                <PixelSparkle size={13} className="animate-pulse" />
              </span>
              <span ref={worldToastIconMemoryRef} style={{ display: "none" }} className="shrink-0 text-[#ffd166]">
                <PixelStar size={13} className="animate-pulse" />
              </span>
              <span
                ref={worldToastTextRef}
                className="font-sans text-[11px] sm:text-xs font-semibold text-[#ffd166] tracking-wide"
              />
            </aside>
            {/* Ekor Panah Segitiga Menunjuk ke Bintang / Lentera */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent border-t-[5px] border-t-[#1a1c2c] pointer-events-none">
              <div className="absolute -left-[3px] -top-[5px] w-0 h-0 border-x-[3px] border-x-transparent border-t-[4px] border-t-[#121324] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Boss Title Card HTML HD (z-[255]) */}
        {showBossTitleCard && (
          <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[255] pointer-events-none select-none flex flex-col items-center animate-fade-in w-[90%] max-w-[420px]">
            <div className="px-4 py-2 rounded-xs border-2 border-[#a855f7] bg-[#1a102f]/95 shadow-[0_0_15px_rgba(168,85,247,0.6),3px_3px_0px_#000] text-center w-full">
              <div className="text-[11px] sm:text-xs font-pixel text-[#f3e8ff] tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                PENJAGA KADO — SHADOW GUARDIAN
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-sans font-medium text-[#e9d5ff] leading-snug drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                &ldquo;Kado spesial untuk <span className="text-[#fbcfe8] font-bold">{receiverName}</span> terlalu berharga untuk dilepas begitu saja!&rdquo;
              </div>
            </div>
          </div>
        )}

        {/* Kotak Dialog Manis JRPG saat Duduk di Ayunan Berdua (Fase P-3) */}
        {isSittingOnSwing && (
          <div
            onClick={() => {
              const controller = controllerRef?.current || controllerMutedRef.current;
              controller?.triggerSwingAction?.();
            }}
            className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-[420px] select-none cursor-pointer animate-fade-in"
          >
            <div className="p-3 sm:p-3.5 bg-[#141226]/95 border-2 border-[#f472b6] rounded-xs shadow-[0_0_15px_rgba(244,114,182,0.4),3px_3px_0px_#000] text-center backdrop-blur-xs">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <PixelHeart size={12} className="text-[#f472b6] animate-pulse shrink-0" />
                <span className="font-pixel text-[9px] text-[#fbcfe8] tracking-widest uppercase">
                  Momen Berdua di Puncak Sakura
                </span>
                <PixelHeart size={12} className="text-[#f472b6] animate-pulse shrink-0" />
              </div>
              <p className="font-sans text-xs sm:text-sm text-white font-medium italic leading-relaxed">
                &ldquo;Menghabiskan waktu bersamamu selalu jadi momen favoritku.&rdquo;
              </p>
              <p className="mt-1.5 text-[9px] font-pixel text-[#f9a8d4]/80 tracking-wider">
                {isTouch ? "[ Ketuk di sini untuk berdiri ]" : "[ Tekan Gerak / Lompat / E untuk berdiri ]"}
              </p>
            </div>
          </div>
        )}

        {/* Boss HP Bar 9-Slice Segmented (z-[260]) */}
        {bossHpData && bossHpData.visible && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[260] pointer-events-none select-none flex flex-col items-center gap-1 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs border-2 border-[#2e1065] bg-[#120826]/95 shadow-[0_0_12px_rgba(168,85,247,0.5),2px_2px_0px_#000]">
              <span className="font-pixel text-[9px] text-[#d8b4fe] tracking-wider">PENJAGA KADO</span>
              {bossHpData.isEnraged && (
                <span className="font-pixel text-[8px] text-[#ef4444] animate-pulse font-bold">[ENRAGED]</span>
              )}
              <div className="flex items-center gap-1">
                {Array.from({ length: bossHpData.maxHp }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2.5 h-3 border border-[#3b0764] rounded-[1px] transition-all duration-150 ${idx < bossHpData.hp
                      ? bossHpData.isEnraged
                        ? "bg-gradient-to-t from-[#b91c1c] to-[#ef4444] shadow-[0_0_4px_#ef4444]"
                        : "bg-gradient-to-t from-[#7e22ce] to-[#c084fc] shadow-[0_0_4px_#c084fc]"
                      : "bg-[#2e1065]/50"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prompt Serangan Duo [F] / TAP SERANGAN DUO! (z-[280]) */}
        {showDuoPrompt && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[280] flex flex-col items-center select-none animate-bounce">
            <button
              type="button"
              onClick={() => {
                controllerMutedRef.current?.triggerDuoAttack?.();
              }}
              className="px-4 py-2 rounded-xs border-2 border-[#fff] bg-gradient-to-r from-[#eab308] via-[#f59e0b] to-[#fbbf24] shadow-[0_0_18px_rgba(250,204,21,0.9),3px_3px_0px_#78350f] text-[#451a03] font-pixel text-xs sm:text-sm font-bold tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <PixelSword size={14} className="text-[#451a03]" />
              <span>[F] / TAP SERANGAN DUO!</span>
              <PixelSparkle size={14} className="text-[#451a03]" />
            </button>
          </div>
        )}
      </div>

      {/* HUD Kiri Atas: HP, Perisai Hati, Buff Chips, Bintang Kenangan (16-Bit Bevel Capsule) */}
      <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-[260] flex items-center gap-1.5 sm:gap-2.5 rounded-xs border-2 border-[#1a1c2c] bg-gradient-to-b from-[#242145] to-[#15132d] shadow-[3px_3px_0px_#0c0d19,inset_1px_1px_0px_rgba(255,255,255,0.25)] px-3 py-1.5 text-[9px] sm:text-[10px] font-pixel text-white pointer-events-none">
        {(() => {
          const clampedHp = Math.max(0, Math.min(hud.hp, hud.maxHp));
          return (
            <span aria-label={`${clampedHp} dari ${hud.maxHp} nyawa`} className="flex items-center gap-1">
              {Array.from({ length: hud.maxHp }).map((_, i) => (
                <PixelHeart filled={i < clampedHp} size={13} key={i} />
              ))}
            </span>
          );
        })()}

        {/* Indikator Buff Perisai */}
        {hud.hasShield && (
          <span className="border-l border-white/20 pl-2 flex items-center" title="Perisai Hati Aktif">
            <PixelShield size={14} className="shrink-0" />
          </span>
        )}

        {/* Chip Timer Sepatu Kilat */}
        {hud.speedLeft > 0 && (
          <span className="border-l border-white/20 pl-2 text-[#f6d32d] font-bold flex items-center gap-1" title="Sepatu Kilat">
            <PixelLightning size={13} className="shrink-0" />
            <span>{hud.speedLeft}s</span>
          </span>
        )}

        {/* Chip Timer Bintang Sihir */}
        {hud.starLeft > 0 && (
          <span className="border-l border-white/20 pl-2 text-[#a29bfe] font-bold flex items-center gap-1" title="Bintang Sihir">
            <PixelSparkle size={13} className="shrink-0" />
            <span>{hud.starLeft}s</span>
          </span>
        )}

        {/* Bintang Kenangan */}
        <span className="border-l-2 border-white/20 pl-2 text-[#ffd166] flex items-center gap-1.5">
          <PixelStar size={13} className="shrink-0" />
          <span>{hud.memoriesCollected}/{hud.totalMemories}</span>
        </span>
      </div>

      {/* HTML Combo Counter Tajam (Retina HD, Nol Re-render React) */}
      <div
        ref={comboContainerRef}
        style={{ display: "none" }}
        className="absolute left-2 top-11 sm:left-3 sm:top-12 z-[260] flex flex-col items-start gap-1 pointer-events-none select-none"
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs border-2 border-[#1a1c2c] bg-gradient-to-r from-[#e74c3c] to-[#f39c12] shadow-[3px_3px_0px_#0c0d19,inset_1px_1px_0px_rgba(255,255,255,0.4)] text-white">
          <PixelSword size={12} className="text-white shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
          <span
            ref={comboCountTextRef}
            className="font-pixel text-[10px] sm:text-xs font-bold text-white tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          >
            2x COMBO!
          </span>
        </div>
        {/* Timer Bar Tipis yang Menyusut Halus */}
        <div className="w-full h-1 bg-[#1a1c2c]/80 border border-[#1a1c2c] rounded-[1px] overflow-hidden p-[0.5px]">
          <div
            ref={comboBarRef}
            className="h-full bg-[#ffd166] transition-[width] duration-75 ease-linear rounded-[0.5px]"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* HUD Kanan Atas: Tombol Kontrol, Counter Kuis & Progress Bar (16-Bit Bevel) */}
      <div className="absolute right-2 top-2 sm:right-3 sm:top-3 z-[260] flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Badge Kuis Selesai bila ada soal */}
          {hud.challengesTotal > 0 && (
            <div className="rounded-xs border-2 border-[#1a1c2c] bg-gradient-to-b from-[#242145] to-[#15132d] shadow-[3px_3px_0px_#0c0d19,inset_1px_1px_0px_rgba(255,255,255,0.2)] px-2.5 py-1 text-[9px] sm:text-[10px] font-pixel text-[#ffd166] pointer-events-none flex items-center gap-1.5">
              <PixelScroll size={11} className="shrink-0" />
              <span>KUIS {hud.challengesDone}/{hud.challengesTotal}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              controllerMutedRef.current?.setMuted?.(nextMuted);
              onMutedChange?.(nextMuted);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-xs border-2 border-[#1a1c2c] bg-gradient-to-b from-[#2e2a56] to-[#1a1836] text-[#ffd166] shadow-[3px_3px_0px_#0c0d19,inset_1px_1px_0px_rgba(255,255,255,0.2)] hover:brightness-110 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0c0d19] transition-all cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            <PixelAudio muted={isMuted} size={15} />
          </button>
          <button
            type="button"
            onClick={togglePause}
            className="h-8 w-8 flex items-center justify-center rounded-xs border-2 border-[#1a1c2c] bg-gradient-to-b from-[#2e2a56] to-[#1a1836] text-[#ffd166] shadow-[3px_3px_0px_#0c0d19,inset_1px_1px_0px_rgba(255,255,255,0.2)] hover:brightness-110 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0c0d19] transition-all cursor-pointer"
            aria-label={isPaused ? "Lanjutkan" : "Jeda"}
          >
            {isPaused ? <PixelPlay size={14} /> : <PixelPause size={14} />}
          </button>
          <button
            type="button"
            onClick={() => setShowHelp((visible) => !visible)}
            className="h-8 w-8 flex items-center justify-center rounded-xs border-2 border-[#1a1c2c] bg-gradient-to-b from-[#2e2a56] to-[#1a1836] text-[#ffd166] shadow-[3px_3px_0px_#0c0d19,inset_1px_1px_0px_rgba(255,255,255,0.2)] hover:brightness-110 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0c0d19] transition-all cursor-pointer"
            aria-label="Cara main"
          >
            <PixelHelp size={14} />
          </button>
        </div>

        {/* Progress Bar Level Berbingkai Piksel */}
        <div className="flex h-2.5 w-28 sm:w-36 items-center rounded-xs border-2 border-[#1a1c2c] bg-[#0c0d19] overflow-hidden p-0.5 shadow-[2px_2px_0px_#0c0d19]">
          <div
            className="h-full bg-gradient-to-r from-[#e67e22] via-[#f39c12] to-[#ffd166] rounded-xs transition-[width] duration-200"
            style={{ width: `${Math.max(2, hud.progressPercent ?? 0)}%` }}
          />
        </div>
      </div>

      {/* Help Popup 16-Bit */}
      {showHelp && (
        <div className="absolute right-2 top-12 sm:right-3 sm:top-14 z-[270] max-w-56 sm:max-w-64 rounded-xs border-2 border-[#1a1c2c] bg-[#1a1833]/98 backdrop-blur-md p-3.5 text-xs leading-relaxed text-gray-200 shadow-[4px_4px_0px_#0c0d19] font-sans">
          <p className="font-pixel text-[9px] text-[#ffd166] mb-2 uppercase flex items-center gap-1.5 border-b border-white/10 pb-1.5">
            <PixelGamepad size={13} className="shrink-0" />
            <span>Panduan Kontrol:</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            Panah / A-D gerak, Spasi / W lompat, F / J / <PixelSword size={11} className="inline align-middle mx-0.5" /> serang monster. Tekan E atau <PixelChat size={11} className="inline align-middle mx-0.5" /> saat dekat pemandu kelinci untuk membuka kuis rahasia!
          </p>
        </div>
      )}

      {/* Loading Overlay (C3) */}
      {phase === "loading" && (
        <div className="absolute inset-0 z-[270] flex flex-col items-center justify-center bg-[#121324] font-pixel text-white">
          <PixelGamepad size={36} className="mb-3 text-[#ffd166] animate-bounce" />
          <p className="text-xs text-[#ffd166] animate-pulse">Memuat Petualangan...</p>
          <p className="text-[9px] text-gray-400 mt-2 font-sans">Menyiapkan dunia 16-bit...</p>
        </div>
      )}

      {/* Error Overlay with Retry Button (C3) */}
      {phase === "error" && (
        <div className="absolute inset-0 z-[270] flex flex-col items-center justify-center bg-[#121324] font-pixel text-white p-4">
          <PixelAlert size={36} className="mb-3 text-[#ff6b6b]" />
          <p className="text-xs text-[#ff6b6b] mb-2">Gagal Memuat Game</p>
          <p className="text-[10px] text-gray-400 font-sans mb-4 text-center max-w-xs">
            Terjadi kendala saat menyiapkan aset game. Periksa koneksi internet Anda.
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
            className="px-4 py-2 bg-[#ffd166] text-[#121324] rounded border-2 border-white hover:bg-yellow-400 font-pixel text-[10px] cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rpg-box-golden px-8 py-5 text-center text-white shadow-2xl">
            <h3 className="font-pixel text-sm text-[#ffd166] mb-1">GAME DIJEDA</h3>
            <p className="font-sans text-xs text-gray-300 flex items-center justify-center gap-1.5">
              <span>Tekan tombol</span>
              <PixelPlay size={12} className="inline text-[#ffd166]" />
              <span>untuk melanjutkan petualangan</span>
            </p>
          </div>
        </div>
      )}





      {/* Duo Cut-In Banner HTML HD (z-[290]) */}
      {duoCutInData && duoCutInData.visible && (
        <div className="absolute inset-0 z-[290] bg-black/75 flex items-center justify-center pointer-events-none select-none animate-fade-in overflow-hidden">
          <div className="w-[125%] py-4 -rotate-3 bg-gradient-to-r from-transparent via-[#b45309] to-transparent flex items-center justify-center border-y-2 border-[#ffd166] shadow-[0_0_30px_rgba(255,215,0,0.7)]">
            <div className="flex items-center gap-4 sm:gap-8 px-6 py-2.5 bg-[#1f1635]/95 border-2 border-[#ffd166]/80 rounded-xs shadow-[0_0_20px_rgba(255,215,0,0.6)]">
              <canvas ref={playerCutInCanvasRef} width={48} height={48} className="image-pixelated border-2 border-[#ffd166] rounded-xs bg-[#2e1d4b]" />
              <div className="flex flex-col items-center text-center">
                <span className="font-pixel text-xs sm:text-sm text-[#ffd166] tracking-widest animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  ★ DUO STARLIGHT SLASH! ★
                </span>
                <span className="text-[10px] sm:text-xs text-[#fed7aa] font-sans font-semibold tracking-wider mt-0.5">
                  Kekuatan Cinta & Persahabatan
                </span>
              </div>
              <canvas ref={partnerCutInCanvasRef} width={48} height={48} className="image-pixelated border-2 border-[#ffd166] rounded-xs bg-[#2e1d4b]" />
            </div>
          </div>
        </div>
      )}

      {/* Modal Kuis Tantangan (Fase D) */}
      {activeChallengeData && (
        <ChallengeModal
          challenge={activeChallengeData.challenge}
          index={activeChallengeData.index}
          total={activeChallengeData.total}
          onAnswered={handleAnswerChallenge}
        />
      )}

      {/* Modal Dialog Reuni Pasangan di Bawah Pohon Besar (Babak 2) */}
      {showReunionModal && (
        <ReunionModal
          avatar={avatar}
          isTouch={isTouch}
          isMuted={isMuted}
          onComplete={() => {
            setShowReunionModal(false);
            controllerMutedRef.current?.completePartnerReunion?.();
          }}
        />
      )}

      {/* Overlay Auto-Pause saat Tab / Aplikasi Beralih (Fase P-1) */}
      {isAutoPaused && (
        <div className="absolute inset-0 z-[320] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fade-in">
          <div className="rpg-box-golden max-w-sm w-full p-6 text-center text-white shadow-2xl relative">
            <div className="flex justify-center mb-3 text-[#ffd166]">
              <PixelPause size={32} />
            </div>
            <h3 className="font-pixel text-sm sm:text-base text-[#ffd166] mb-2 tracking-wide">
              GAME DIJEDA
            </h3>
            <p className="font-sans text-xs text-gray-300 mb-6 leading-relaxed">
              Game dijeda otomatis saat layar tidak aktif. Ketuk tombol di bawah untuk melanjutkan petualangan!
            </p>
            <RetroButton
              variant="primary"
              size="md"
              onClick={handleResumeAutoPause}
              className="w-full text-xs font-pixel py-3 flex items-center justify-center gap-2 animate-pulse"
            >
              <PixelPlay size={13} className="shrink-0 text-[#1a1c2c]" />
              <span>LANJUTKAN</span>
            </RetroButton>
          </div>
        </div>
      )}
    </div>
  );
}
