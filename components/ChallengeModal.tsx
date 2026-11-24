"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ChallengeItem } from "@/lib/types";
import { BUFF_META } from "@/lib/types";
import { playCorrect, playWrong } from "@/lib/game/sfx";
import PixelRibbonBanner from "./PixelRibbonBanner";
import PixelPhotoFrame from "./PixelPhotoFrame";

interface ChallengeModalProps {
  challenge: ChallengeItem;
  index: number;
  total: number;
  onAnswered: (correct: boolean) => void;
}

export default function ChallengeModal({
  challenge,
  index,
  total,
  onAnswered,
}: ChallengeModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bersihkan timer saat unmount agar bebas memory leak
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const buffMeta = BUFF_META[challenge.buff] || BUFF_META.shield;

  const handleSelectOption = (optIdx: number) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedIndex(optIdx);

    const isCorrect = optIdx === challenge.correctIndex;
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }

    // Feedback selama QUIZ_FEEDBACK_MS (1200 ms) sebelum menutup modal
    feedbackTimerRef.current = setTimeout(() => {
      onAnswered(isCorrect);
    }, 1200);
  };

  // Keyboard shortcut: tombol 1 sampai 4 untuk memilih opsi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isAnswered) return;
      if (e.key === "1") handleSelectOption(0);
      else if (e.key === "2") handleSelectOption(1);
      else if (e.key === "3") handleSelectOption(2);
      else if (e.key === "4") handleSelectOption(3);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered, challenge]);

  const isCorrectChoice = selectedIndex === challenge.correctIndex;
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-question"
      className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-[#0a0b14]/85 backdrop-blur-sm select-none animate-fade-in"
    >
      {/* Kartu Utama: Warm Parchment dengan Bingkai Piksel Gelap & Bayangan Berdimensi */}
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rpg-parchment-card p-4 sm:p-6 text-[#1a1c2c] flex flex-col gap-3.5 sm:gap-4">
        {/* Lis Dalam Emas & Ornamen Sudut */}
        <div className="absolute inset-1.5 border border-[#ffd166]/80 pointer-events-none" />
        <span className="absolute left-2.5 top-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />
        <span className="absolute right-2.5 top-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />
        <span className="absolute left-2.5 bottom-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />
        <span className="absolute right-2.5 bottom-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />

        {/* Header: Pita Judul Retro 16-Bit */}
        <div className="flex flex-col items-center pt-1">
          <PixelRibbonBanner
            title={`TANTANGAN ${index + 1}/${total}`}
            variant="crimson"
            className="w-full max-w-xs"
          />

          {/* Badge Hadiah Buff */}
          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-[#1a1c2c] text-[#ffd166] rounded-[2px] border border-[#ffd166]/50 shadow-[1px_1px_0px_#0c0d19]">
            <span className="text-xs" aria-hidden="true">{buffMeta.emoji}</span>
            <span className="font-pixel text-[8px] sm:text-[9px] uppercase tracking-wider">
              Hadiah: Buff {buffMeta.label}
            </span>
          </div>
        </div>

        {/* Layout Pertanyaan */}
        <div className="flex flex-col gap-3">
          {/* Foto Tantangan dengan Bingkai 9-Slice Emas & Permata Piksel */}
          {challenge.imageUrl && challenge.imageUrl.trim() && (
            <PixelPhotoFrame
              imageUrl={challenge.imageUrl}
              alt="Foto Petunjuk Tantangan"
              caption="Foto Bantuan Soal"
              maxHeight="max-h-48 sm:max-h-56"
            />
          )}

          {/* Pertanyaan Kuis (High-legibility font-sans di dalam panel parchment inset) */}
          <div className="rpg-parchment-inset p-3.5 sm:p-4 rounded-xs">
            <p
              className="font-sans font-semibold text-sm sm:text-base text-[#1a1c2c] leading-relaxed break-words"
              id="challenge-question"
            >
              {challenge.question}
            </p>
          </div>
        </div>

        {/* 4 Pilihan Ganda A - D dengan Tombol 16-Bit Berdimensi */}
        <div className="grid grid-cols-1 gap-2.5">
          {challenge.options.map((opt, optIdx) => {
            const isSelected = selectedIndex === optIdx;
            const isTheCorrectOne = optIdx === challenge.correctIndex;

            let buttonClass =
              "bg-white border-[#1a1c2c] text-[#1a1c2c] shadow-[3px_3px_0px_#0c0d19] hover:bg-[#fff9e6] hover:translate-y-[-1px] hover:shadow-[3px_4px_0px_#0c0d19]";

            if (isAnswered) {
              if (isTheCorrectOne) {
                buttonClass =
                  "!bg-[#2ed573] !border-[#042911] !text-[#042911] shadow-[3px_3px_0px_#042911]";
              } else if (isSelected) {
                buttonClass =
                  "!bg-[#ff4757] !border-[#1a1c2c] !text-white shadow-[3px_3px_0px_#1a1c2c]";
              } else {
                buttonClass =
                  "opacity-35 bg-[#e8e2d5] border-gray-400 text-gray-500 shadow-none";
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xs border-2 transition-all cursor-pointer font-sans ${buttonClass} ${
                  isAnswered ? "cursor-default" : "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0c0d19]"
                }`}
              >
                {/* Kotak Keycap Pilihan */}
                <span className="font-pixel text-[10px] sm:text-xs px-2.5 py-1 rounded-[2px] bg-[#1a1c2c] text-[#ffd166] border border-[#1a1c2c] shrink-0 mt-0.5 shadow-[1px_1px_0px_rgba(255,255,255,0.4)]">
                  {optionLabels[optIdx]}
                </span>
                <span className="flex-1 text-xs sm:text-sm font-medium leading-snug break-words self-center">
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback visual setelah menjawab */}
        {isAnswered && (
          <div
            className={`p-3 rounded-xs border-2 text-center text-xs sm:text-sm font-pixel animate-bounce shadow-[3px_3px_0px_#0c0d19] ${
              isCorrectChoice
                ? "bg-[#2ed573] border-[#042911] text-[#042911]"
                : "bg-[#ff4757] border-[#1a1c2c] text-white"
            }`}
          >
            {isCorrectChoice ? (
              <p>✨ JAWABAN BENAR! Buff {buffMeta.label} Aktif! ✨</p>
            ) : (
              <p>💔 KURANG TEPAT! HP Berkurang 1</p>
            )}
          </div>
        )}

        <div className="text-center text-[10px] sm:text-[11px] font-sans text-[#5c5446]">
          💡 Tips: Tekan tombol angka <span className="font-mono font-bold text-[#1a1c2c] bg-white px-1 py-0.5 border border-[#1a1c2c] rounded-[2px]">1</span>, <span className="font-mono font-bold text-[#1a1c2c] bg-white px-1 py-0.5 border border-[#1a1c2c] rounded-[2px]">2</span>, <span className="font-mono font-bold text-[#1a1c2c] bg-white px-1 py-0.5 border border-[#1a1c2c] rounded-[2px]">3</span>, atau <span className="font-mono font-bold text-[#1a1c2c] bg-white px-1 py-0.5 border border-[#1a1c2c] rounded-[2px]">4</span> di keyboard.
        </div>
      </div>
    </div>
  );
}
