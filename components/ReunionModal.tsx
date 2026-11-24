"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import RetroButton from "./RetroButton";
import { PixelSword, PixelClose } from "./PixelIcons";
import { AvatarGender } from "@/lib/types";
import { drawAvatarPreview } from "@/lib/game/sprites";
import { playDialog } from "@/lib/game/sfx";

interface ReunionModalProps {
  avatar?: AvatarGender;
  isTouch?: boolean;
  isMuted?: boolean;
  onComplete: () => void;
}

export default function ReunionModal({
  avatar = "male",
  isTouch: _isTouch = false,
  isMuted = false,
  onComplete,
}: ReunionModalProps) {
  const partnerAvatar: AvatarGender = avatar === "female" ? "male" : "female";
  const partnerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayedCountRef = useRef<number>(0);

  const dialogueText =
    "Kamu akhirnya sampai! Kado spesialmu ada di depan sana, tapi Penjaga Kado menghalangi jalan. Ayo kita hadapi bersama!";
  const chars = useMemo(() => Array.from(dialogueText), [dialogueText]);
  const [displayedCount, setDisplayedCount] = useState<number>(0);
  const isTyping = displayedCount < chars.length;

  // Render preview avatar pasangan di potret canvas
  useEffect(() => {
    if (partnerCanvasRef.current) {
      drawAvatarPreview(partnerCanvasRef.current, partnerAvatar);
    }
  }, [partnerAvatar]);

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
          // Abaikan jika konteks audio belum siap
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
  }, [chars.length, isMuted]);

  // Navigasi pintar: klik saat mengetik -> selesaikan; saat selesai -> lanjut ke tahap berikutnya
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

    // Tahap 2: Teks sudah tampil penuh, selesaikan modal reuni
    onComplete();
  }, [chars.length, onComplete]);

  // Keyboard navigation (Spasi / Enter / Panah Kanan untuk lanjut, Esc untuk lewati)
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
      aria-label="Dialog Reuni Pasangan"
      className="fixed inset-0 z-[290] pointer-events-none flex flex-col justify-end p-2 sm:p-5 select-none animate-fade-in"
    >
      {/* Gradien gelap halus di bagian bawah agar kotak dialog sangat terbaca */}
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
          aria-label="Lewati Dialog Reuni"
        >
          <span>LEWATI</span>
          <span className="hidden sm:inline text-[8px] opacity-75">(ESC)</span>
          <PixelClose size={10} className="shrink-0" />
        </button>

        {/* Konten Dialog: Potret Rekan (Kiri) + Balon Dialog (Kanan) */}
        <div className="flex flex-row items-start gap-3 sm:gap-5">
          {/* Box Potret Pembicara (16-Bit Retro Portrait Box) */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#0c0d19] border-2 border-[#ffd166] rounded-xs shadow-[3px_3px_0px_#000] flex items-center justify-center relative overflow-hidden">
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
            </div>
          </div>

          {/* Area Naskah & Teks Typewriter */}
          <div className="flex-1 min-w-0">
            {/* Header Nama Pembicara */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-pixel text-[9px] sm:text-xs text-[#ffd166] tracking-wider uppercase bg-[#282548] px-2 py-0.5 border border-[#ffd166]/50 rounded-xs shadow-[1px_1px_0px_#000]">
                PARTNER PETUALANGAN
              </span>
              <span className="font-pixel text-[8px] sm:text-[9px] text-[#ffd166]/60 hidden sm:inline">
                Babak 2: Reuni di Puncak Pohon Rindang
              </span>
            </div>

            {/* Kotak Naskah Typewriter Tajam */}
            <div className="min-h-[4rem] sm:min-h-[4.5rem] flex flex-col justify-start">
              <p className="font-sans text-xs sm:text-sm text-[#f8f9fa] leading-relaxed select-text">
                {chars.slice(0, displayedCount).join("")}
                {isTyping && (
                  <span className="inline-block w-2 h-3.5 bg-[#ffd166] ml-0.5 animate-pulse align-middle" />
                )}
              </p>

              {/* Tombol Aksi saat Selesai Mengetik */}
              {!isTyping && (
                <div className="mt-3 pt-2 border-t border-[#ffd166]/25 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-[11px] text-[#ffd166]/80">
                    Partner kini mendampingimu berpetualang dan menyerang bersama!
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
                    <span>MAJU BERSAMA!</span>
                  </RetroButton>
                </div>
              )}
            </div>

            {/* Indikator Lanjut Berkedip di Pojok Kanan Bawah */}
            {isTyping ? null : (
              <div className="flex items-center justify-end gap-1.5 mt-1 text-[#ffd166] font-pixel text-[8px] sm:text-[9px] animate-bounce">
                <span>KLIK / SPASI UNTUK MAJU</span>
                <span className="text-xs">▼</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
