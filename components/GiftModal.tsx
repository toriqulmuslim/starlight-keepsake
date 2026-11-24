"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import RetroButton from "./RetroButton";
import PixelRibbonBanner from "./PixelRibbonBanner";
import PixelPhotoFrame from "./PixelPhotoFrame";
import {
  PixelScroll,
  PixelStar,
  PixelSparkle,
  PixelGamepad,
  PixelGift,
  PixelSakura,
} from "./PixelIcons";

interface GiftModalProps {
  receiverName: string;
  messageText: string;
  imageUrl: string;
  adventureSnapshot?: string | null;
  onPlayAgain: () => void;
  onPeacefulMode?: () => void;
}

export default function GiftModal({
  receiverName,
  messageText,
  imageUrl,
  adventureSnapshot,
  onPlayAgain,
  onPeacefulMode,
}: GiftModalProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardFeedback, setCardFeedback] = useState<string | null>(null);

  // Efek konfeti saat modal pertama kali terbuka
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Abaikan jika tidak didukung
    }
  }, []);

  // Efek mesin tik (D6: menggunakan kode poin Array.from agar emoji tidak rusak)
  useEffect(() => {
    const characters = Array.from(messageText);
    let index = 0;

    const timer = setInterval(() => {
      index++;
      setDisplayedText(characters.slice(0, index).join(""));
      if (index >= characters.length) {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [messageText]);

  const handleSkipTyping = () => {
    setDisplayedText(messageText);
    setIsTypingComplete(true);
  };

  // Render dan Unduh Kartu Pos / Polaroid 16-Bit Museum Grade
  // Sesuai panduan visual PRD.md Bagian 2.4 & Bagian 6
  const handleSaveCard = async () => {
    setIsSavingCard(true);
    setCardFeedback(null);

    try {
      // D6: Tunggu document.fonts.ready sebelum merender canvas kartu
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // Abaikan jika tidak didukung
        }
      }

      const cardCanvas = document.createElement("canvas");
      const ctx = cardCanvas.getContext("2d");
      if (!ctx) return;

      const width = 800;
      const height = 1140;
      cardCanvas.width = width;
      cardCanvas.height = height;

      // 1. Latar Belakang Luar: Twilight Starlight Indigo (#151428)
      ctx.fillStyle = "#151428";
      ctx.fillRect(0, 0, width, height);

      // Taburan bintang halus di latar belakang luar
      ctx.fillStyle = "rgba(255, 209, 102, 0.45)";
      const starCoords = [
        [30, 45], [760, 40], [50, 260], [750, 310], [40, 800], [760, 850],
        [60, 1080], [740, 1070], [180, 25], [620, 28], [25, 540], [775, 560]
      ];
      for (const [sx, sy] of starCoords) {
        ctx.fillRect(sx, sy, 3, 3);
        ctx.fillRect(sx - 2, sy + 1, 7, 1);
        ctx.fillRect(sx + 1, sy - 2, 1, 7);
      }

      // 2. Lembaran Parchment Hangat (#FFFBF0)
      const pad = 24;
      const pW = width - pad * 2;
      const pH = height - pad * 2;

      // Bayangan tepi parchment
      ctx.fillStyle = "#0c0d19";
      ctx.fillRect(pad + 4, pad + 4, pW, pH);

      // Kartu Parchment Utama
      ctx.fillStyle = "#fffbf0";
      ctx.fillRect(pad, pad, pW, pH);

      // Bingkai Ganda Klasik di atas Parchment
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffd166";
      ctx.strokeRect(pad + 8, pad + 8, pW - 16, pH - 16);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#d4af37";
      ctx.strokeRect(pad + 14, pad + 14, pW - 28, pH - 28);

      // Ornamen Sudut 16-Bit (Corner Brackets)
      const corners = [
        [pad + 8, pad + 8],
        [pad + pW - 8, pad + 8],
        [pad + 8, pad + pH - 8],
        [pad + pW - 8, pad + pH - 8],
      ];
      ctx.fillStyle = "#ffd166";
      for (const [cx, cy] of corners) {
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
      }

      // 3. Header Title Arch
      // Header Banner Box
      ctx.fillStyle = "#1e2238";
      ctx.fillRect(width / 2 - 210, pad + 24, 420, 38);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffd166";
      ctx.strokeRect(width / 2 - 210, pad + 24, 420, 38);

      ctx.fillStyle = "#ffd166";
      ctx.font = 'bold 15px "Press Start 2P", monospace, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("★ KADO DIGITAL 8-BIT ★", width / 2, pad + 49);

      // Dedikasi Nama Penerima
      ctx.fillStyle = "#2c221e";
      ctx.font = 'bold 22px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`Dipersembahkan untuk ${receiverName}`, width / 2, pad + 95);

      // Garis Aksen Emas
      ctx.strokeStyle = "#e08210";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 120, pad + 110);
      ctx.lineTo(width / 2 + 120, pad + 110);
      ctx.stroke();

      // Titik ornamen tengah
      ctx.fillStyle = "#e08210";
      ctx.fillRect(width / 2 - 4, pad + 107, 8, 8);

      // 4. Polaroid Frame untuk Foto Kenangan
      const polaroidW = 420;
      const polaroidH = 430;
      const polaroidX = (width - polaroidW) / 2;
      const polaroidY = pad + 130;

      // Polaroid Outer Paper (White Cardstock)
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillRect(polaroidX, polaroidY, polaroidW, polaroidH);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#e2d9cc";
      ctx.strokeRect(polaroidX, polaroidY, polaroidW, polaroidH);

      // Tab / Corner Mounts bergaya album foto
      ctx.fillStyle = "#3d405b";
      // Kiri Atas
      ctx.beginPath();
      ctx.moveTo(polaroidX - 4, polaroidY + 16);
      ctx.lineTo(polaroidX + 16, polaroidY - 4);
      ctx.lineTo(polaroidX + 22, polaroidY + 2);
      ctx.lineTo(polaroidX + 2, polaroidY + 22);
      ctx.closePath();
      ctx.fill();
      // Kanan Atas
      ctx.beginPath();
      ctx.moveTo(polaroidX + polaroidW + 4, polaroidY + 16);
      ctx.lineTo(polaroidX + polaroidW - 16, polaroidY - 4);
      ctx.lineTo(polaroidX + polaroidW - 22, polaroidY + 2);
      ctx.lineTo(polaroidX + polaroidW - 2, polaroidY + 22);
      ctx.closePath();
      ctx.fill();

      // Foto Kenangan
      const photoInnerW = 380;
      const photoInnerH = 350;
      const photoInnerX = polaroidX + (polaroidW - photoInnerW) / 2;
      const photoInnerY = polaroidY + 20;

      let photoRendered = false;
      if (!imageError && imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = imageUrl;
          });

          // Draw foto dengan aspect ratio cover
          ctx.save();
          ctx.beginPath();
          ctx.rect(photoInnerX, photoInnerY, photoInnerW, photoInnerH);
          ctx.clip();

          const imgRatio = img.width / img.height;
          const boxRatio = photoInnerW / photoInnerH;
          let sW = img.width;
          let sH = img.height;
          let sx = 0;
          let sy = 0;

          if (imgRatio > boxRatio) {
            sW = img.height * boxRatio;
            sx = (img.width - sW) / 2;
          } else {
            sH = img.width / boxRatio;
            sy = (img.height - sH) / 2;
          }

          ctx.drawImage(img, sx, sy, sW, sH, photoInnerX, photoInnerY, photoInnerW, photoInnerH);
          ctx.restore();

          // Border tipis foto
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
          ctx.strokeRect(photoInnerX, photoInnerY, photoInnerW, photoInnerH);

          photoRendered = true;
        } catch {
          photoRendered = false;
          // D6: Beri feedback kepada pengguna jika foto gagal dimuat karena proteksi CORS
          setCardFeedback(
            "Foto kenangan tidak dapat dimuat ke kartu karena proteksi server (CORS). Kartu tetap diunduh dengan ilustrasi kado."
          );
        }
      }

      if (!photoRendered) {
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(photoInnerX, photoInnerY, photoInnerW, photoInnerH);
        ctx.fillStyle = "#ffd166";
        ctx.font = 'bold 36px "Press Start 2P", monospace';
        ctx.textAlign = "center";
        ctx.fillText("★", width / 2, photoInnerY + photoInnerH / 2 - 10);
        ctx.fillStyle = "#ffffff";
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText("KENANGAN INDAH", width / 2, photoInnerY + photoInnerH / 2 + 35);
      }

      // Keterangan kecil di bawah polaroid
      ctx.fillStyle = "#7f8c8d";
      ctx.font = 'italic 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("✦ Momen petualangan yang tak terlupakan ✦", width / 2, polaroidY + polaroidH - 16);

      // Stempel "Momen Petualangan" di Kartu Kado .png (Fase P-3)
      if (adventureSnapshot) {
        try {
          const snapImg = new Image();
          snapImg.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            snapImg.onload = () => resolve();
            snapImg.onerror = () => reject();
            snapImg.src = adventureSnapshot;
          });

          ctx.save();
          // Render mini pixel stamp (~120x76 px, -3° tilt, border bevel, label "MOMEN PETUALANGAN")
          const stampW = 120;
          const stampH = 76;
          const stampCenterX = photoInnerX + photoInnerW - 68;
          const stampCenterY = photoInnerY + photoInnerH - 24;

          ctx.translate(stampCenterX, stampCenterY);
          ctx.rotate((-3 * Math.PI) / 180);

          // Latar stempel putih berbingkai bevel retro
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-stampW / 2, -stampH / 2, stampW, stampH);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#d97706";
          ctx.strokeRect(-stampW / 2 + 1, -stampH / 2 + 1, stampW - 2, stampH - 2);

          // Bevel sudut stempel
          ctx.fillStyle = "#fef3c7";
          ctx.fillRect(-stampW / 2 + 2, -stampH / 2 + 2, stampW - 4, 2);
          ctx.fillRect(-stampW / 2 + 2, -stampH / 2 + 2, 2, stampH - 4);

          // Gambar snapshot petualangan
          const snapInnerW = stampW - 8;
          const snapInnerH = stampH - 22;
          ctx.drawImage(snapImg, -stampW / 2 + 4, -stampH / 2 + 4, snapInnerW, snapInnerH);

          // Label stempel "MOMEN PETUALANGAN"
          ctx.fillStyle = "#92400e";
          ctx.font = 'bold 7px "Press Start 2P", monospace';
          ctx.textAlign = "center";
          ctx.fillText("MOMEN PETUALANGAN", 0, stampH / 2 - 5);

          ctx.restore();
        } catch {
          // Abaikan jika tidak didukung
        }
      }

      // 5. Kotak Pesan / Surat Pribadi
      const letterBoxX = pad + 40;
      const letterBoxY = polaroidY + polaroidH + 25;
      const letterBoxW = pW - 80;
      const letterBoxH = 340;

      // Cardholder surat berdimensi
      ctx.fillStyle = "#f7f1e3";
      ctx.fillRect(letterBoxX, letterBoxY, letterBoxW, letterBoxH);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#e2d9cc";
      ctx.strokeRect(letterBoxX, letterBoxY, letterBoxW, letterBoxH);

      // Icon Kutipan / Segel Amplop
      ctx.fillStyle = "#e08210";
      ctx.fillRect(letterBoxX + 16, letterBoxY + 14, 6, 6);
      ctx.fillStyle = "#2c221e";
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.textAlign = "left";
      ctx.fillText("SURAT PESAN:", letterBoxX + 30, letterBoxY + 22);

      // Isi Pesan (D6: Pecah teks per baris baru (\n) lalu per kata, dan potong kata yang lebih panjang dari lebar kotak)
      ctx.fillStyle = "#2c221e";
      ctx.font = '15px/1.6 "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';

      const maxTextWidth = letterBoxW - 48;
      const lineHeight = 26;
      const textStartX = letterBoxX + 24;
      let textStartY = letterBoxY + 54;

      const paragraphs = messageText.split("\n");
      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const para = paragraphs[pIdx];
        const words = para.split(" ");
        let currentLine = "";

        for (let i = 0; i < words.length; i++) {
          let word = words[i];

          // Potong kata yang lebih panjang dari lebar kotak
          while (ctx.measureText(word).width > maxTextWidth) {
            let cutLen = word.length - 1;
            while (cutLen > 0 && ctx.measureText(word.slice(0, cutLen)).width > maxTextWidth) {
              cutLen--;
            }
            if (cutLen === 0) cutLen = 1;
            if (currentLine) {
              ctx.fillText(currentLine.trim(), textStartX, textStartY);
              textStartY += lineHeight;
              currentLine = "";
            }
            ctx.fillText(word.slice(0, cutLen), textStartX, textStartY);
            textStartY += lineHeight;
            word = word.slice(cutLen);
          }

          const testLine = currentLine ? currentLine + " " + word : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && currentLine) {
            ctx.fillText(currentLine.trim(), textStartX, textStartY);
            currentLine = word;
            textStartY += lineHeight;
            if (textStartY > letterBoxY + letterBoxH - 30) {
              ctx.fillText("...", textStartX, textStartY);
              break;
            }
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine && textStartY <= letterBoxY + letterBoxH - 20) {
          ctx.fillText(currentLine.trim(), textStartX, textStartY);
          textStartY += lineHeight;
        }
        if (textStartY > letterBoxY + letterBoxH - 30) {
          break;
        }
      }

      // 6. Footer & Quest Seal
      const footerY = letterBoxY + letterBoxH + 40;

      // Quest Cleared Gold Stamp (Kanan Bawah)
      const sealX = width - pad - 120;
      const sealY = footerY;
      ctx.save();
      ctx.translate(sealX, sealY);
      ctx.rotate(-0.06);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#e08210";
      ctx.strokeRect(-80, -20, 160, 40);

      ctx.fillStyle = "#e08210";
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillText("QUEST CLEARED", 0, -2);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText("★ 100% COMPLETE ★", 0, 12);
      ctx.restore();

      // Watermark / Tanggal (Kiri Bawah)
      ctx.fillStyle = "#7f8c8d";
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = "left";
      const today = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      ctx.fillText(`Digital-8-Bit Archive • ${today}`, pad + 40, footerY);
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText("Disimpan sebagai kenangan abadi", pad + 40, footerY + 18);

      // 7. Trigger Download PNG
      const dataUrl = cardCanvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `kado-8bit-${receiverName.toLowerCase().replace(/\s+/g, "-")}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Gagal menyimpan kartu:", err);
      alert("Gagal mengunduh kartu kado. Silakan coba screenshot layar kado Anda.");
    } finally {
      setIsSavingCard(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4 bg-[#0a0b14]/85 backdrop-blur-sm animate-fade-in select-none">
      {/* Kartu Utama: Warm Parchment dengan Bingkai Piksel Gelap & Bayangan Berdimensi */}
      <div className="relative w-full max-w-lg rpg-parchment-card p-5 sm:p-7 text-[#1a1c2c] max-h-[92dvh] overflow-y-auto">
        {/* Lis Dalam Emas & Ornamen Sudut */}
        <div className="absolute inset-1.5 border border-[#ffd166]/80 pointer-events-none" />
        <span className="absolute left-2.5 top-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />
        <span className="absolute right-2.5 top-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />
        <span className="absolute left-2.5 bottom-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />
        <span className="absolute right-2.5 bottom-2.5 w-1.5 h-1.5 bg-[#ffd166] border border-[#1a1c2c] pointer-events-none" />

        {/* Header: Pita Judul Retro 16-Bit */}
        <div className="text-center mb-5 border-b-2 border-[#d9ccb4] pb-3">
          <PixelRibbonBanner
            title="MISI SELESAI! KADO TERBUKA"
            variant="crimson"
            className="w-full max-w-xs mx-auto"
          />
          <h2 className="text-xs sm:text-sm font-pixel text-[#1a1c2c] tracking-wide break-words mt-2">
            Untuk Pahlawan: <span className="text-[#b33939] underline decoration-2">{receiverName}</span>
          </h2>
        </div>

        {/* Bingkai Foto Kenangan 9-Slice Emas dengan Sudut Permata Piksel */}
        <div className="mb-5 flex justify-center">
          <PixelPhotoFrame
            imageUrl={imageUrl}
            alt={`Kado untuk ${receiverName}`}
            caption="Kenangan Spesial"
            maxHeight="max-h-60 sm:max-h-64"
            aspectRatio="square"
            className="max-w-[280px]"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Pesan Kado: Panel Surat Parchment (Efek Mesin Tik dengan Font Sangat Nyaman Dibaca) */}
        <div className="rpg-parchment-inset p-4 sm:p-5 mb-5 min-h-[110px] rounded-xs relative">
          <div className="flex items-center gap-1.5 mb-2 font-pixel text-[9px] text-[#8b5e1b] uppercase">
            <PixelScroll size={13} className="text-[#8b5e1b] shrink-0" />
            <span>Surat Pribadi:</span>
          </div>
          <p className="font-sans text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words text-[#2c251a] font-medium">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-2 h-4 bg-[#b33939] ml-1 animate-pulse align-middle" />
            )}
          </p>

          {!isTypingComplete && (
            <div className="text-right mt-3">
              <button
                type="button"
                onClick={handleSkipTyping}
                className="font-pixel text-[9px] text-[#8b5e1b] hover:text-[#b33939] uppercase underline cursor-pointer"
              >
                [Lewati Animasi ▶▶]
              </button>
            </div>
          )}
        </div>

        {/* Feedback Notifikasi Kartu (CORS/Informasi) */}
        {cardFeedback && (
          <div className="mb-4 p-3 bg-[#fff3cd] border-2 border-[#ffeeba] text-[#856404] font-sans text-xs rounded-xs text-center shadow-xs flex items-center justify-center gap-1.5">
            <PixelSparkle size={13} className="shrink-0 text-amber-700" />
            <span>{cardFeedback}</span>
          </div>
        )}

        {/* Tombol Simpan Kartu Ucapan (.PNG) */}
        {isTypingComplete && (
          <div className="mb-4">
            <RetroButton
              variant="success"
              size="lg"
              onClick={handleSaveCard}
              disabled={isSavingCard}
              className="w-full text-xs sm:text-sm py-3.5 font-pixel tracking-wider flex items-center justify-center gap-2"
            >
              {isSavingCard ? (
                <>
                  <PixelSparkle size={14} className="animate-spin text-white shrink-0" />
                  <span>MENYIAPKAN KARTU...</span>
                </>
              ) : (
                <>
                  <PixelStar size={14} className="text-white shrink-0" />
                  <span>SIMPAN KARTU KADO (.PNG)</span>
                </>
              )}
            </RetroButton>
          </div>
        )}

        {/* Tombol Aksi */}
        {onPeacefulMode && (
          <div className="mb-3">
            <RetroButton
              variant="secondary"
              size="md"
              onClick={onPeacefulMode}
              className="w-full font-pixel text-xs py-3 flex items-center justify-center gap-2"
            >
              <PixelSakura size={14} className="shrink-0" />
              <span>Kembali ke Puncak Sakura</span>
            </RetroButton>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3 border-t-2 border-[#d9ccb4]">
          <RetroButton
            variant="secondary"
            size="md"
            onClick={onPlayAgain}
            className="flex-1 font-pixel text-xs py-3 flex items-center justify-center gap-1.5"
          >
            <PixelGamepad size={13} className="shrink-0" />
            <span>Main Lagi</span>
          </RetroButton>
          <Link href="/create" className="flex-1">
            <RetroButton
              variant="primary"
              size="md"
              className="w-full font-pixel text-xs py-3 flex items-center justify-center gap-1.5"
            >
              <PixelGift size={13} className="shrink-0" />
              <span>Buat Kado Sendiri</span>
            </RetroButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
