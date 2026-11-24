"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchGift, GiftData } from "@/lib/api";
import { GameController } from "@/lib/game/createGame";
import StartScreen from "@/components/StartScreen";
import PrologueModal from "@/components/PrologueModal";
import VirtualDPad from "@/components/VirtualDPad";
import GiftModal from "@/components/GiftModal";
import RetroButton from "@/components/RetroButton";
import { PixelGift, PixelAlert, PixelAudio, PixelSparkle } from "@/components/PixelIcons";
import {
  unlockAudio,
  startBgm,
  stopBgm,
  resolveBgmSource,
  onAudioStatus,
  AudioStatus,
  setMuted,
  destroyAudio,
} from "@/lib/game/sfx";

// GameCanvas dimuat secara dinamis tanpa SSR sesuai aturan PRD.md
const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
});

function LoadingScreen() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#1a1c2c] text-white font-pixel p-6">
      <div className="mb-6 flex justify-center animate-bounce">
        <PixelGift size={48} />
      </div>
      <p className="text-sm md:text-base text-[#f6d32d] animate-pulse text-center leading-relaxed">
        Menyiapkan Kado...
      </p>
      <p className="text-[10px] text-gray-400 mt-2">
        Mengambil data dari server...
      </p>
    </main>
  );
}

function PlayGiftContent() {
  const params = useParams();
  const giftId = params?.id as string;

  // State data kado
  const [giftData, setGiftData] = useState<GiftData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State alur game
  const [hasStarted, setHasStarted] = useState(false);
  const [showPrologue, setShowPrologue] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [nearbyChallengeId, setNearbyChallengeId] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const [loadProgress, setLoadProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [adventureSnapshot, setAdventureSnapshot] = useState<string | null>(null);

  // Safety timeout 5.5 detik: paksa loadProgress = 100 jika jaringan lambat
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadProgress((prev) => (prev < 100 ? 100 : prev));
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  // Ref kontrol game
  const gameControllerRef = useRef<GameController | null>(null);

  // Subscribe ke status audio engine
  useEffect(() => {
    return onAudioStatus((status) => {
      setAudioStatus(status);
    });
  }, []);

  // 1. Fetch data kado
  useEffect(() => {
    if (!giftId) return;

    let isMounted = true;

    fetchGift(giftId)
      .then((data) => {
        if (isMounted) {
          setGiftData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Kado tidak ditemukan atau telah kedaluwarsa."
          );
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [giftId]);

  // 2. Deteksi perangkat sentuh dan orientasi layar
  useEffect(() => {
    const checkTouchAndOrientation = () => {
      const touch =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
        window.innerWidth < 768;
      setIsTouchDevice(touch);

      const portrait =
        window.innerHeight > window.innerWidth && window.innerWidth < 900;
      setIsPortrait(portrait);
    };

    checkTouchAndOrientation();
    window.addEventListener("resize", checkTouchAndOrientation);
    window.addEventListener("orientationchange", checkTouchAndOrientation);

    return () => {
      window.removeEventListener("resize", checkTouchAndOrientation);
      window.removeEventListener("orientationchange", checkTouchAndOrientation);
    };
  }, []);

  // 3. Setup Audio saat Game Dimulai (SINKRON saat klik) & Tirai Transisi 0.3s
  const handleStartGame = () => {
    // Baris 1: SINKRON buka kunci Web Audio API
    unlockAudio();
    // Baris 2: SINKRON jalankan BGM
    startBgm(resolveBgmSource(giftData?.music_url));
    // Baris 3: Tirai transisi halus 0.3s menuju prolog
    setIsFading(true);
    setTimeout(() => {
      setHasStarted(true);
      setShowPrologue(true);
      setTimeout(() => {
        setIsFading(false);
      }, 150);
    }, 150);
  };

  // Bersihkan audio saat unmount
  useEffect(() => {
    return () => {
      stopBgm();
      destroyAudio();
    };
  }, []);

  // Menangani input dari Virtual D-Pad ke Game Controller
  const handleVirtualInput = (
    action: "left" | "right" | "jump" | "attack" | "interact",
    pressed: boolean
  ) => {
    if (gameControllerRef.current) {
      gameControllerRef.current.setInput(action, pressed);
    }
  };

  // Menangani kemenangan (pemain menyentuh kotak kado)
  const handleWin = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsWon(true);
      setTimeout(() => {
        setIsFading(false);
      }, 150);
    }, 150);
  }, []);

  // Menangani alur cutscene prolog
  const handlePrologueComplete = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setShowPrologue(false);
      gameControllerRef.current?.endPrologueCutscene?.();
      setTimeout(() => {
        setIsFading(false);
      }, 150);
    }, 150);
  }, []);

  const handlePrologueSceneChange = useCallback((scene: 1 | 2 | 3) => {
    gameControllerRef.current?.setPrologueScene?.(scene);
  }, []);

  // Main lagi (restart sesi permainan)
  const handlePlayAgain = () => {
    stopBgm();
    setIsWon(false);
    setHasStarted(false);
  };

  // --- TAMPILAN LOADING ---
  if (isLoading) {
    return <LoadingScreen />;
  }

  // --- TAMPILAN ERROR / NOT FOUND (FR-B2) ---
  if (errorMessage || !giftData) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#1a1c2c] text-white font-pixel p-6 text-center">
        <div className="max-w-md w-full border-4 border-white p-6 md:p-8 bg-[#11121d] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-4 flex justify-center">
            <PixelAlert size={44} />
          </div>
          <h1 className="text-xs md:text-sm text-[#e03131] mb-4 leading-relaxed">
            404: KADO TIDAK DITEMUKAN
          </h1>
          <p className="text-[10px] md:text-xs text-gray-300 mb-6 leading-relaxed">
            {errorMessage || "Kado tidak ditemukan atau telah kedaluwarsa."}
          </p>
          <Link href="/create">
            <RetroButton variant="primary" size="md" className="w-full">
              <span className="flex items-center justify-center gap-1.5">
                <PixelSparkle size={13} />
                <span>Buat Kado Sendiri</span>
              </span>
            </RetroButton>
          </Link>
        </div>
      </main>
    );
  }

  // --- TAMPILAN UTAMA GAMEPLAY ---
  return (
    <main className="relative w-full h-[100dvh] bg-[#1a1c2c] overflow-hidden select-none">
      {/* 1. Start Screen Overlay */}
      {!hasStarted && (
        <StartScreen
          receiverName={giftData.receiver_name}
          onStart={handleStartGame}
          loadProgress={loadProgress}
        />
      )}

      {/* 1.5. Prologue JRPG Cutscene Dialogue Box (z-[290]) */}
      {hasStarted && showPrologue && (
        <PrologueModal
          receiverName={giftData.receiver_name}
          avatar={giftData.avatar}
          isTouch={isTouchDevice}
          isMuted={isMuted}
          onSceneChange={handlePrologueSceneChange}
          onComplete={handlePrologueComplete}
        />
      )}

      {/* 2. Banner Saran Mode Landscape untuk HP Portrait (tidak memblokir permainan) */}
      {isPortrait && isTouchDevice && hasStarted && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-black/80 border border-yellow-400 px-3 py-1 text-[9px] text-[#f6d32d] font-pixel pointer-events-none rounded">
          ↻ Putar layar Anda (Landscape disarankan)
        </div>
      )}

      {/* Indikator Audio Terblokir (Fallback Non-Modal Autoplay) */}
      {hasStarted && audioStatus === "blocked" && (
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            startBgm(resolveBgmSource(giftData?.music_url));
          }}
          className="fixed bottom-4 right-4 z-[280] bg-[#1a1c2c]/95 border-2 border-[#ffd166] text-[#ffd166] px-3.5 py-2 rounded-full font-pixel text-[9px] shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center gap-2 hover:bg-[#25283d] cursor-pointer animate-pulse"
        >
          <PixelAudio muted={true} size={15} />
          <span>Ketuk untuk menyalakan musik</span>
        </button>
      )}

      {/* 3. Kanvas Game KAPLAY */}
      <div className={!hasStarted ? "opacity-0 pointer-events-none absolute inset-0" : "relative w-full h-full"}>
        <GameCanvas
          onWin={handleWin}
          receiverName={giftData.receiver_name}
          avatar={giftData.avatar}
          challenges={giftData.challenges}
          memories={giftData.memory_messages}
          isTouch={isTouchDevice}
          isMuted={isMuted}
          isCutsceneActive={!hasStarted || showPrologue}
          onLoadProgress={(pct) => setLoadProgress((prev) => Math.max(prev, pct))}
          onAdventureSnapshot={(snap) => setAdventureSnapshot(snap)}
          onMutedChange={(muted) => {
            setMuted(muted);
            setIsMuted(muted);
          }}
          controllerRef={gameControllerRef}
          onNearbyChallengeChange={setNearbyChallengeId}
        />
      </div>

      {/* 5. Virtual D-Pad untuk Layar Sentuh / Mobile */}
      {hasStarted && !showPrologue && isTouchDevice && !isWon && (
        <VirtualDPad
          onInput={handleVirtualInput}
          showInteract={(giftData.challenges?.length ?? 0) > 0}
          interactEnabled={nearbyChallengeId !== null}
        />
      )}

      {/* 6. Modal Kado Terbuka (Gift Reveal) */}
      {isWon && (
        <GiftModal
          receiverName={giftData.receiver_name}
          messageText={giftData.message_text}
          imageUrl={giftData.image_url}
          adventureSnapshot={adventureSnapshot}
          onPlayAgain={handlePlayAgain}
          onPeacefulMode={() => {
            setIsFading(true);
            setTimeout(() => {
              setIsWon(false);
              gameControllerRef.current?.enterPeacefulMode?.();
              setIsFading(false);
            }, 300);
          }}
        />
      )}

      {/* Tirai Transisi Fade-In / Fade-Out 0.3s Antar Adegan (Fase P-1) */}
      <div
        className={`fixed inset-0 bg-black z-[450] pointer-events-none transition-opacity duration-300 ${
          isFading ? "opacity-100" : "opacity-0"
        }`}
      />
    </main>
  );
}

export default function PlayGiftPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PlayGiftContent />
    </Suspense>
  );
}
