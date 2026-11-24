"use client";

import React from "react";

interface PixelRibbonBannerProps {
  title: string;
  subtitle?: string;
  variant?: "crimson" | "indigo" | "gold";
  className?: string;
}

export default function PixelRibbonBanner({
  title,
  subtitle,
  variant = "crimson",
  className = "",
}: PixelRibbonBannerProps) {
  // Palet pita 16-bit RPG klasik
  const theme = {
    crimson: {
      center: "bg-gradient-to-b from-[#c0392b] via-[#a93226] to-[#78281f] text-white",
      highlight: "border-t-[#e74c3c] border-b-[#4d1611]",
      wing: "bg-[#78281f] border-[#1a1c2c]",
      foldShadow: "#4d1611",
      goldTrim: "text-[#ffd166]",
    },
    indigo: {
      center: "bg-gradient-to-b from-[#2d2856] via-[#201d40] to-[#15132d] text-white",
      highlight: "border-t-[#484080] border-b-[#0e0c20]",
      wing: "bg-[#15132d] border-[#1a1c2c]",
      foldShadow: "#0b0a17",
      goldTrim: "text-[#ffd166]",
    },
    gold: {
      center: "bg-gradient-to-b from-[#ffbe3b] via-[#e5a93c] to-[#b37a1f] text-[#1c1400]",
      highlight: "border-t-[#ffdf80] border-b-[#7a5010]",
      wing: "bg-[#b37a1f] border-[#1a1c2c]",
      foldShadow: "#613f0a",
      goldTrim: "text-[#1c1400]",
    },
  }[variant];

  return (
    <div className={`relative flex items-center justify-center my-2 select-none ${className}`}>
      {/* Sayap Pita Kiri (Left Wing with Fishtail Notch) */}
      <div className="absolute -left-3 sm:-left-4 top-2 bottom-1 w-5 sm:w-6 pointer-events-none">
        <svg
          viewBox="0 0 24 32"
          className="w-full h-full filter drop-shadow-[2px_2px_0px_#0c0d19]"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
        >
          {/* Sayap pita merah dengan takik segitiga di kiri */}
          <polygon
            points="24,0 4,0 12,16 4,32 24,32"
            fill={variant === "gold" ? "#b37a1f" : variant === "indigo" ? "#15132d" : "#78281f"}
            stroke="#1a1c2c"
            strokeWidth="2"
          />
          {/* Garis lis emas atas sayap */}
          <line x1="4" y1="2" x2="24" y2="2" stroke="#ffd166" strokeWidth="2" />
        </svg>
      </div>

      {/* Lipatan Bayangan Kiri (Shadow fold between center & wing) */}
      <div
        className="absolute -left-1 top-full -mt-2 w-0 h-0 border-t-[8px] border-r-[8px] border-r-transparent pointer-events-none z-0"
        style={{ borderTopColor: theme.foldShadow }}
      />

      {/* Badan Pita Tengah (Center Plaque) */}
      <div
        className={`relative z-10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xs border-2 border-[#1a1c2c] ${theme.center} ${theme.highlight} shadow-[0_4px_12px_rgba(0,0,0,0.5),3px_3px_0px_#0c0d19]`}
      >
        {/* Lis Jahitan Emas Atas & Bawah */}
        <div className="absolute inset-x-2 top-1 h-[2px] bg-[#ffd166]/70 pointer-events-none" />
        <div className="absolute inset-x-2 bottom-1 h-[2px] bg-[#ffd166]/50 pointer-events-none" />

        {/* Titik Paku Keling Emas di Sudut */}
        <span className="absolute left-1.5 top-1.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] rounded-[1px]" />
        <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] rounded-[1px]" />
        <span className="absolute left-1.5 bottom-1.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] rounded-[1px]" />
        <span className="absolute right-1.5 bottom-1.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] rounded-[1px]" />

        <div className="text-center px-2">
          <h2 className="font-pixel text-xs sm:text-sm tracking-wider uppercase font-bold text-shadow-sm break-words">
            {title}
          </h2>
          {subtitle && (
            <p className={`font-pixel text-[8px] sm:text-[9px] mt-0.5 tracking-tight ${theme.goldTrim}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Lipatan Bayangan Kanan (Shadow fold between center & wing) */}
      <div
        className="absolute -right-1 top-full -mt-2 w-0 h-0 border-t-[8px] border-l-[8px] border-l-transparent pointer-events-none z-0"
        style={{ borderTopColor: theme.foldShadow }}
      />

      {/* Sayap Pita Kanan (Right Wing with Fishtail Notch) */}
      <div className="absolute -right-3 sm:-right-4 top-2 bottom-1 w-5 sm:w-6 pointer-events-none">
        <svg
          viewBox="0 0 24 32"
          className="w-full h-full filter drop-shadow-[2px_2px_0px_#0c0d19]"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
        >
          {/* Sayap pita merah dengan takik segitiga di kanan */}
          <polygon
            points="0,0 20,0 12,16 20,32 0,32"
            fill={variant === "gold" ? "#b37a1f" : variant === "indigo" ? "#15132d" : "#78281f"}
            stroke="#1a1c2c"
            strokeWidth="2"
          />
          {/* Garis lis emas atas sayap */}
          <line x1="0" y1="2" x2="20" y2="2" stroke="#ffd166" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
