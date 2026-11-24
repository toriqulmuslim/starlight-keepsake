"use client";

import React from "react";

interface IconBaseProps {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * PixelIcons — Pustaka Ikon SVG Piksel Murni 16-Bit
 * Seluruh ikon menggunakan shape-rendering="crispEdges" pada integer grid,
 * menjamin ketajaman absolut tanpa blur/interpolasi di layar mana pun.
 */

// 1. Hati Nyawa (Penuh atau Kosong)
export function PixelHeart({
  filled = true,
  size = 14,
  className = "",
  title,
}: IconBaseProps & { filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Luar Gelap */}
      <rect x="2" y="2" width="4" height="2" fill="#1a1c2c" />
      <rect x="10" y="2" width="4" height="2" fill="#1a1c2c" />
      <rect x="1" y="4" width="2" height="4" fill="#1a1c2c" />
      <rect x="6" y="3" width="4" height="2" fill="#1a1c2c" />
      <rect x="13" y="4" width="2" height="4" fill="#1a1c2c" />
      <rect x="2" y="8" width="2" height="2" fill="#1a1c2c" />
      <rect x="12" y="8" width="2" height="2" fill="#1a1c2c" />
      <rect x="3" y="10" width="2" height="2" fill="#1a1c2c" />
      <rect x="11" y="10" width="2" height="2" fill="#1a1c2c" />
      <rect x="5" y="12" width="2" height="2" fill="#1a1c2c" />
      <rect x="9" y="12" width="2" height="2" fill="#1a1c2c" />
      <rect x="7" y="14" width="2" height="1" fill="#1a1c2c" />

      {filled ? (
        <>
          {/* Badan Hati Merah Menyala */}
          <rect x="3" y="4" width="3" height="4" fill="#ff4757" />
          <rect x="10" y="4" width="3" height="4" fill="#ff4757" />
          <rect x="6" y="5" width="4" height="3" fill="#ff4757" />
          <rect x="4" y="8" width="8" height="2" fill="#ff4757" />
          <rect x="5" y="10" width="6" height="2" fill="#ff4757" />
          <rect x="7" y="12" width="2" height="2" fill="#ff4757" />

          {/* Kilauan Highlight Putih/Pink */}
          <rect x="3" y="4" width="2" height="2" fill="#ffb8b8" />
          <rect x="4" y="6" width="1" height="1" fill="#ffb8b8" />
          <rect x="10" y="4" width="1" height="1" fill="#ff7675" />

          {/* Bayangan Bawah Gelap */}
          <rect x="7" y="12" width="2" height="2" fill="#b31d28" />
          <rect x="9" y="10" width="2" height="2" fill="#b31d28" />
          <rect x="10" y="8" width="2" height="2" fill="#b31d28" />
        </>
      ) : (
        <>
          {/* Hati Kosong / Redup */}
          <rect x="3" y="4" width="3" height="4" fill="#3a3556" />
          <rect x="10" y="4" width="3" height="4" fill="#3a3556" />
          <rect x="6" y="5" width="4" height="3" fill="#3a3556" />
          <rect x="4" y="8" width="8" height="2" fill="#2d2944" />
          <rect x="5" y="10" width="6" height="2" fill="#242138" />
          <rect x="7" y="12" width="2" height="2" fill="#242138" />
        </>
      )}
    </svg>
  );
}

