"use client";

import React, { useState, useRef, useEffect } from "react";
import RetroButton from "./RetroButton";
import PixelPhotoFrame from "./PixelPhotoFrame";
import {
  PixelGift,
  PixelCheck,
  PixelAlert,
  PixelSword,
  PixelChat,
  PixelGamepad,
  PixelScroll,
  PixelAudio,
  PixelSparkle,
  PixelStar,
} from "./PixelIcons";
import {
  validateReceiverName,
  validateMessageText,
  validateImageFile,
  validateMusicUrl,
  validateAvatar,
  validateChallenges,
  validateMemoryMessages,
} from "@/lib/validate";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { createGift } from "@/lib/api";
import { startPresetBgm, stopBgm } from "@/lib/game/sfx";
import { AvatarGender, ChallengeItem, BuffType, BUFF_META } from "@/lib/types";
import { drawAvatarPreview } from "@/lib/game/sprites";

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback untuk insecure context / IP LAN
    }
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const PRESET_BGM_OPTIONS = [
  { id: "preset:cozy", label: "Cozy Sunset (Santai & Hangat)" },
  { id: "preset:happy", label: "Happy Birthday Retro (Ceria)" },
  { id: "preset:romantic", label: "Starlight Lullaby (Romantis)" },
];

export default function CreateForm() {
  const [receiverName, setReceiverName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imagePreviewRef = useRef<string | null>(null);
  const [avatar, setAvatar] = useState<AvatarGender>("male");
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [showMemorySection, setShowMemorySection] = useState(false);
  const [memoryMessages, setMemoryMessages] = useState<string[]>(["", "", "", ""]);
  const [uploadingChallengePhotoIds, setUploadingChallengePhotoIds] = useState<Record<string, boolean>>({});
  const isAnyChallengeUploading = Object.values(uploadingChallengePhotoIds).some(Boolean);
  const [musicType, setMusicType] = useState<"preset" | "custom">("preset");
  const [selectedPreset, setSelectedPreset] = useState("preset:cozy");
  const [musicUrl, setMusicUrl] = useState("");
  const [previewingPreset, setPreviewingPreset] = useState<string | null>(null);

  // State audio preview
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  // File input ref untuk custom dropzone
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ID Kado persistent antar percobaan (D4)
  const giftIdRef = useRef<string | null>(null);

  // State sukses
  const [createdGiftId, setCreatedGiftId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Ref kanvas preview avatar
  const maleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const femaleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (maleCanvasRef.current) {
      drawAvatarPreview(maleCanvasRef.current, "male");
    }
    if (femaleCanvasRef.current) {
      drawAvatarPreview(femaleCanvasRef.current, "female");
    }
  }, [createdGiftId]);

  // State submit & progress
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    receiverName?: string;
    messageText?: string;
    image?: string;
    music?: string;
    avatar?: string;
    challenges?: string;
    memoryMessages?: string;
  }>({});
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Bersihkan toast timer, audio preview, dan object URL saat unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      stopBgm();
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current = null;
      }
      if (imagePreviewRef.current && imagePreviewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // State cache image url jika GAS gagal agar tidak upload ulang
  const [cachedUploadedImageUrl, setCachedUploadedImageUrl] = useState<string | null>(null);

  // Handle pilih gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = ""; // Reset value agar file yang sama bisa dipilih ulang (D4)
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setFieldErrors((prev) => ({ ...prev, image: validation.error }));
      showToast(validation.error || "File foto tidak valid");
      return;
    }

    if (imagePreviewRef.current && imagePreviewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewRef.current);
    }

    setImageFile(file);
    setCachedUploadedImageUrl(null); // Reset cache foto jika user ganti file
    setFieldErrors((prev) => ({ ...prev, image: undefined }));
    const previewUrl = URL.createObjectURL(file);
    imagePreviewRef.current = previewUrl;
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    if (imagePreviewRef.current && imagePreviewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewRef.current);
    }
    imagePreviewRef.current = null;
    setImageFile(null);
    setImagePreview(null);
    setCachedUploadedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFieldErrors((prev) => ({ ...prev, image: "Foto Kenangan wajib diunggah!" }));
  };

  // Handle audio preview (Tes Lagu)
  const handleTogglePresetPreview = (presetId: string) => {
    if (previewingPreset === presetId) {
      stopBgm();
      setPreviewingPreset(null);
    } else {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        setIsPlayingTestAudio(false);
      }
      startPresetBgm(presetId);
      setPreviewingPreset(presetId);
    }
  };

  const handleToggleTestMusic = () => {
    if (previewingPreset) {
      stopBgm();
      setPreviewingPreset(null);
    }

    const validation = validateMusicUrl(musicUrl);
    if (!validation.isValid) {
      setFieldErrors((prev) => ({ ...prev, music: validation.error }));
      showToast(validation.error || "URL musik tidak valid");
      return;
    }

    if (!musicUrl.trim()) return;

    if (isPlayingTestAudio && testAudioRef.current) {
      testAudioRef.current.pause();
      testAudioRef.current.currentTime = 0;
      setIsPlayingTestAudio(false);
      return;
    }

    if (testAudioRef.current) {
      testAudioRef.current.pause();
    }

    const audio = new Audio(musicUrl.trim());
    testAudioRef.current = audio;

    audio
      .play()
      .then(() => {
        setIsPlayingTestAudio(true);
      })
      .catch(() => {
        showToast("Gagal memutar audio. Pastikan URL langsung ke file .mp3 dan mendukung HTTPS.");
        setFieldErrors((prev) => ({ ...prev, music: "Gagal memutar audio .mp3" }));
        setIsPlayingTestAudio(false);
      });

    audio.onended = () => {
      setIsPlayingTestAudio(false);
    };

    audio.onerror = () => {
      showToast("Format atau link audio tidak dapat diputar.");
      setFieldErrors((prev) => ({ ...prev, music: "Format atau link audio tidak dapat diputar" }));
      setIsPlayingTestAudio(false);
    };
  };

  // Handle Quiz Builder actions (D3: gunakan id dan functional updater)
  const handleAddChallenge = () => {
    if (challenges.length >= 3) return;
    const newChallenge: ChallengeItem = {
      id: makeId(),
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      buff: "shield",
    };
    setChallenges((prev) => [...prev, newChallenge]);
  };

  const handleRemoveChallenge = (id: string) => {
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  const handleChallengeChange = (id: string, field: keyof ChallengeItem, value: unknown) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleOptionChange = (id: string, optionIndex: number, value: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newOptions: [string, string, string, string] = [...c.options];
        newOptions[optionIndex] = value;
        return { ...c, options: newOptions };
      })
    );
  };

  const handleUploadChallengePhoto = async (id: string, file: File) => {
    const v = validateImageFile(file);
    if (!v.isValid) {
      showToast(v.error || "File foto kuis tidak valid");
      return;
    }
    setUploadingChallengePhotoIds((prev) => ({ ...prev, [id]: true }));
    try {
      const url = await uploadImageToImgBB(file);
      // Update berbasis id; bila soal sudah dihapus sebelum selesai upload, tidak akan merusak state
      setChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, imageUrl: url } : c))
      );
    } catch {
      showToast("Gagal mengunggah foto kuis. Coba lagi atau periksa koneksi.");
    } finally {
      setUploadingChallengePhotoIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // Submit Handler (D4: Urutan validasi mengikuti urutan visual)
  const validateForm = (): boolean => {
    const errors: {
      receiverName?: string;
      messageText?: string;
      avatar?: string;
      image?: string;
      challenges?: string;
      memoryMessages?: string;
      music?: string;
    } = {};

    // 1. Nama
    const vName = validateReceiverName(receiverName);
    if (!vName.isValid) {
      errors.receiverName = vName.error;
    }

    // 2. Pesan
    const vMsg = validateMessageText(messageText);
    if (!vMsg.isValid) {
      errors.messageText = vMsg.error;
    }

    // 3. Avatar
    const vAvatar = validateAvatar(avatar);
    if (!vAvatar.isValid) {
      errors.avatar = vAvatar.error;
    }

    // 4. Foto Kenangan (Wajib saat membuat kado)
    if (!cachedUploadedImageUrl && !imageFile) {
      errors.image = "Foto Kenangan wajib diunggah!";
    } else if (imageFile) {
      const vImg = validateImageFile(imageFile);
      if (!vImg.isValid) {
        errors.image = vImg.error;
      }
    }

    // 5. Kuis
    const vChallenges = validateChallenges(challenges);
    if (!vChallenges.isValid) {
      errors.challenges = vChallenges.error;
    }

    // 5b. Pesan Bintang Kenangan (Opsional)
    const activeMemories = memoryMessages.filter((m) => m.trim().length > 0);
    const vMemories = validateMemoryMessages(activeMemories);
    if (!vMemories.isValid) {
      errors.memoryMessages = vMemories.error;
    }

    // 6. Musik
    const finalMusicUrl = musicType === "preset" ? selectedPreset : musicUrl.trim();
    const vMusic = validateMusicUrl(finalMusicUrl);
    if (!vMusic.isValid) {
      errors.music = vMusic.error;
    }

    setFieldErrors(errors);

    const errorKeys = Object.keys(errors) as (keyof typeof errors)[];
    if (errorKeys.length > 0) {
      // Ambil error pertama untuk toast dan focus
      const firstKey = errorKeys[0];
      const firstErrorMessage =
        errors[firstKey] || "Mohon lengkapi formulir sebelum membungkus kado!";
      showToast(firstErrorMessage);
      setErrorMessage(firstErrorMessage);

      // Urutan scroll visual: receiverName -> messageText -> avatar-section -> photo-dropzone -> quiz-section -> musicUrl
      const elementIdMap: Record<string, string> = {
        receiverName: "receiverName",
        messageText: "messageText",
        avatar: "avatar-section",
        image: "photo-dropzone",
        challenges: "quiz-section",
        music: "musicUrl",
      };

      const targetId = elementIdMap[firstKey];
      if (targetId && typeof document !== "undefined") {
        const el = document.getElementById(targetId);
        if (el) {
          const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          el.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center",
          });
          if (el instanceof HTMLElement) {
            el.focus({ preventScroll: true });
          }
        }
      }
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isAnyChallengeUploading) return;

    // Stop audio preview jika sedang aktif
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      setIsPlayingTestAudio(false);
    }
    if (previewingPreset) {
      stopBgm();
      setPreviewingPreset(null);
    }

    // Validasi form lengkap sebelum memicu request apapun
    if (!validateForm()) {
      return;
    }

    const finalMusicUrl = musicType === "preset" ? selectedPreset : musicUrl.trim();
    setIsSubmitting(true);

    try {
      // 1. Upload ke ImgBB jika belum terupload
      let finalImageUrl = cachedUploadedImageUrl;
      if (!finalImageUrl && imageFile) {
        setStatusText("Mengunggah foto kado...");
        finalImageUrl = await uploadImageToImgBB(imageFile);
        setCachedUploadedImageUrl(finalImageUrl);
      }

      // 2. Generate / gunakan ID yang disimpan di ref agar percobaan ulang idempoten (D4)
      if (!giftIdRef.current) {
        giftIdRef.current = makeId();
      }
      const giftId = giftIdRef.current;

      // 3. Simpan ke Google Apps Script
      setStatusText("Menyimpan kado...");
      await createGift({
        id: giftId,
        receiver_name: receiverName.trim(),
        message_text: messageText.trim(),
        image_url: finalImageUrl!,
        music_url: finalMusicUrl || undefined,
        avatar,
        challenges: challenges.map((c) => ({
          ...c,
          question: c.question.trim(),
          options: [
            c.options[0].trim(),
            c.options[1].trim(),
            c.options[2].trim(),
            c.options[3].trim(),
          ],
        })),
        memory_messages: memoryMessages.some((m) => m.trim().length > 0)
          ? memoryMessages.map((m) => m.trim()).slice(0, 4)
          : undefined,
      });

      // 4. Sukses
      setCreatedGiftId(giftId);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses kado."
      );
    } finally {
      setIsSubmitting(false);
      setStatusText(null);
    }
  };

  // Copy link handler dengan fallback
  const handleCopyLink = () => {
    if (!createdGiftId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const giftLink = `${origin}/play/${createdGiftId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(giftLink)
        .then(() => triggerCopySuccess())
        .catch(() => fallbackCopy(giftLink));
    } else {
      fallbackCopy(giftLink);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      triggerCopySuccess();
    } catch {
      alert(`Salin link ini secara manual: ${text}`);
    }
  };

  const triggerCopySuccess = () => {
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  // Reset form untuk buat kado baru
  const handleReset = () => {
    giftIdRef.current = null;
    setReceiverName("");
    setMessageText("");
    setImageFile(null);
    setImagePreview(null);
    setAvatar("male");
    setChallenges([]);
    setMusicUrl("");
    setCachedUploadedImageUrl(null);
    setCreatedGiftId(null);
    setErrorMessage(null);
  };

  // Tampilan SUKSES setelah kado dibuat
  if (createdGiftId) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const playUrl = `${origin}/play/${createdGiftId}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `Hai ${receiverName}! Ada kado spesial menunggumu di mini-game petualangan ini: ${playUrl}`
    )}`;

    return (
      <div className="w-full max-w-xl mx-auto rpg-box-golden p-6 md:p-10 text-center animate-fade-in relative z-10">
        <div className="inline-block p-4 bg-amber-400/10 rounded-full border border-amber-400/30 mb-4 animate-bounce">
          <PixelGift size={44} className="text-[#ffd166] drop-shadow-[0_4px_12px_rgba(255,209,102,0.4)]" />
        </div>

        <div className="rpg-badge bg-emerald-950/80 text-emerald-300 border-emerald-400/40 mb-3 mx-auto flex items-center justify-center gap-1.5">
          <PixelCheck size={12} className="text-emerald-300" />
          <span>QUEST BERHASIL DITERBITKAN</span>
        </div>

        <h2 className="font-pixel text-base md:text-xl text-[#ffbe3b] mb-3 drop-shadow-[2px_2px_0_#000]">
          KADO SIAP DIBUKA!
        </h2>

        <p className="font-sans text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed max-w-md mx-auto">
          Tautan kado untuk <strong className="text-white font-semibold">{receiverName}</strong> telah aktif. Bagikan tautan ini agar dia bisa memainkan quest dan membuka pesan rahasiamu!
        </p>

        {/* Link Box */}
        <div className="rpg-inset p-3.5 mb-6 text-left flex flex-col gap-2">
          <span className="font-pixel text-[9px] text-amber-300/80">TAUTAN PETUALANGAN:</span>
          <div className="bg-black/60 p-2.5 border border-slate-700 font-mono text-xs text-emerald-400 break-all select-all">
            {playUrl}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <RetroButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleCopyLink}
            className="flex-1 py-3 flex items-center justify-center gap-2"
          >
            {copiedLink ? (
              <>
                <PixelCheck size={13} className="shrink-0" />
                <span>TERSALIN!</span>
              </>
            ) : (
              <>
                <PixelScroll size={13} className="shrink-0" />
                <span>SALIN TAUTAN</span>
              </>
            )}
          </RetroButton>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <RetroButton
              type="button"
              variant="success"
              size="md"
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              <PixelChat size={13} className="shrink-0" />
              <span>BAGIKAN WA</span>
            </RetroButton>
          </a>
        </div>

        <div className="mb-6">
          <a
            href={playUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <RetroButton
              type="button"
              variant="secondary"
              size="md"
              className="w-full py-3 text-xs flex items-center justify-center gap-2"
            >
              <PixelGamepad size={13} className="shrink-0" />
              <span>COBA MAINKAN SENDIRI</span>
            </RetroButton>
          </a>
        </div>

        <div className="border-t border-[#383461] pt-5">
          <button
            type="button"
            onClick={handleReset}
            className="font-pixel text-[10px] text-slate-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
          >
            + Buat Kado Lainnya
          </button>
        </div>
      </div>
    );
  }

  // Tampilan FORM PEMBUATAN
  return (
    <>
      {/* Toast Notification Inline / Fixed */}
      {toast && (
        <aside
          role="alert"
          aria-live="assertive"
          className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-4 z-50 p-4 bg-rose-950/95 border-2 border-rose-500 text-rose-200 text-xs sm:text-sm font-sans rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex items-center gap-3 animate-fade-in max-w-md"
        >
          <PixelAlert size={18} className="shrink-0 text-rose-300" />
          <span className="flex-1 font-medium leading-snug">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-rose-400 hover:text-white font-pixel text-xs p-1 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </aside>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto rpg-box p-5 sm:p-8 md:p-10 relative z-10 animate-fade-in"
      >
        {/* Header Form */}
        <div className="text-center mb-8 border-b-2 border-[#383461] pb-6">
          <div className="rpg-badge bg-[#241f3d] text-[#ffbe3b] border-[#ffbe3b]/40 mb-2 flex items-center justify-center gap-1.5">
            <PixelSword size={12} className="text-[#ffbe3b]" />
            <span>LANGKAH PERSIAPAN QUEST</span>
            <PixelSword size={12} className="text-[#ffbe3b]" />
          </div>
          <h2 className="font-pixel text-sm sm:text-lg md:text-xl text-[#ffbe3b] mb-2 tracking-wide drop-shadow-[2px_2px_0_#000]">
            FORMULIR KADO 16-BIT
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Isi detail penerima dan kejutan rahasia. Selesai dibuat dalam waktu kurang dari 2 menit!
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-950/90 border-2 border-rose-500 text-xs text-rose-200 font-sans shadow-[4px_4px_0_#000] flex items-start gap-2.5">
            <PixelAlert size={16} className="shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= SEKSI 1: IDENTITAS PENERIMA ================= */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#282548]">
            <span className="font-pixel text-xs text-[#ffbe3b] bg-[#ffbe3b]/10 px-2 py-0.5 border border-[#ffbe3b]/30">
              01
            </span>
            <h3 className="font-pixel text-xs text-slate-100 tracking-wide">
              IDENTITAS & PESAN
            </h3>
          </div>

          {/* 1. Nama Penerima */}
          <div className="mb-5">
            <label
              htmlFor="receiverName"
              className="block font-sans text-xs font-semibold text-slate-200 mb-1.5"
            >
              Nama Penerima Kado <span className="text-rose-400">*</span>
            </label>
            <input
              id="receiverName"
              type="text"
              maxLength={50}
              value={receiverName}
              onChange={(e) => {
                setReceiverName(e.target.value);
                if (fieldErrors.receiverName) {
                  setFieldErrors((prev) => ({ ...prev, receiverName: undefined }));
                }
              }}
              placeholder="Contoh: Ayunda, Budi, atau Sahabat Terbaik"
              aria-invalid={!!fieldErrors.receiverName}
              aria-describedby={fieldErrors.receiverName ? "name-error" : undefined}
              className={`rpg-input w-full p-3 text-xs sm:text-sm rounded-none ${fieldErrors.receiverName
                ? "border-red-500 ring-2 ring-red-400 bg-red-950/20"
                : ""
                }`}
            />
            {fieldErrors.receiverName && (
              <p id="name-error" role="alert" className="text-xs text-rose-400 font-sans mt-1.5 flex items-center gap-1.5 font-medium">
                <PixelAlert size={13} className="shrink-0 text-rose-400" />
                <span>{fieldErrors.receiverName}</span>
              </p>
            )}
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400 font-sans">
              <span>Nama ini akan dipanggil oleh NPC di dalam game!</span>
              <span>{receiverName.length}/50</span>
            </div>
          </div>

          {/* 2. Pesan Kado */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="messageText"
                className="font-sans text-xs font-semibold text-slate-200"
              >
                Surat / Pesan Rahasia <span className="text-rose-400">*</span>
              </label>
              <span className="font-sans text-[11px] text-slate-400">
                {messageText.length}/500
              </span>
            </div>
            <textarea
              id="messageText"
              maxLength={500}
              rows={4}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                if (fieldErrors.messageText) {
                  setFieldErrors((prev) => ({ ...prev, messageText: undefined }));
                }
              }}
              placeholder="Tuliskan ucapan selamat ulang tahun, ungkapan terima kasih, atau pesan menyentuh hati yang akan muncul saat kado dibuka..."
              aria-invalid={!!fieldErrors.messageText}
              aria-describedby={fieldErrors.messageText ? "msg-error" : undefined}
              className={`rpg-input w-full p-3 text-xs sm:text-sm leading-relaxed resize-none rounded-none ${fieldErrors.messageText
                ? "border-red-500 ring-2 ring-red-400 bg-red-950/20"
                : ""
                }`}
            />
            {fieldErrors.messageText && (
              <p id="msg-error" role="alert" className="text-xs text-rose-400 font-sans mt-1.5 flex items-center gap-1.5 font-medium">
                <PixelAlert size={13} className="shrink-0 text-rose-400" />
                <span>{fieldErrors.messageText}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Pesan ini akan dimainkan dengan animasi mesin tik dan dicetak pada Kartu Kado (.PNG).
            </p>
          </div>
        </div>

        {/* ================= SEKSI 2: AVATAR KARAKTER ================= */}
        <div id="avatar-section" className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#282548]">
            <span className="font-pixel text-xs text-[#2ed573] bg-[#2ed573]/10 px-2 py-0.5 border border-[#2ed573]/30">
              02
            </span>
            <h3 className="font-pixel text-xs text-slate-100 tracking-wide">
              PILIH KARAKTER PAHLAWAN
            </h3>
          </div>

          <p className="font-sans text-xs text-slate-300 mb-3">
            Pilih avatar yang akan dikendalikan penerima kado saat menjelajahi kota senja:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" role="radiogroup" aria-label="Pilih Karakter Pemain">
            {/* Avatar Cowok */}
            <button
              type="button"
              role="radio"
              aria-checked={avatar === "male"}
              onClick={() => setAvatar("male")}
              className={`p-3.5 text-left flex items-center gap-3.5 transition-all cursor-pointer ${avatar === "male"
                ? "rpg-box-golden"
                : "rpg-inset opacity-80 hover:opacity-100"
                }`}
            >
              <div className="w-[72px] h-[72px] flex-shrink-0 bg-black/60 border border-slate-700 flex items-center justify-center p-1 shadow-inner">
                <canvas
                  ref={maleCanvasRef}
                  width={32}
                  height={32}
                  className="w-16 h-16 block pixel-canvas"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-pixel text-xs text-slate-100 truncate">Cowok</span>
                  {avatar === "male" && (
                    <span className="font-pixel text-[8px] bg-amber-400 text-black px-1.5 py-0.5 font-bold">
                      DIPILIH
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-slate-400">
                  Pendekar Biru 16-Bit
                </p>
              </div>
            </button>

            {/* Avatar Cewek */}
            <button
              type="button"
              role="radio"
              aria-checked={avatar === "female"}
              onClick={() => setAvatar("female")}
              className={`p-3.5 text-left flex items-center gap-3.5 transition-all cursor-pointer ${avatar === "female"
                ? "rpg-box-golden"
                : "rpg-inset opacity-80 hover:opacity-100"
                }`}
            >
              <div className="w-[72px] h-[72px] flex-shrink-0 bg-black/60 border border-slate-700 flex items-center justify-center p-1 shadow-inner">
                <canvas
                  ref={femaleCanvasRef}
                  width={32}
                  height={32}
                  className="w-16 h-16 block pixel-canvas"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-pixel text-xs text-slate-100 truncate">Cewek</span>
                  {avatar === "female" && (
                    <span className="font-pixel text-[8px] bg-amber-400 text-black px-1.5 py-0.5 font-bold">
                      DIPILIH
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-slate-400">
                  Pita & Gaun Rose 16-Bit
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ================= SEKSI 3: FOTO KENANGAN (DROPZONE) ================= */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#282548]">
            <span className="font-pixel text-xs text-[#ff6b81] bg-[#ff6b81]/10 px-2 py-0.5 border border-[#ff6b81]/30">
              03
            </span>
            <h3 className="font-pixel text-xs text-slate-100 tracking-wide">
              FOTO KENANGAN SPESIAL
            </h3>
          </div>

          <label
            htmlFor="imageUpload"
            className="block font-sans text-xs font-semibold text-slate-200 mb-1.5"
          >
            Foto Kenangan / Hadiah <span className="text-rose-400">*</span>
          </label>

          {/* Hidden Input File - TANPA required agar tidak diblokir browser secara silent */}
          <input
            ref={fileInputRef}
            id="imageUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            aria-invalid={!!fieldErrors.image}
            aria-describedby={fieldErrors.image ? "image-error" : undefined}
            className="hidden"
          />

          {/* Custom Retro Dropzone (D4: tabIndex={0}) */}
          {!imagePreview ? (
            <div
              id="photo-dropzone"
              tabIndex={0}
              role="button"
              aria-label="Unggah Foto Kenangan"
              aria-describedby={fieldErrors.image ? "image-error" : undefined}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`p-6 text-center cursor-pointer transition-all group outline-none ${fieldErrors.image
                ? "border-2 border-red-500 ring-2 ring-red-400 bg-red-950/20"
                : "rpg-inset border-2 border-dashed border-[#383461] hover:border-[#ffbe3b] hover:bg-[#151429]"
                }`}
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-[#1e1c38] rounded-full flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform">
                <PixelStar size={22} className="text-[#ffd166]" />
              </div>
              <p className="font-pixel text-xs text-[#ffbe3b] mb-1">
                KLIK UNTUK UNGGAH FOTO
              </p>
              <p className="font-sans text-xs text-slate-400">
                Format JPG, PNG, atau WebP (Maksimal 10 MB)
              </p>
            </div>
          ) : (
            <div className="rpg-inset p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <PixelPhotoFrame
                  imageUrl={imagePreview}
                  alt="Preview Kado"
                  maxHeight="max-h-36"
                  aspectRatio="square"
                  className="max-w-[130px]"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="font-pixel text-[10px] text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                  <PixelCheck size={11} className="shrink-0" />
                  <span>FOTO BERHASIL DIPILIH</span>
                </span>
                <p className="font-sans text-xs text-slate-300 mb-3">
                  {imageFile?.name || "Foto kenangan siap disematkan ke kado"}
                </p>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-pixel text-[9px] bg-[#242145] text-amber-300 px-3 py-1.5 border border-slate-700 hover:border-amber-400 cursor-pointer flex items-center gap-1"
                  >
                    <PixelSparkle size={10} className="shrink-0" />
                    <span>Ganti Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="font-pixel text-[9px] bg-[#242145] text-rose-400 px-3 py-1.5 border border-slate-700 hover:border-rose-400 cursor-pointer"
                  >
                    ✖ Hapus
                  </button>
                </div>
              </div>
            </div>
          )}

          {fieldErrors.image && (
            <p
              id="image-error"
              role="alert"
              className="text-xs text-rose-400 font-sans mt-2 flex items-center gap-1.5 font-medium"
            >
              <PixelAlert size={13} className="shrink-0 text-rose-400" />
              <span>{fieldErrors.image}</span>
            </p>
          )}
        </div>

        {/* ================= SEKSI 4: TANTANGAN KUIS RPG ================= */}
        <div id="quiz-section" className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#282548]">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs text-[#a55eea] bg-[#a55eea]/10 px-2 py-0.5 border border-[#a55eea]/30">
                04
              </span>
              <h3 className="font-pixel text-xs text-slate-100 tracking-wide">
                TANTANGAN KUIS (OPSIONAL)
              </h3>
            </div>
            <span className="font-pixel text-[10px] text-amber-300">{challenges.length}/3 SOAL</span>
          </div>

          <p className="font-sans text-xs text-slate-300 mb-4 leading-relaxed">
            Sematkan pertanyaan rahasia yang ditemui di jalan. Penerima kado yang menjawab benar akan mendapat perisai atau buff kecepatan!
          </p>

          {challenges.length > 0 && (
            <div className="space-y-4 mb-4">
              {challenges.map((c, cIdx) => (
                <div
                  key={c.id}
                  className="rpg-inset p-4 sm:p-5 space-y-3.5 border-l-4 border-l-[#ffbe3b]"
                >
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <span className="font-pixel text-xs text-[#ffbe3b]">
                      SOAL #{cIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChallenge(c.id)}
                      className="font-pixel text-[9px] text-rose-400 hover:text-rose-300 uppercase tracking-wider"
                    >
                      [✖ Hapus]
                    </button>
                  </div>

                  {/* Pertanyaan */}
                  <div>
                    <label className="block font-sans text-xs text-slate-200 mb-1">
                      Pertanyaan <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={140}
                      required
                      value={c.question}
                      onChange={(e) => handleChallengeChange(c.id, "question", e.target.value)}
                      placeholder="Contoh: Di mana tempat pertama kali kita jalan bareng?"
                      className="rpg-input w-full p-2.5 text-xs rounded-none"
                    />
                  </div>

                  {/* Foto Kuis Opsional */}
                  <div>
                    <label className="block font-sans text-xs text-slate-300 mb-1">
                      Foto Bantuan Soal (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={!!uploadingChallengePhotoIds[c.id]}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleUploadChallengePhoto(c.id, file);
                      }}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-2.5 file:border file:border-black file:text-[10px] file:font-pixel file:bg-[#2c3e50] file:text-white cursor-pointer"
                    />
                    {uploadingChallengePhotoIds[c.id] && (
                      <p className="font-pixel text-[9px] text-amber-300 mt-1 animate-pulse">
                        ⏳ Mengunggah foto soal...
                      </p>
                    )}
                    {c.imageUrl && (
                      <div className="mt-2 flex items-center gap-2 bg-black/40 p-2 border border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.imageUrl}
                          alt="Foto soal"
                          className="w-10 h-10 object-cover border border-white"
                        />
                        <span className="font-sans text-xs text-emerald-400 flex items-center gap-1">
                          <PixelCheck size={11} className="shrink-0" />
                          <span>Foto terunggah</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleChallengeChange(c.id, "imageUrl", undefined)}
                          className="font-pixel text-[9px] text-rose-400 hover:underline ml-auto"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4 Pilihan Jawaban */}
                  <div>
                    <label className="block font-sans text-xs text-slate-200 mb-2">
                      Pilihan Jawaban (Pilih radio untuk jawaban <span className="text-emerald-400 font-semibold">BENAR</span>)
                    </label>
                    <div className="space-y-2">
                      {c.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2.5">
                          <label className="flex items-center cursor-pointer gap-1.5 bg-black/40 px-2 py-1.5 border border-slate-700">
                            <input
                              type="radio"
                              name={`correct_${c.id}`}
                              checked={c.correctIndex === optIdx}
                              onChange={() => handleChallengeChange(c.id, "correctIndex", optIdx)}
                              className="accent-emerald-400"
                            />
                            <span className="font-pixel text-xs text-amber-300">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                          </label>
                          <input
                            type="text"
                            maxLength={60}
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(c.id, optIdx, e.target.value)}
                            placeholder={`Jawaban ${String.fromCharCode(65 + optIdx)}`}
                            className="rpg-input flex-1 p-2 text-xs rounded-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hadiah Buff (D4: Menggunakan BUFF_META) */}
                  <div>
                    <label className="block font-sans text-xs text-slate-200 mb-1">
                      Hadiah Buff Jika Benar
                    </label>
                    <select
                      value={c.buff}
                      onChange={(e) => handleChallengeChange(c.id, "buff", e.target.value as BuffType)}
                      className="rpg-input w-full p-2.5 text-xs rounded-none cursor-pointer"
                    >
                      {(Object.keys(BUFF_META) as BuffType[]).map((buffKey) => {
                        const b = BUFF_META[buffKey];
                        return (
                          <option key={buffKey} value={buffKey}>
                            {b.emoji} {b.label} ({b.desc})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {challenges.length < 3 && (
            <button
              type="button"
              onClick={handleAddChallenge}
              className="w-full py-3 bg-[#1d1c3a] border-2 border-dashed border-[#ffbe3b]/50 hover:border-[#ffbe3b] text-amber-300 font-pixel text-[10px] tracking-wider transition-colors"
            >
              + TAMBAH SOAL KUIS ({challenges.length}/3)
            </button>
          )}

          {/* Inline error kuis (D4) */}
          {fieldErrors.challenges && (
            <p
              id="challenges-error"
              role="alert"
              className="text-xs text-rose-400 font-sans mt-2 flex items-center gap-1.5 font-medium"
            >
              <PixelAlert size={13} className="shrink-0 text-rose-400" />
              <span>{fieldErrors.challenges}</span>
            </p>
          )}
        </div>

        {/* ================= SEKSI: PESAN BINTANG KENANGAN (OPSIONAL) ================= */}
        <div className="mb-10">
          <div className="rpg-box p-4 bg-[#1a1836] border-2 border-[#3b3663]">
            <button
              type="button"
              onClick={() => setShowMemorySection((prev) => !prev)}
              className="w-full flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <PixelStar size={14} className="text-amber-400 shrink-0" />
                <span className="font-pixel text-[11px] sm:text-xs text-amber-300 tracking-wide">
                  Pesan Khusus di 4 Bintang Kenangan (Opsional)
                </span>
              </div>
              <span className="font-pixel text-[9px] text-amber-200/70 ml-2">
                {showMemorySection ? "[Tutup ▲]" : "[Buka ▼]"}
              </span>
            </button>

            {showMemorySection && (
              <div className="mt-4 pt-3 border-t border-[#2d2852] space-y-3.5">
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Tulis pesan kenangan singkat atau kalimat manis yang muncul saat pemain mengumpulkan tiap <strong>Bintang Kenangan</strong> di perjalanan (maksimal 40 karakter per bintang).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const placeholders = [
                      "e.g. Makasih udah selalu ada",
                      "e.g. Senyum terus ya!",
                      "e.g. Kamu keren banget",
                      "e.g. Dikit lagi sampai!",
                    ];
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-pixel text-slate-300">
                          <label htmlFor={`memory-${idx}`}>Bintang {idx + 1}</label>
                          <span
                            className={
                              (memoryMessages[idx]?.length || 0) > 40
                                ? "text-rose-400 font-bold"
                                : "text-slate-400"
                            }
                          >
                            {memoryMessages[idx]?.length || 0}/40
                          </span>
                        </div>
                        <input
                          id={`memory-${idx}`}
                          type="text"
                          maxLength={40}
                          value={memoryMessages[idx] || ""}
                          placeholder={placeholders[idx]}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMemoryMessages((prev) => {
                              const next = [...prev];
                              next[idx] = val;
                              return next;
                            });
                          }}
                          className="w-full bg-[#131127] border border-[#3b3663] rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-sans focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    );
                  })}
                </div>

                {fieldErrors.memoryMessages && (
                  <p className="text-xs text-rose-400 font-sans flex items-center gap-1.5 font-medium">
                    <PixelAlert size={13} className="shrink-0 text-rose-400" />
                    <span>{fieldErrors.memoryMessages}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= SEKSI 5: MUSIK LATAR 8-BIT ================= */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#282548]">
            <span className="font-pixel text-xs text-[#2bcbba] bg-[#2bcbba]/10 px-2 py-0.5 border border-[#2bcbba]/30">
              05
            </span>
            <h3 className="font-pixel text-xs text-slate-100 tracking-wide">
              MUSIK LATAR 8-BIT
            </h3>
          </div>

          {/* Tab Pilihan Tipe Musik */}
          <div className="flex gap-2.5 mb-3.5">
            <button
              type="button"
              onClick={() => {
                setMusicType("preset");
                if (testAudioRef.current) {
                  testAudioRef.current.pause();
                  setIsPlayingTestAudio(false);
                }
              }}
              className={`flex-1 py-2 px-3 text-[10px] font-pixel border-2 border-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${musicType === "preset"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-[2px_2px_0_#000]"
                : "bg-[#1d1c3a] text-slate-300 hover:text-white"
                }`}
            >
              <PixelAudio size={12} className="shrink-0" />
              <span>Melodi Pilihan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMusicType("custom");
                stopBgm();
                setPreviewingPreset(null);
              }}
              className={`flex-1 py-2 px-3 text-[10px] font-pixel border-2 border-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${musicType === "custom"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-[2px_2px_0_#000]"
                : "bg-[#1d1c3a] text-slate-300 hover:text-white"
                }`}
            >
              <PixelScroll size={12} className="shrink-0" />
              <span>Tautan .mp3 Sendiri</span>
            </button>
          </div>

          {musicType === "preset" ? (
            <div className="space-y-2.5">
              {PRESET_BGM_OPTIONS.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-none border cursor-pointer transition-all ${selectedPreset === p.id
                    ? "border-[#ffbe3b] bg-[#1f1d3c] shadow-[2px_2px_0_#000]"
                    : "border-slate-700/60 bg-[#0c0b17] hover:border-slate-500"
                    }`}
                  onClick={() => setSelectedPreset(p.id)}
                >
                  <label className="font-sans text-xs text-slate-200 cursor-pointer flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="presetMusic"
                      checked={selectedPreset === p.id}
                      onChange={() => setSelectedPreset(p.id)}
                      className="accent-amber-400"
                    />
                    <span className="font-medium">{p.label}</span>
                  </label>
                  <RetroButton
                    type="button"
                    variant={previewingPreset === p.id ? "danger" : "secondary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePresetPreview(p.id);
                    }}
                    className="!py-1 !px-2.5 !text-[9px]"
                  >
                    {previewingPreset === p.id ? "⏹ STOP" : "▶ TES"}
                  </RetroButton>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-sans text-xs text-slate-400">
                Masukkan tautan langsung file audio berakhiran <code>.mp3</code> (harus protokol HTTPS).
              </p>
              <div className="flex gap-2">
                <input
                  id="musicUrl"
                  type="url"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  placeholder="https://domain.com/lagu-kenangan.mp3"
                  className="rpg-input flex-1 p-2.5 text-xs rounded-none"
                />
                <RetroButton
                  type="button"
                  variant={isPlayingTestAudio ? "danger" : "secondary"}
                  size="sm"
                  onClick={handleToggleTestMusic}
                  disabled={!musicUrl.trim()}
                >
                  {isPlayingTestAudio ? "⏹ STOP" : "▶ TES"}
                </RetroButton>
              </div>
            </div>
          )}
        </div>

        {/* ================= SUBMIT BUTTON (D3: Disabled & label jika ada soal mengunggah) ================= */}
        <div className="pt-2">
          <RetroButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || isAnyChallengeUploading}
            className="w-full py-4 text-xs sm:text-sm hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <PixelSparkle size={14} className="animate-spin shrink-0 text-black" />
                <span>{statusText || "Memproses..."}</span>
              </>
            ) : isAnyChallengeUploading ? (
              <>
                <PixelSparkle size={14} className="animate-spin shrink-0 text-black" />
                <span>Menunggu unggahan foto soal...</span>
              </>
            ) : (
              <>
                <PixelGift size={16} className="shrink-0 text-black" />
                <span>BUNGKUS KADO SEKARANG</span>
              </>
            )}
          </RetroButton>
        </div>
      </form>
    </>
  );
}
