"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import RetroButton from "./RetroButton";
import {
  PixelSword,
  PixelChat,
  PixelTouch,
  PixelClose,
  PixelGamepad,
} from "./PixelIcons";
import { AvatarGender } from "@/lib/types";
import { drawAvatarPreview } from "@/lib/game/sprites";
import { playDialog } from "@/lib/game/sfx";

interface PrologueModalProps {
  receiverName: string;
  avatar?: AvatarGender;
  isTouch?: boolean;
  isMuted?: boolean;
  onSceneChange?: (scene: 1 | 2 | 3) => void;
  onComplete: () => void;
}

export default function PrologueModal({
  receiverName,
  avatar = "male",
  isTouch = false,
  isMuted = false,
  onSceneChange,
  onComplete,
}: PrologueModalProps) {
  const [scene, setScene] = useState<1 | 2 | 3>(1);
  const [displayedCount, setDisplayedCount] = useState<number>(0);
  const partnerAvatar: AvatarGender = avatar === "female" ? "male" : "female";
  const partnerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayedCountRef = useRef<number>(0);

  // Definisi naskah dialog tiap adegan (v4.0 MMORPG Live Cutscene)
  const scenes = useMemo(() => [
    {
      id: 1 as const,
      speaker: "PENJAGA KADO (SHADOW BOSS)",
      title: "Adegan 1: Pencurian di Puncak Senja",
      text: `Bwahahaha! Kado terindah yang dipersiapkan untuk ${receiverName} ini terlalu berharga untukmu! Aku telah membawanya kabur ke puncak atap kota. Buktikan ketulusan cintamu jika kau berani merebutnya kembali dariku!`,
    },
    {
      id: 2 as const,
      speaker: "PARTNER PETUALANGAN",
      title: "Adegan 2: Panggilan Telepati Rekan",
      text: `Gawat! Kotak kado spesial ${receiverName} direbut oleh monster bayangan itu! Aku sudah mengejarnya lebih dulu ke arah Pohon Besar. Cepat susul aku, jangan biarkan dia lolos! Mari kita rebut kado itu bersama!`,
    },
    {
      id: 3 as const,
      speaker: "PANDUAN QUEST PETUALANGAN",
      title: "Adegan 3: Siap Berangkat",
      text: `Perjalananmu dimulai sekarang! Taklukkan monster bayangan, kumpulkan 4 Bintang Kenangan, selesaikan kuis tantangan dari penjaga kota untuk mendapatkan buff pertempuran, dan selamatkan kado untuk ${receiverName}!`,
    },
  ], [receiverName]);

  const currentSceneData = scenes[scene - 1];
  const fullText = currentSceneData.text;
  const chars = useMemo(() => Array.from(fullText), [fullText]);
  const isTyping = displayedCount < chars.length;

  // Render preview avatar pasangan saat membuka adegan 2
  useEffect(() => {
    if (scene === 2 && partnerCanvasRef.current) {
      drawAvatarPreview(partnerCanvasRef.current, partnerAvatar);
    }
  }, [scene, partnerAvatar]);

  // Efek Typewriter (~28ms per karakter) + SFX retro blip tiap 2 karakter
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    let charIdx = 0;
    displayedCountRef.current = 0;

    timerRef.current = setInterval(() => {
      charIdx++;
      displayedCountRef.current = charIdx;
      setDisplayedCount(charIdx);

      if (charIdx % 2 === 0 && !isMuted) {
        try {
          playDialog();
        } catch {
          // Abaikan bila audio konteks belum siap
        }
      }

      if (charIdx >= chars.length) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 28);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [scene, chars.length, isMuted]);

  // Fungsi navigasi adegan (Smart Interaction: klik/spasi saat mengetik -> selesaikan; saat selesai -> lanjut)
  const handleAdvance = useCallback(() => {
    // Tahap 1: Jika masih mengetik, batalkan timer aktif dan tampilkan 100% teks seketika
    if (timerRef.current !== null || displayedCountRef.current < chars.length) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      displayedCountRef.current = chars.length;
      setDisplayedCount(chars.length);
      return;
    }

    // Tahap 2: Teks sudah tampil penuh, lanjut ke adegan berikutnya atau selesai
    if (scene < 3) {
      const next = (scene + 1) as 1 | 2 | 3;
      setScene(next);
      setDisplayedCount(0);
      displayedCountRef.current = 0;
      onSceneChange?.(next);
    } else {
      onComplete();
    }
  }, [chars.length, scene, onSceneChange, onComplete]);

  // Dukungan navigasi keyboard (Spasi / Enter / Panah Kanan untuk lanjut, Esc untuk lewati)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onComplete();
      } else if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAdvance, onComplete]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Prolog Petualangan MMORPG"
      className="fixed inset-0 z-[290] pointer-events-none flex flex-col justify-end p-2 sm:p-5 select-none animate-fade-in"
    >
      {/* Gradien gelap halus di bagian bawah agar kotak dialog sangat terbaca tanpa menutupi kanvas aksi */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

      {/* Kotak Dialog JRPG Bawah (16-Bit Gold Bevel Frame) */}
      <div
        onClick={handleAdvance}
        className="pointer-events-auto relative w-full max-w-4xl mx-auto bg-[#121324]/95 border-2 sm:border-4 border-[#ffd166] text-[#ffd166] shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-3 sm:p-5 rounded-xs cursor-pointer transition-all active:scale-[0.999]"
      >
        {/* Tombol Lewati (ESC) di Pojok Kanan Atas Dialog Box */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="absolute -top-3.5 right-2 sm:right-4 z-20 flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#1a1c2c] border border-[#ffd166] text-[#ffd166] hover:bg-[#282548] font-pixel text-[8px] sm:text-[9px] cursor-pointer shadow-[2px_2px_0px_#0c0d19] transition-all active:translate-y-[1px]"
          aria-label="Lewati Prolog"
        >
          <span>LEWATI</span>
          <span className="hidden sm:inline text-[8px] opacity-75">(ESC)</span>
          <PixelClose size={10} className="shrink-0" />
        </button>

        {/* Konten Dialog: Potret Pembicara (Kiri) + Balon Dialog (Kanan) */}
        <div className="flex flex-row items-start gap-3 sm:gap-5">
          {/* Box Potret Pembicara (16-Bit Retro Portrait Box) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#0c0d19] border-2 border-[#ffd166] rounded-xs shadow-[3px_3px_0px_#000] flex items-center justify-center relative overflow-hidden">
              {/* Scene 1: Penjaga Kado (Shadow Boss Silhouette) */}
              {scene === 1 && (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#2a1142] to-[#0c0d19]">
                  <div className="absolute inset-0 bg-[#8e44ad]/20 animate-pulse" />
                  <svg
                    className="w-10 h-10 sm:w-14 sm:h-14 text-[#9b59b6] filter drop-shadow-[0_0_8px_rgba(155,89,182,0.8)]"
                    viewBox="0 0 32 32"
                    fill="none"
                    style={{ imageRendering: "pixelated" }}
                  >
                    {/* Siluet Tengkorak / Ksatria Bayangan */}
                    <rect x="10" y="4" width="12" height="14" fill="#6c3483" />
                    <rect x="8" y="10" width="16" height="8" fill="#5b2c6f" />
                    <rect x="12" y="8" width="8" height="6" fill="#8e44ad" />
                    {/* Mata Bersinar Ungu Terang */}
                    <rect x="11" y="11" width="3" height="2" fill="#f4d03f" />
                    <rect x="18" y="11" width="3" height="2" fill="#f4d03f" />
                    {/* Gigi / Rahang */}
                    <rect x="12" y="18" width="8" height="4" fill="#4a235a" />
                    <rect x="13" y="19" width="2" height="3" fill="#ebf5fb" />
                    <rect x="17" y="19" width="2" height="3" fill="#ebf5fb" />
                    {/* Tanduk / Helm Bayangan */}
                    <polygon points="8,10 6,4 10,7" fill="#8e44ad" />
                    <polygon points="24,10 26,4 22,7" fill="#8e44ad" />
                  </svg>
                  <span className="absolute bottom-0 inset-x-0 text-center font-pixel text-[6px] sm:text-[7px] text-[#ffd166] bg-black/70">
                    BOSS
                  </span>
                </div>
              )}

              {/* Scene 2: Partner Avatar Canvas */}
              {scene === 2 && (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1a2a3a] to-[#0c0d19]">
                  <canvas
                    ref={partnerCanvasRef}
                    width={32}
                    height={32}
                    className="w-12 h-12 sm:w-16 sm:h-16 pixel-canvas"
                  />
                  <span className="absolute bottom-0 inset-x-0 text-center font-pixel text-[6px] sm:text-[7px] text-[#ffd166] bg-black/70">
                    PARTNER
                  </span>
                </div>
              )}

              {/* Scene 3: Panduan Quest & Pemain */}
              {scene === 3 && (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1c2c3e] to-[#0c0d19]">
                  <div className="absolute inset-0 bg-[#f1c40f]/15 animate-pulse" />
                  <div className="flex flex-col items-center justify-center text-[#ffd166]">
                    <PixelGamepad size={22} className="sm:hidden" />
                    <PixelGamepad size={30} className="hidden sm:block" />
                  </div>
                  <span className="absolute bottom-0 inset-x-0 text-center font-pixel text-[6px] sm:text-[7px] text-[#ffd166] bg-black/70">
                    PANDUAN
                  </span>
                </div>
              )}
            </div>

            {/* Indikator Titik 1-2-3 di Bawah Potret */}
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`transition-all ${
                    scene === s
                      ? "w-4 h-1.5 bg-[#ffd166] rounded-full"
                      : "w-1.5 h-1.5 bg-[#ffd166]/30 rounded-full"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Area Naskah & Teks Typewriter */}
          <div className="flex-1 min-w-0">
            {/* Header Nama Pembicara */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-pixel text-[9px] sm:text-xs text-[#ffd166] tracking-wider uppercase bg-[#282548] px-2 py-0.5 border border-[#ffd166]/50 rounded-xs shadow-[1px_1px_0px_#000]">
                {currentSceneData.speaker}
              </span>
              <span className="font-pixel text-[8px] sm:text-[9px] text-[#ffd166]/60 hidden sm:inline">
                {currentSceneData.title}
              </span>
            </div>

            {/* Kotak Naskah Typewriter Tajam */}
            <div className="min-h-[4.5rem] sm:min-h-[5rem] flex flex-col justify-start">
              <p className="font-sans text-xs sm:text-sm text-[#f8f9fa] leading-relaxed select-text">
                {chars.slice(0, displayedCount).join("")}
                {isTyping && (
                  <span className="inline-block w-2 h-3.5 bg-[#ffd166] ml-0.5 animate-pulse align-middle" />
                )}
              </p>

              {/* Konten Tambahan Khusus Adegan 3: Grid Panduan Kontrol & Tombol Mulai */}
              {scene === 3 && !isTyping && (
                <div className="mt-3 pt-2.5 border-t border-[#ffd166]/25 animate-fade-in space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-sans text-[11px] sm:text-xs text-[#f1f2f6]">
                    <div className="bg-[#1a1c2c] border border-[#ffd166]/40 p-1.5 rounded-xs flex items-center gap-1.5">
                      <span className="font-pixel text-[8px] px-1 py-0.5 bg-[#282548] text-[#ffd166] rounded-xs shrink-0">
                        A D / ← →
                      </span>
                      <span className="truncate">Gerak</span>
                    </div>
                    <div className="bg-[#1a1c2c] border border-[#ffd166]/40 p-1.5 rounded-xs flex items-center gap-1.5">
                      <span className="font-pixel text-[8px] px-1 py-0.5 bg-[#282548] text-[#ffd166] rounded-xs shrink-0">
                        W / Spasi
                      </span>
                      <span className="truncate">Lompat</span>
                    </div>
                    <div className="bg-[#1a1c2c] border border-[#ffd166]/40 p-1.5 rounded-xs flex items-center gap-1.5">
                      <span className="font-pixel text-[8px] px-1 py-0.5 bg-[#c0392b] text-white rounded-xs shrink-0 flex items-center gap-0.5">
                        F / J <PixelSword size={7} />
                      </span>
                      <span className="truncate">Serang</span>
                    </div>
                    <div className="bg-[#1a1c2c] border border-[#ffd166]/40 p-1.5 rounded-xs flex items-center gap-1.5">
                      <span className="font-pixel text-[8px] px-1 py-0.5 bg-[#f39c12] text-[#1a1c2c] font-bold rounded-xs shrink-0 flex items-center gap-0.5">
                        E <PixelChat size={7} />
                      </span>
                      <span className="truncate">Kuis / Bicara</span>
                    </div>
                  </div>

                  {/* Catatan untuk Mobile & Tombol Mulai */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] sm:text-[11px] text-[#ffd166]/80 flex items-center gap-1.5">
                      <PixelTouch size={12} className="shrink-0 text-[#2ecc71]" />
                      <span>
                        {isTouch
                          ? "Gunakan D-Pad dan tombol aksi di layar HP Anda."
                          : "Gunakan keyboard atau kontrol sentuh bila layar HP."}
                      </span>
                    </span>

                    <RetroButton
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onComplete();
                      }}
                      className="text-[10px] sm:text-xs py-2 px-5 font-pixel animate-pulse flex items-center gap-1.5 shadow-[3px_3px_0px_#000] shrink-0"
                    >
                      <PixelSword size={12} className="shrink-0 text-[#1a1c2c]" />
                      <span>MULAI PETUALANGAN!</span>
                    </RetroButton>
                  </div>
                </div>
              )}
            </div>

            {/* Indikator Lanjut Berkedip di Pojok Kanan Bawah */}
            {scene < 3 && !isTyping && (
              <div className="flex items-center justify-end gap-1.5 mt-1 text-[#ffd166] font-pixel text-[9px] sm:text-[10px] animate-bounce">
                <span>KLIK / SPASI UNTUK LANJUT</span>
                <span className="text-xs">▼</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