// 2. Bintang Kenangan (Gold Star)
export function PixelStar({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Gelap */}
      <rect x="7" y="1" width="2" height="2" fill="#1a1c2c" />
      <rect x="6" y="3" width="4" height="1" fill="#1a1c2c" />
      <rect x="1" y="6" width="14" height="2" fill="#1a1c2c" />
      <rect x="3" y="8" width="10" height="1" fill="#1a1c2c" />
      <rect x="4" y="9" width="8" height="1" fill="#1a1c2c" />
      <rect x="3" y="10" width="10" height="2" fill="#1a1c2c" />
      <rect x="2" y="12" width="4" height="2" fill="#1a1c2c" />
      <rect x="10" y="12" width="4" height="2" fill="#1a1c2c" />
      <rect x="1" y="14" width="3" height="1" fill="#1a1c2c" />
      <rect x="12" y="14" width="3" height="1" fill="#1a1c2c" />

      {/* Badan Emas */}
      <rect x="7" y="3" width="2" height="2" fill="#ffd166" />
      <rect x="6" y="5" width="4" height="1" fill="#ffd166" />
      <rect x="2" y="7" width="12" height="1" fill="#ffd166" />
      <rect x="4" y="8" width="8" height="2" fill="#ffd166" />
      <rect x="4" y="10" width="3" height="2" fill="#ffd166" />
      <rect x="9" y="10" width="3" height="2" fill="#ffd166" />
      <rect x="3" y="12" width="2" height="2" fill="#ffd166" />
      <rect x="11" y="12" width="2" height="2" fill="#ffd166" />

      {/* Highlight & Shadow */}
      <rect x="7" y="3" width="1" height="2" fill="#fffef0" />
      <rect x="6" y="5" width="2" height="1" fill="#fffef0" />
      <rect x="8" y="8" width="3" height="2" fill="#e59819" />
      <rect x="11" y="12" width="1" height="2" fill="#b36f0a" />
    </svg>
  );
}

// 3. Perisai Buff (Shield)
export function PixelShield({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Gelap */}
      <rect x="2" y="1" width="12" height="2" fill="#1a1c2c" />
      <rect x="1" y="3" width="2" height="7" fill="#1a1c2c" />
      <rect x="13" y="3" width="2" height="7" fill="#1a1c2c" />
      <rect x="2" y="10" width="2" height="2" fill="#1a1c2c" />
      <rect x="12" y="10" width="2" height="2" fill="#1a1c2c" />
      <rect x="4" y="12" width="2" height="2" fill="#1a1c2c" />
      <rect x="10" y="12" width="2" height="2" fill="#1a1c2c" />
      <rect x="6" y="14" width="4" height="2" fill="#1a1c2c" />

      {/* Bidang Perisai Twilight Indigo */}
      <rect x="3" y="3" width="10" height="7" fill="#2d2856" />
      <rect x="4" y="10" width="8" height="2" fill="#2d2856" />
      <rect x="6" y="12" width="4" height="2" fill="#2d2856" />

      {/* Salib / Lambang Emas di Tengah */}
      <rect x="7" y="4" width="2" height="8" fill="#ffd166" />
      <rect x="5" y="6" width="6" height="2" fill="#ffd166" />
      <rect x="7" y="6" width="2" height="2" fill="#fffef0" />
      <rect x="3" y="3" width="1" height="7" fill="#4d448c" />
    </svg>
  );
}

// 4. Petir Sepatu Kilat (Speed Buff Lightning)
export function PixelLightning({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Gelap */}
      <rect x="7" y="1" width="5" height="2" fill="#1a1c2c" />
      <rect x="6" y="3" width="3" height="3" fill="#1a1c2c" />
      <rect x="4" y="6" width="10" height="2" fill="#1a1c2c" />
      <rect x="3" y="8" width="4" height="2" fill="#1a1c2c" />
      <rect x="5" y="10" width="3" height="2" fill="#1a1c2c" />
      <rect x="6" y="12" width="3" height="2" fill="#1a1c2c" />
      <rect x="7" y="14" width="2" height="2" fill="#1a1c2c" />

      {/* Badan Kilat Kuning Emas */}
      <rect x="8" y="2" width="3" height="2" fill="#f6d32d" />
      <rect x="7" y="4" width="3" height="2" fill="#f6d32d" />
      <rect x="5" y="6" width="7" height="2" fill="#f6d32d" />
      <rect x="5" y="8" width="4" height="2" fill="#f6d32d" />
      <rect x="6" y="10" width="3" height="2" fill="#f6d32d" />
      <rect x="7" y="12" width="2" height="2" fill="#f6d32d" />

      {/* Highlight Terang */}
      <rect x="8" y="2" width="1" height="4" fill="#fffdf0" />
      <rect x="6" y="6" width="3" height="1" fill="#fffdf0" />
      <rect x="6" y="8" width="1" height="3" fill="#fffdf0" />
    </svg>
  );
}

