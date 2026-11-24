"use client";

import React from "react";
import type { GameInputAction } from "@/lib/types";
import { PixelArrow, PixelSword, PixelChat } from "./PixelIcons";

interface VirtualDPadProps {
  onInput: (action: GameInputAction, pressed: boolean) => void;
  showInteract?: boolean;
  interactEnabled?: boolean;
}

export default function VirtualDPad({
  onInput,
  showInteract = false,
  interactEnabled = false,
}: VirtualDPadProps) {
  const createButtonHandlers = (action: GameInputAction) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Abaikan jika browser tidak mendukung capture
      }
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
          navigator.vibrate(10);
        } catch {
          // Abaikan jika ditolak perizinan
        }
      }
      onInput(action, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Abaikan
      }
      onInput(action, false);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onInput(action, false);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Abaikan
      }
      onInput(action, false);
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
    },
  });

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[300] flex justify-between items-end p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] select-none"
      style={{ touchAction: "none" }}
    >
      {/* Tombol Kiri dan Kanan di Kiri Bawah (minimal 56x56 px, jarak 12 px, 16-Bit Bevel) */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          aria-label="Gerak Kiri"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xs border-3 border-[#1a1c2c] bg-gradient-to-b from-[#3a4756] via-[#2c3846] to-[#1e2733] text-white flex items-center justify-center shadow-[4px_4px_0px_0px_#0c0d19,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.5)] active:shadow-[1px_1px_0px_0px_#0c0d19] active:translate-x-[2px] active:translate-y-[2px] active:scale-95 transition-transform touch-none select-none cursor-pointer"
          {...createButtonHandlers("left")}
        >
          <PixelArrow direction="left" size={26} />
        </button>
        <button
          type="button"
          aria-label="Gerak Kanan"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xs border-3 border-[#1a1c2c] bg-gradient-to-b from-[#3a4756] via-[#2c3846] to-[#1e2733] text-white flex items-center justify-center shadow-[4px_4px_0px_0px_#0c0d19,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.5)] active:shadow-[1px_1px_0px_0px_#0c0d19] active:translate-x-[2px] active:translate-y-[2px] active:scale-95 transition-transform touch-none select-none cursor-pointer"
          {...createButtonHandlers("right")}
        >
          <PixelArrow direction="right" size={26} />
        </button>
      </div>

      {/* Tombol Aksi di Kanan Bawah: 💬 (Interact), ⬆ (Lompat), ⚔️ (Serang) */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {showInteract && (
          <button
            type="button"
            aria-label="Bicara / Interaksi"
            disabled={!interactEnabled}
            className={`w-14 h-14 rounded-xs border-3 border-[#1a1c2c] flex items-center justify-center transition-all touch-none select-none cursor-pointer ${
              interactEnabled
                ? "bg-gradient-to-b from-[#ffe082] via-[#ffd166] to-[#e59819] text-[#1a1200] shadow-[4px_4px_0px_0px_#0c0d19,inset_2px_2px_0px_rgba(255,255,255,0.7),inset_-2px_-2px_0px_rgba(150,70,0,0.6)] animate-pulse active:shadow-[1px_1px_0px_0px_#0c0d19] active:translate-x-[2px] active:translate-y-[2px] active:scale-95"
                : "bg-gradient-to-b from-[#2e2a56] to-[#1a1836] opacity-40 shadow-none text-gray-400 cursor-not-allowed"
            }`}
            {...createButtonHandlers("interact")}
          >
            <PixelChat size={26} />
          </button>
        )}

        <div className="flex items-end gap-3">
          {/* Tombol Serang (Sword) */}
          <button
            type="button"
            aria-label="Serang"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xs border-3 border-[#1a1c2c] bg-gradient-to-b from-[#ff7675] via-[#ff4757] to-[#c02735] text-white flex items-center justify-center shadow-[4px_4px_0px_0px_#0c0d19,inset_2px_2px_0px_rgba(255,255,255,0.5),inset_-2px_-2px_0px_rgba(100,10,20,0.7)] active:shadow-[1px_1px_0px_0px_#0c0d19] active:translate-x-[2px] active:translate-y-[2px] active:scale-95 transition-transform touch-none select-none cursor-pointer"
            {...createButtonHandlers("attack")}
          >
            <PixelSword size={26} />
          </button>

          {/* Tombol Lompat (JUMP Terbesar) */}
          <button
            type="button"
            aria-label="Lompat"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xs border-3 border-[#1a1c2c] bg-gradient-to-b from-[#ffbe3b] via-[#e59819] to-[#b36f0a] text-white text-xs font-pixel flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#0c0d19,inset_2px_2px_0px_rgba(255,255,255,0.6),inset_-2px_-2px_0px_rgba(120,60,0,0.6)] active:shadow-[1px_1px_0px_0px_#0c0d19] active:translate-x-[2px] active:translate-y-[2px] active:scale-95 transition-transform touch-none select-none cursor-pointer"
            {...createButtonHandlers("jump")}
          >
            <PixelArrow direction="up" size={24} />
            <span className="text-[9px] mt-0.5 tracking-wider font-bold">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
