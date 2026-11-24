"use client";

import React, { useState } from "react";

interface PixelPhotoFrameProps {
  imageUrl?: string;
  alt: string;
  caption?: string;
  maxHeight?: string;
  className?: string;
  aspectRatio?: "square" | "auto" | "video";
  onError?: () => void;
}

/**
 * PixelPhotoFrame — Bingkai Foto 9-Slice Piksel Murni 16-Bit
 * Menampilkan ornamen emas, lis berdimensi, dan permata piksel di keempat sudut.
 * Dirancang dengan SVG vektor tajam (crispEdges) sehingga tidak pernah buram di layar apa pun.
 */
export default function PixelPhotoFrame({
  imageUrl,
  alt,
  caption,
  maxHeight = "max-h-56",
  className = "",
  aspectRatio = "auto",
  onError,
}: PixelPhotoFrameProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImgError = () => {
    setImageError(true);
    onError?.();
  };

  const hasValidImage = Boolean(imageUrl && imageUrl.trim() && !imageError);

  return (
    <div className={`relative inline-block w-full max-w-sm mx-auto select-none ${className}`}>
      {/* Bingkai Utama Berpola 9-Slice */}
      <div className="relative p-2.5 sm:p-3 bg-[#1e1c36] border-2 border-[#1a1c2c] rounded-xs shadow-[0_12px_28px_rgba(0,0,0,0.6),4px_4px_0px_#0c0d19]">
        {/* Lis Dalam Emas (Gold inner border) */}
        <div className="absolute inset-1 border border-[#ffd166]/60 pointer-events-none" />

        {/* ================= Permata Piksel di 4 Sudut ================= */}
        {/* Sudut Kiri Atas */}
        <div className="absolute -left-1.5 -top-1.5 w-5 h-5 pointer-events-none z-20">
          <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
            <rect x="0" y="0" width="16" height="16" fill="#1a1c2c" />
            <rect x="2" y="2" width="12" height="12" fill="#ffd166" />
            <rect x="4" y="4" width="8" height="8" fill="#e5a93c" />
            {/* Permata Ruby */}
            <rect x="5" y="5" width="6" height="6" fill="#ff4757" />
            <rect x="5" y="5" width="3" height="3" fill="#ff7675" />
            <rect x="8" y="8" width="3" height="3" fill="#b31d28" />
          </svg>
        </div>

        {/* Sudut Kanan Atas */}
        <div className="absolute -right-1.5 -top-1.5 w-5 h-5 pointer-events-none z-20">
          <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
            <rect x="0" y="0" width="16" height="16" fill="#1a1c2c" />
            <rect x="2" y="2" width="12" height="12" fill="#ffd166" />
            <rect x="4" y="4" width="8" height="8" fill="#e5a93c" />
            {/* Permata Ruby */}
            <rect x="5" y="5" width="6" height="6" fill="#ff4757" />
            <rect x="5" y="5" width="3" height="3" fill="#ff7675" />
            <rect x="8" y="8" width="3" height="3" fill="#b31d28" />
          </svg>
        </div>

        {/* Sudut Kiri Bawah */}
        <div className="absolute -left-1.5 -bottom-1.5 w-5 h-5 pointer-events-none z-20">
          <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
            <rect x="0" y="0" width="16" height="16" fill="#1a1c2c" />
            <rect x="2" y="2" width="12" height="12" fill="#ffd166" />
            <rect x="4" y="4" width="8" height="8" fill="#e5a93c" />
            {/* Permata Ruby */}
            <rect x="5" y="5" width="6" height="6" fill="#ff4757" />
            <rect x="5" y="5" width="3" height="3" fill="#ff7675" />
            <rect x="8" y="8" width="3" height="3" fill="#b31d28" />
          </svg>
        </div>

        {/* Sudut Kanan Bawah */}
        <div className="absolute -right-1.5 -bottom-1.5 w-5 h-5 pointer-events-none z-20">
          <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
            <rect x="0" y="0" width="16" height="16" fill="#1a1c2c" />
            <rect x="2" y="2" width="12" height="12" fill="#ffd166" />
            <rect x="4" y="4" width="8" height="8" fill="#e5a93c" />
            {/* Permata Ruby */}
            <rect x="5" y="5" width="6" height="6" fill="#ff4757" />
            <rect x="5" y="5" width="3" height="3" fill="#ff7675" />
            <rect x="8" y="8" width="3" height="3" fill="#b31d28" />
          </svg>
        </div>

        {/* Matras Foto Dalam (Inner velvet mat) */}
        <div
          className={`w-full relative flex items-center justify-center bg-[#0d0c18] border-2 border-[#1a1c2c] overflow-hidden ${maxHeight} ${
            aspectRatio === "square" ? "aspect-square" : ""
          } shadow-[inset_2px_2px_8px_rgba(0,0,0,0.85)]`}
        >
          {/* Status Loading */}
          {hasValidImage && !imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0c18] animate-pulse text-[#ffd166] text-xs font-pixel gap-1.5">
              <span>⏳</span>
              <span className="text-[9px]">MEMUAT FOTO...</span>
            </div>
          )}

          {/* Gambar Foto */}
          {hasValidImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={alt}
              loading="eager"
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={handleImgError}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          ) : (
            <div className="text-center p-4 text-xs font-pixel text-gray-400">
              <span className="text-3xl block mb-2">🎁</span>
              <span className="text-[9px] text-[#ffd166] tracking-wide">[FOTO KENANGAN]</span>
            </div>
          )}
        </div>

        {/* Keterangan Bingkai (Opsional) */}
        {caption && (
          <div className="mt-2 text-center">
            <span className="font-pixel text-[8px] sm:text-[9px] text-[#ffd166] tracking-wider uppercase">
              ✦ {caption} ✦
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