// 5. Bintang Sihir / Kemilau (Sparkle Magic)
export function PixelSparkle({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Inti Kemilau 4 Arah */}
      <rect x="7" y="1" width="2" height="4" fill="#ffd166" />
      <rect x="7" y="11" width="2" height="4" fill="#ffd166" />
      <rect x="1" y="7" width="4" height="2" fill="#ffd166" />
      <rect x="11" y="7" width="4" height="2" fill="#ffd166" />
      <rect x="5" y="5" width="6" height="6" fill="#ffd166" />
      <rect x="6" y="6" width="4" height="4" fill="#ffffff" />
      {/* Aksen luar */}
      <rect x="7" y="0" width="2" height="1" fill="#1a1c2c" />
      <rect x="7" y="15" width="2" height="1" fill="#1a1c2c" />
      <rect x="0" y="7" width="1" height="2" fill="#1a1c2c" />
      <rect x="15" y="7" width="1" height="2" fill="#1a1c2c" />
    </svg>
  );
}

// 6. Pedang Aksi / Serang (Sword)
export function PixelSword({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bilah Pedang Baja Diagonal */}
      <rect x="13" y="1" width="2" height="2" fill="#ffffff" />
      <rect x="11" y="2" width="3" height="3" fill="#ffffff" />
      <rect x="9" y="4" width="3" height="3" fill="#ffffff" />
      <rect x="7" y="6" width="3" height="3" fill="#c7ecee" />
      <rect x="5" y="8" width="3" height="3" fill="#95afc0" />

      {/* Lis Gelap Bilah */}
      <rect x="14" y="0" width="2" height="1" fill="#1a1c2c" />
      <rect x="15" y="1" width="1" height="2" fill="#1a1c2c" />
      <rect x="12" y="1" width="1" height="1" fill="#1a1c2c" />
      <rect x="10" y="3" width="1" height="1" fill="#1a1c2c" />
      <rect x="8" y="5" width="1" height="1" fill="#1a1c2c" />

      {/* Pelindung Tangan Emas (Crossguard) */}
      <rect x="4" y="8" width="2" height="2" fill="#ffd166" />
      <rect x="6" y="10" width="2" height="2" fill="#ffd166" />
      <rect x="3" y="7" width="2" height="1" fill="#1a1c2c" />
      <rect x="7" y="11" width="1" height="2" fill="#1a1c2c" />

      {/* Gagang & Pommel Merah */}
      <rect x="3" y="11" width="2" height="2" fill="#b33939" />
      <rect x="1" y="13" width="2" height="2" fill="#ffd166" />
      <rect x="0" y="14" width="1" height="2" fill="#1a1c2c" />
      <rect x="1" y="15" width="2" height="1" fill="#1a1c2c" />
    </svg>
  );
}

// 7. Balon Obrolan Kuis (Chat Bubble)
export function PixelChat({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Gelap */}
      <rect x="3" y="2" width="10" height="1" fill="#1a1c2c" />
      <rect x="2" y="3" width="1" height="7" fill="#1a1c2c" />
      <rect x="13" y="3" width="1" height="7" fill="#1a1c2c" />
      <rect x="3" y="10" width="10" height="1" fill="#1a1c2c" />
      <rect x="3" y="11" width="2" height="2" fill="#1a1c2c" />
      <rect x="2" y="13" width="2" height="1" fill="#1a1c2c" />

      {/* Badan Balon Kuning Emas */}
      <rect x="3" y="3" width="10" height="7" fill="#ffd166" />
      <rect x="4" y="10" width="3" height="2" fill="#ffd166" />
      <rect x="3" y="12" width="2" height="1" fill="#ffd166" />

      {/* Titik-Titik Percakapan */}
      <rect x="4" y="6" width="2" height="2" fill="#1a1c2c" />
      <rect x="7" y="6" width="2" height="2" fill="#1a1c2c" />
      <rect x="10" y="6" width="2" height="2" fill="#1a1c2c" />
    </svg>
  );
}

