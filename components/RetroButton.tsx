"use client";

import React from "react";

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export default function RetroButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: RetroButtonProps) {
  const baseStyles =
    "font-pixel inline-flex items-center justify-center text-center select-none tracking-wider transition-all duration-75 cursor-pointer " +
    "border-2 border-[#1a1c2c] active:translate-x-[2px] active:translate-y-[2px] " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-[9px] sm:text-[10px] shadow-[3px_3px_0px_0px_#0c0d19] active:shadow-[1px_1px_0px_0px_#0c0d19]",
    md: "px-4.5 py-2.5 text-[11px] sm:text-xs shadow-[4px_4px_0px_0px_#0c0d19] active:shadow-[2px_2px_0px_0px_#0c0d19]",
    lg: "px-6 py-3.5 text-xs sm:text-sm shadow-[5px_5px_0px_0px_#0c0d19] active:shadow-[2px_2px_0px_0px_#0c0d19]",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-b from-[#ffe082] via-[#ffd166] to-[#e59819] text-[#1a1200] font-bold " +
      "hover:brightness-105 shadow-[inset_2px_2px_0px_rgba(255,255,255,0.7),inset_-2px_-2px_0px_rgba(150,70,0,0.6)]",
    secondary:
      "bg-gradient-to-b from-[#3a3563] via-[#2a264a] to-[#1a1833] text-[#fffdf5] font-bold " +
      "hover:brightness-115 shadow-[inset_2px_2px_0px_rgba(255,255,255,0.25),inset_-2px_-2px_0px_rgba(0,0,0,0.7)]",
    danger:
      "bg-gradient-to-b from-[#ff7675] via-[#ff4757] to-[#c02735] text-white font-bold " +
      "hover:brightness-105 shadow-[inset_2px_2px_0px_rgba(255,255,255,0.5),inset_-2px_-2px_0px_rgba(100,10,20,0.7)]",
    success:
      "bg-gradient-to-b from-[#38ef7d] via-[#2ed573] to-[#1b9e50] text-[#04240f] font-bold " +
      "hover:brightness-105 shadow-[inset_2px_2px_0px_rgba(255,255,255,0.65),inset_-2px_-2px_0px_rgba(8,80,35,0.7)]",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
