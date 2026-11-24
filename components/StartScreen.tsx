"use client";

import React from "react";
import RetroButton from "./RetroButton";
import PixelRibbonBanner from "./PixelRibbonBanner";
import {
  PixelSparkle,
  PixelStar,
  PixelPlay,
} from "./PixelIcons";

interface StartScreenProps {
  receiverName: string;
  onStart: () => void;
  loadProgress?: number;
}

export default function StartScreen({
  receiverName,
  onStart,
  loadProgress = 100,
}: StartScreenProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0c0d19]/90 backdrop-blur-md select-none starlight-bg">
      <div className="max-w-lg w-full rpg-box-golden p-6 sm:p-8 text-center text-white relative animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Floating Twinkling Stars */}
        <span className="absolute -top-3 -left-3 animate-pulse">
          <PixelSparkle size={18} />
        </span>
        <span className="absolute -top-3 -right-3 animate-pulse" style={{ animationDelay: "700ms" }}>
          <PixelStar size={16} />
        </span>
        <span className="absolute -bottom-3 right-8 text-base text-[#ffd166] animate-pulse" style={{ animationDelay: "1200ms" }}>✦</span>

        {/* 16-Bit Chest Graphic */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#f6d32d]/25 blur-xl rounded-full animate-pulse" />
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 relative transform transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_12px_rgba(246,211,45,0.4)]"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ imageRendering: "pixelated" }}
            >
              {/* Chest Lid Base */}
              <rect x="5" y="6" width="22" height="10" rx="1" fill="#c0392b" />
              <rect x="6" y="7" width="20" height="2" fill="#e74c3c" />
              <rect x="5" y="15" width="22" height="2" fill="#78281f" />
              {/* Chest Body Base */}
              <rect x="5" y="16" width="22" height="11" fill="#962d22" />
              <rect x="6" y="25" width="20" height="2" fill="#4d1712" />
              {/* Gold Ribbon Vertical */}
              <rect x="13" y="6" width="6" height="21" fill="#f39c12" />
              <rect x="14" y="6" width="4" height="21" fill="#ffd166" />
              {/* Gold Ribbon Horizontal */}
              <rect x="5" y="14" width="22" height="4" fill="#e67e22" />
              <rect x="5" y="15" width="22" height="2" fill="#f6d32d" />
              {/* Gold Ribbon Bow at Top */}
              <path d="M11 3C11 3 13 4 15 5C13 6 11 6 11 3Z" fill="#ffd166" />
              <path d="M21 3C21 3 19 4 17 5C19 6 21 6 21 3Z" fill="#ffd166" />
              <rect x="14" y="4" width="4" height="3" fill="#e67e22" />
              <rect x="15" y="4" width="2" height="2" fill="#fff" />
              {/* Lock Plate */}
              <rect x="13" y="14" width="6" height="5" rx="1" fill="#f1c40f" />
              <rect x="15" y="16" width="2" height="2" fill="#2c3e50" />
              {/* Dark Outline Pixels */}
              <path
                d="M4 6H28V16H4V6ZM4 16H28V28H4V16Z"
                stroke="#151428"
                strokeWidth="2"
                strokeLinejoin="miter"
              />
            </svg>
          </div>
        </div>

        {/* Pita Judul Retro 16-Bit */}
        <PixelRibbonBanner
          title="SEBUAH PESAN UNTUKMU"
          subtitle="Petualangan Kado Digital 16-Bit"
          variant="gold"
          className="w-full max-w-sm mx-auto mb-4"
        />

        {/* Emotive Recipient Callout */}
        <p className="font-sans text-sm sm:text-base text-gray-200 mb-6 leading-relaxed">
          Seseorang telah menyiapkan sebuah kejutan istimewa dan penuh kenangan untukmu,{" "}
          <span className="font-pixel text-[#39d86f] text-sm sm:text-base block mt-2 px-3 py-1.5 bg-[#121324] border border-[#39d86f]/40 rounded-lg shadow-inner">
            {receiverName}
          </span>
        </p>

        {/* Preloader Bar 16-Bit Retro (Fase P-1) */}
        {loadProgress < 100 && (
          <div className="w-full mb-6 animate-fade-in">
            <div className="flex justify-between items-center text-[10px] font-pixel text-[#ffd166] mb-1.5 px-0.5">
              <span className="tracking-wide">MEMUAT ASET DIGITAL...</span>
              <span>{Math.round(loadProgress)}%</span>
            </div>
            {/* Bevel Box 16-Bit */}
            <div className="w-full h-4 bg-[#121324] border-2 border-[#856526] p-0.5 shadow-inner relative">
              <div
                className="h-full bg-gradient-to-r from-[#ffd166] to-[#39d86f] transition-all duration-150 ease-out shadow-[0_0_8px_rgba(57,216,111,0.5)]"
                style={{ width: `${Math.min(100, Math.max(0, loadProgress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Start Button */}
        <RetroButton
          variant="primary"
          size="lg"
          onClick={loadProgress >= 100 ? onStart : undefined}
          disabled={loadProgress < 100}
          className={`w-full text-xs sm:text-sm py-3.5 tracking-wider font-pixel flex items-center justify-center gap-2 ${
            loadProgress >= 100
              ? "animate-pulse"
              : "opacity-60 cursor-not-allowed pointer-events-none"
          }`}
        >
          <PixelPlay size={13} className="shrink-0 text-[#1a1c2c]" />
          <span>{loadProgress >= 100 ? "MULAI PETUALANGAN" : "MENYIAPKAN GAME..."}</span>
        </RetroButton>
      </div>
    </div>
  );
}