// 8. Ikon Audio (Speaker / Muted)
export function PixelAudio({
  muted = false,
  size = 14,
  className = "",
  title,
}: IconBaseProps & { muted?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai & Corong Speaker */}
      <rect x="1" y="5" width="4" height="6" fill="#1a1c2c" />
      <rect x="2" y="6" width="3" height="4" fill="#ffd166" />
      <rect x="5" y="4" width="2" height="8" fill="#1a1c2c" />
      <rect x="7" y="3" width="2" height="10" fill="#1a1c2c" />
      <rect x="5" y="5" width="3" height="6" fill="#ffd166" />

      {muted ? (
        <>
          {/* Tanda Silang Merah Kirmizi (Muted) */}
          <rect x="10" y="5" width="2" height="2" fill="#ff4757" />
          <rect x="13" y="5" width="2" height="2" fill="#ff4757" />
          <rect x="11" y="7" width="3" height="2" fill="#ff4757" />
          <rect x="10" y="9" width="2" height="2" fill="#ff4757" />
          <rect x="13" y="9" width="2" height="2" fill="#ff4757" />
        </>
      ) : (
        <>
          {/* Gelombang Suara Emas (Unmuted) */}
          <rect x="10" y="6" width="1" height="4" fill="#ffd166" />
          <rect x="12" y="4" width="1" height="8" fill="#ffd166" />
          <rect x="14" y="2" width="1" height="12" fill="#ffd166" />
        </>
      )}
    </svg>
  );
}

// 9. Ikon Jeda (Pause) & Putar (Play)
export function PixelPause({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <rect x="3" y="3" width="3" height="10" fill="#ffd166" />
      <rect x="2" y="2" width="5" height="1" fill="#1a1c2c" />
      <rect x="2" y="13" width="5" height="1" fill="#1a1c2c" />
      <rect x="2" y="3" width="1" height="10" fill="#1a1c2c" />
      <rect x="6" y="3" width="1" height="10" fill="#1a1c2c" />

      <rect x="10" y="3" width="3" height="10" fill="#ffd166" />
      <rect x="9" y="2" width="5" height="1" fill="#1a1c2c" />
      <rect x="9" y="13" width="5" height="1" fill="#1a1c2c" />
      <rect x="9" y="3" width="1" height="10" fill="#1a1c2c" />
      <rect x="13" y="3" width="1" height="10" fill="#1a1c2c" />
    </svg>
  );
}

export function PixelPlay({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <rect x="4" y="2" width="2" height="12" fill="#1a1c2c" />
      <rect x="6" y="3" width="2" height="10" fill="#ffd166" />
      <rect x="8" y="5" width="2" height="6" fill="#ffd166" />
      <rect x="10" y="6" width="2" height="4" fill="#ffd166" />
      <rect x="12" y="7" width="2" height="2" fill="#ffd166" />
      {/* Lis kanan segitiga */}
      <rect x="6" y="2" width="2" height="1" fill="#1a1c2c" />
      <rect x="8" y="4" width="2" height="1" fill="#1a1c2c" />
      <rect x="10" y="5" width="2" height="1" fill="#1a1c2c" />
      <rect x="12" y="6" width="2" height="1" fill="#1a1c2c" />
      <rect x="14" y="7" width="1" height="2" fill="#1a1c2c" />
      <rect x="12" y="9" width="2" height="1" fill="#1a1c2c" />
      <rect x="10" y="10" width="2" height="1" fill="#1a1c2c" />
      <rect x="8" y="11" width="2" height="1" fill="#1a1c2c" />
      <rect x="6" y="13" width="2" height="1" fill="#1a1c2c" />
    </svg>
  );
}

// 10. Ikon Bantuan (Question Mark)
export function PixelHelp({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <rect x="5" y="2" width="6" height="2" fill="#ffd166" />
      <rect x="10" y="4" width="2" height="3" fill="#ffd166" />
      <rect x="7" y="7" width="3" height="2" fill="#ffd166" />
      <rect x="7" y="9" width="2" height="2" fill="#ffd166" />
      <rect x="7" y="12" width="2" height="2" fill="#ffd166" />
      {/* Bingkai outline */}
      <rect x="4" y="1" width="8" height="1" fill="#1a1c2c" />
      <rect x="12" y="3" width="1" height="4" fill="#1a1c2c" />
      <rect x="4" y="2" width="1" height="3" fill="#1a1c2c" />
    </svg>
  );
}

// 11. Ikon Gulungan Kertas / Scroll
export function PixelScroll({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Gulungan Atas */}
      <rect x="3" y="2" width="10" height="3" fill="#f7d794" />
      <rect x="2" y="1" width="12" height="1" fill="#1a1c2c" />
      <rect x="2" y="5" width="12" height="1" fill="#1a1c2c" />
      {/* Lembaran Tengah */}
      <rect x="4" y="5" width="8" height="6" fill="#fffdf0" />
      <rect x="6" y="6" width="4" height="1" fill="#c49b63" />
      <rect x="6" y="8" width="4" height="1" fill="#c49b63" />
      {/* Gulungan Bawah */}
      <rect x="3" y="11" width="10" height="3" fill="#f7d794" />
      <rect x="2" y="11" width="12" height="1" fill="#1a1c2c" />
      <rect x="2" y="14" width="12" height="1" fill="#1a1c2c" />
      <rect x="1" y="2" width="2" height="3" fill="#cf6a87" />
      <rect x="13" y="11" width="2" height="3" fill="#cf6a87" />
    </svg>
  );
}

// 12. Ikon Jari Sentuh / Tap (Pointing Finger)
export function PixelTouch({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Jari Telunjuk Menunjuk ke Atas */}
      <rect x="7" y="1" width="3" height="8" fill="#ffd166" />
      <rect x="7" y="0" width="3" height="1" fill="#1a1c2c" />
      <rect x="6" y="1" width="1" height="8" fill="#1a1c2c" />
      <rect x="10" y="1" width="1" height="8" fill="#1a1c2c" />
      {/* Telapak Tangan */}
      <rect x="5" y="8" width="7" height="6" fill="#ffd166" />
      <rect x="4" y="8" width="1" height="6" fill="#1a1c2c" />
      <rect x="12" y="8" width="1" height="6" fill="#1a1c2c" />
      <rect x="5" y="14" width="7" height="1" fill="#1a1c2c" />
      {/* Highlight Kuku */}
      <rect x="8" y="1" width="1" height="2" fill="#fffef0" />
    </svg>
  );
}

// 13. Panah D-Pad 16-Bit (Left, Right, Up, Down)
export function PixelArrow({
  direction = "right",
  size = 18,
  className = "",
  title,
}: IconBaseProps & { direction?: "left" | "right" | "up" | "down" }) {
  const rotation = {
    right: "rotate(0deg)",
    down: "rotate(90deg)",
    left: "rotate(180deg)",
    up: "rotate(270deg)",
  }[direction];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transform: rotation,
        width: size,
        height: size,
      }}
      className={`select-none ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        aria-hidden={!title}
        role={title ? "img" : undefined}
      >
        {title && <title>{title}</title>}
        {/* Batang Panah */}
        <rect x="2" y="6" width="6" height="4" fill="#ffffff" />
        <rect x="2" y="5" width="6" height="1" fill="#1a1c2c" />
        <rect x="2" y="10" width="6" height="1" fill="#1a1c2c" />
        <rect x="1" y="6" width="1" height="4" fill="#1a1c2c" />
        {/* Kepala Panah */}
        <rect x="8" y="4" width="2" height="8" fill="#ffffff" />
        <rect x="10" y="5" width="2" height="6" fill="#ffffff" />
        <rect x="12" y="6" width="2" height="4" fill="#ffffff" />
        <rect x="14" y="7" width="1" height="2" fill="#ffffff" />
        {/* Lis Luar Kepala Panah */}
        <rect x="8" y="3" width="2" height="1" fill="#1a1c2c" />
        <rect x="10" y="4" width="2" height="1" fill="#1a1c2c" />
        <rect x="12" y="5" width="2" height="1" fill="#1a1c2c" />
        <rect x="14" y="6" width="2" height="1" fill="#1a1c2c" />
        <rect x="15" y="7" width="1" height="2" fill="#1a1c2c" />
        <rect x="14" y="9" width="2" height="1" fill="#1a1c2c" />
        <rect x="12" y="10" width="2" height="1" fill="#1a1c2c" />
        <rect x="10" y="11" width="2" height="1" fill="#1a1c2c" />
        <rect x="8" y="12" width="2" height="1" fill="#1a1c2c" />
      </svg>
    </div>
  );
}

// 14. Kontroler Game / Gamepad (Start Screen Badge)
export function PixelGamepad({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Badan Kontroler */}
      <rect x="2" y="4" width="12" height="8" fill="#3a3563" />
      <rect x="1" y="5" width="14" height="6" fill="#3a3563" />
      <rect x="2" y="3" width="12" height="1" fill="#1a1c2c" />
      <rect x="2" y="12" width="12" height="1" fill="#1a1c2c" />
      <rect x="0" y="5" width="1" height="6" fill="#1a1c2c" />
      <rect x="15" y="5" width="1" height="6" fill="#1a1c2c" />
      {/* D-Pad Kiri */}
      <rect x="3" y="7" width="4" height="2" fill="#ffd166" />
      <rect x="4" y="6" width="2" height="4" fill="#ffd166" />
      {/* Tombol A/B Kanan */}
      <rect x="11" y="6" width="2" height="2" fill="#ff4757" />
      <rect x="9" y="8" width="2" height="2" fill="#2ed573" />
    </svg>
  );
}

// 15. Kotak Kado Retro (Gift Box)
export function PixelGift({ size = 16, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Pita Atas (Pita Kado Merah) */}
      <rect x="5" y="1" width="3" height="2" fill="#ff4757" />
      <rect x="8" y="1" width="3" height="2" fill="#ff4757" />
      <rect x="7" y="2" width="2" height="2" fill="#ffd166" />

      {/* Tutup Kado Emas */}
      <rect x="2" y="3" width="12" height="3" fill="#f59f00" />
      <rect x="1" y="3" width="14" height="1" fill="#1a1c2c" />
      <rect x="1" y="6" width="14" height="1" fill="#1a1c2c" />
      <rect x="1" y="4" width="1" height="2" fill="#1a1c2c" />
      <rect x="14" y="4" width="1" height="2" fill="#1a1c2c" />
      <rect x="7" y="3" width="2" height="3" fill="#ff4757" />

      {/* Kotak Bawah */}
      <rect x="3" y="7" width="10" height="8" fill="#ffd166" />
      <rect x="2" y="7" width="1" height="8" fill="#1a1c2c" />
      <rect x="13" y="7" width="1" height="8" fill="#1a1c2c" />
      <rect x="3" y="15" width="10" height="1" fill="#1a1c2c" />
      {/* Pita Silang Vertikal */}
      <rect x="7" y="7" width="2" height="8" fill="#ff4757" />
    </svg>
  );
}

// 16. Peringatan / Alert (Warning Sign)
export function PixelAlert({ size = 16, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Segitiga Kuning Emas */}
      <rect x="7" y="1" width="2" height="2" fill="#ffd166" />
      <rect x="6" y="3" width="4" height="2" fill="#ffd166" />
      <rect x="5" y="5" width="6" height="2" fill="#ffd166" />
      <rect x="4" y="7" width="8" height="2" fill="#ffd166" />
      <rect x="3" y="9" width="10" height="2" fill="#ffd166" />
      <rect x="2" y="11" width="12" height="2" fill="#ffd166" />
      <rect x="1" y="13" width="14" height="2" fill="#ffd166" />
      {/* Outline Gelap */}
      <rect x="7" y="0" width="2" height="1" fill="#1a1c2c" />
      <rect x="0" y="15" width="16" height="1" fill="#1a1c2c" />
      {/* Tanda Seru Gelap */}
      <rect x="7" y="4" width="2" height="5" fill="#1a1c2c" />
      <rect x="7" y="11" width="2" height="2" fill="#1a1c2c" />
    </svg>
  );
}

// 17. Tanda Centang Zamrud 16-Bit (Pixel Checkmark HD)
export function PixelCheck({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Gelap Luar */}
      <rect x="1" y="8" width="2" height="3" fill="#1a1c2c" />
      <rect x="3" y="10" width="2" height="2" fill="#1a1c2c" />
      <rect x="4" y="11" width="2" height="2" fill="#1a1c2c" />
      <rect x="5" y="12" width="2" height="2" fill="#1a1c2c" />
      <rect x="6" y="13" width="2" height="2" fill="#1a1c2c" />
      <rect x="7" y="13" width="2" height="2" fill="#1a1c2c" />
      <rect x="8" y="12" width="2" height="2" fill="#1a1c2c" />
      <rect x="9" y="10" width="2" height="2" fill="#1a1c2c" />
      <rect x="10" y="8" width="2" height="2" fill="#1a1c2c" />
      <rect x="11" y="6" width="2" height="2" fill="#1a1c2c" />
      <rect x="12" y="4" width="2" height="2" fill="#1a1c2c" />
      <rect x="13" y="2" width="2" height="3" fill="#1a1c2c" />
      <rect x="12" y="1" width="2" height="2" fill="#1a1c2c" />
      <rect x="10" y="3" width="2" height="2" fill="#1a1c2c" />
      <rect x="8" y="5" width="2" height="2" fill="#1a1c2c" />
      <rect x="6" y="8" width="2" height="2" fill="#1a1c2c" />
      <rect x="4" y="8" width="2" height="2" fill="#1a1c2c" />

      {/* Badan Centang Hijau Zamrud (#2ed573) & Kilau Mint (#7bed9f) */}
      <rect x="2" y="8" width="2" height="2" fill="#7bed9f" />
      <rect x="3" y="9" width="2" height="2" fill="#2ed573" />
      <rect x="4" y="10" width="2" height="2" fill="#2ed573" />
      <rect x="5" y="11" width="2" height="2" fill="#2ed573" />
      <rect x="6" y="11" width="2" height="2" fill="#2ed573" />
      <rect x="7" y="10" width="2" height="2" fill="#2ed573" />
      <rect x="8" y="8" width="2" height="2" fill="#2ed573" />
      <rect x="9" y="6" width="2" height="2" fill="#2ed573" />
      <rect x="10" y="5" width="2" height="2" fill="#7bed9f" />
      <rect x="11" y="3" width="2" height="2" fill="#7bed9f" />
      <rect x="12" y="2" width="2" height="2" fill="#fffef0" />

      {/* Bayangan Kedalaman Bawah (#10ac84) */}
      <rect x="5" y="12" width="2" height="1" fill="#10ac84" />
      <rect x="6" y="12" width="2" height="1" fill="#10ac84" />
      <rect x="7" y="11" width="2" height="1" fill="#10ac84" />
      <rect x="8" y="9" width="2" height="1" fill="#10ac84" />
      <rect x="9" y="7" width="2" height="1" fill="#10ac84" />
    </svg>
  );
}

// 18. Tombol Silang / Tutup 16-Bit (Pixel Close HD)
export function PixelClose({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Luar Silang */}
      <rect x="1" y="2" width="3" height="3" fill="#1a1c2c" />
      <rect x="12" y="2" width="3" height="3" fill="#1a1c2c" />
      <rect x="3" y="4" width="3" height="3" fill="#1a1c2c" />
      <rect x="10" y="4" width="3" height="3" fill="#1a1c2c" />
      <rect x="5" y="6" width="6" height="4" fill="#1a1c2c" />
      <rect x="3" y="9" width="3" height="3" fill="#1a1c2c" />
      <rect x="10" y="9" width="3" height="3" fill="#1a1c2c" />
      <rect x="1" y="11" width="3" height="3" fill="#1a1c2c" />
      <rect x="12" y="11" width="3" height="3" fill="#1a1c2c" />

      {/* Bagian Dalam Silang */}
      <rect x="2" y="3" width="1" height="1" fill="#ffd166" />
      <rect x="13" y="3" width="1" height="1" fill="#ffd166" />
      <rect x="4" y="5" width="1" height="1" fill="#ffd166" />
      <rect x="11" y="5" width="1" height="1" fill="#ffd166" />
      <rect x="7" y="7" width="2" height="2" fill="#ffd166" />
      <rect x="4" y="10" width="1" height="1" fill="#ffd166" />
      <rect x="11" y="10" width="1" height="1" fill="#ffd166" />
      <rect x="2" y="12" width="1" height="1" fill="#ffd166" />
      <rect x="13" y="12" width="1" height="1" fill="#ffd166" />
    </svg>
  );
}

// 19. Bunga Sakura Piksel 16-Bit (Pixel Sakura HD)
export function PixelSakura({ size = 14, className = "", title }: IconBaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`inline-block select-none ${className}`}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {/* Bingkai Gelap Luar */}
      <rect x="6" y="1" width="4" height="1" fill="#1a1c2c" />
      <rect x="5" y="2" width="6" height="1" fill="#1a1c2c" />
      <rect x="1" y="6" width="1" height="4" fill="#1a1c2c" />
      <rect x="2" y="5" width="1" height="6" fill="#1a1c2c" />
      <rect x="14" y="6" width="1" height="4" fill="#1a1c2c" />
      <rect x="13" y="5" width="1" height="6" fill="#1a1c2c" />
      <rect x="6" y="14" width="4" height="1" fill="#1a1c2c" />
      <rect x="5" y="13" width="6" height="1" fill="#1a1c2c" />

      {/* Kelopak Bunga Pink (#f472b6 & #fbcfe8) */}
      <rect x="6" y="3" width="4" height="3" fill="#fbcfe8" />
      <rect x="3" y="6" width="3" height="4" fill="#fbcfe8" />
      <rect x="10" y="6" width="3" height="4" fill="#fbcfe8" />
      <rect x="6" y="10" width="4" height="3" fill="#f472b6" />

      {/* Shading Bawah Kelopak (#db2777) */}
      <rect x="7" y="5" width="2" height="1" fill="#f472b6" />
      <rect x="5" y="7" width="1" height="2" fill="#f472b6" />
      <rect x="10" y="7" width="1" height="2" fill="#f472b6" />
      <rect x="7" y="12" width="2" height="1" fill="#db2777" />

      {/* Pusat Sari Bunga Emas (#ffd166 & #f59e0b) */}
      <rect x="7" y="7" width="2" height="2" fill="#ffd166" />
      <rect x="7" y="8" width="1" height="1" fill="#f59e0b" />
    </svg>
  );
}
