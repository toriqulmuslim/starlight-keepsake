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
  PixelHeart,
  PixelArrow,
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
      // Fallback
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
  // State Wizard Langkah (1, 2, atau 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Form States
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

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ID Kado persistent antar percobaan submit
  const giftIdRef = useRef<string | null>(null);

  // State sukses
  const [createdGiftId, setCreatedGiftId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Ref kanvas preview avatar
  const maleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const femaleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const livePreviewAvatarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (maleCanvasRef.current) {
      drawAvatarPreview(maleCanvasRef.current, "male");
    }
    if (femaleCanvasRef.current) {
      drawAvatarPreview(femaleCanvasRef.current, "female");
    }
    if (livePreviewAvatarCanvasRef.current) {
      drawAvatarPreview(livePreviewAvatarCanvasRef.current, avatar);
    }
  }, [avatar, currentStep, showMobilePreview]);

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

  // Cache URL foto yang sudah berhasil terunggah
  const [cachedUploadedImageUrl, setCachedUploadedImageUrl] = useState<string | null>(null);

  // Cleanup effect
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

  // Upload Foto
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
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
    setCachedUploadedImageUrl(null);
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

  // Preview Audio
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

    const audio = new Audio(musicUrl.trim());
    testAudioRef.current = audio;
    audio.volume = 0.5;

    audio
      .play()
      .then(() => {
        setIsPlayingTestAudio(true);
        setFieldErrors((prev) => ({ ...prev, music: undefined }));
      })
      .catch((err) => {
        console.warn("Gagal memutar audio test:", err);
        setFieldErrors((prev) => ({
          ...prev,
          music: "Gagal memutar tautan audio. Pastikan file dapat diakses secara publik.",
        }));
        setIsPlayingTestAudio(false);
      });

    audio.onended = () => setIsPlayingTestAudio(false);
    audio.onerror = () => {
      setFieldErrors((prev) => ({
        ...prev,
        music: "Format audio tidak didukung atau tautan tidak valid.",
      }));
      setIsPlayingTestAudio(false);
    };
  };

  // --- KUIS BUILDER HANDLERS ---
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

  const handleRemoveChallenge = (index: number) => {
    setChallenges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChallengeChange = <K extends keyof ChallengeItem>(
    index: number,
    field: K,
    value: ChallengeItem[K]
  ) => {
    setChallenges((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleChallengeOptionChange = (
    challengeIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setChallenges((prev) => {
      const next = [...prev];
      const nextOptions = [...next[challengeIndex].options] as [
        string,
        string,
        string,
        string,
      ];
      nextOptions[optionIndex] = value;
      next[challengeIndex] = { ...next[challengeIndex], options: nextOptions };
      return next;
    });
  };

  const handleChallengePhotoUpload = async (
    challengeIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const vImg = validateImageFile(file);
    if (!vImg.isValid) {
      showToast(vImg.error || "File foto bantuan kuis tidak valid");
      return;
    }

    const cId = challenges[challengeIndex]?.id;
    if (!cId) return;

    setUploadingChallengePhotoIds((prev) => ({ ...prev, [cId]: true }));
    try {
      showToast("Mengunggah foto bantuan kuis...");
      const uploadedUrl = await uploadImageToImgBB(file);
      handleChallengeChange(challengeIndex, "imageUrl", uploadedUrl);
      showToast("Foto bantuan kuis berhasil disematkan!");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Gagal mengunggah foto bantuan kuis."
      );
    } finally {
      setUploadingChallengePhotoIds((prev) => ({ ...prev, [cId]: false }));
    }
  };

  const handleChallengePhotoRemove = (challengeIndex: number) => {
    handleChallengeChange(challengeIndex, "imageUrl", undefined);
  };

  // --- VALIDASI PER LANGKAH ---
  const validateStep1 = (): boolean => {
    const errors: typeof fieldErrors = {};

    const vName = validateReceiverName(receiverName);
    if (!vName.isValid) errors.receiverName = vName.error;

    const vMsg = validateMessageText(messageText);
    if (!vMsg.isValid) errors.messageText = vMsg.error;

    const vAvatar = validateAvatar(avatar);
    if (!vAvatar.isValid) errors.avatar = vAvatar.error;

    setFieldErrors((prev) => ({ ...prev, ...errors }));

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const targetId = firstKey === "receiverName" ? "receiverName" : firstKey === "messageText" ? "messageText" : "avatar-section";
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return false;
    }

    setFieldErrors((prev) => ({
      ...prev,
      receiverName: undefined,
      messageText: undefined,
      avatar: undefined,
    }));
    return true;
  };

  const validateStep2 = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!imageFile && !cachedUploadedImageUrl) {
      errors.image = "Foto Kenangan wajib diunggah agar kado memiliki visual spesial!";
    }

    const finalMusicUrl = musicType === "preset" ? selectedPreset : musicUrl.trim();
    const vMusic = validateMusicUrl(finalMusicUrl);
    if (!vMusic.isValid) errors.music = vMusic.error;

    setFieldErrors((prev) => ({ ...prev, ...errors }));

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const targetId = firstKey === "image" ? "photo-dropzone" : "musicUrl";
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return false;
    }

    setFieldErrors((prev) => ({ ...prev, image: undefined, music: undefined }));
    return true;
  };

  const validateStep3 = (): boolean => {
    const errors: typeof fieldErrors = {};

    const vChallenges = validateChallenges(challenges);
    if (!vChallenges.isValid) errors.challenges = vChallenges.error;

    const vMem = validateMemoryMessages(memoryMessages);
    if (!vMem.isValid) errors.memoryMessages = vMem.error;

    setFieldErrors((prev) => ({ ...prev, ...errors }));

    if (Object.keys(errors).length > 0) {
      return false;
    }

    setFieldErrors((prev) => ({ ...prev, challenges: undefined, memoryMessages: undefined }));
    return true;
  };

  // Navigasi Antar Langkah
  const handleNextToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextToStep3 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // SUBMIT FINAL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isAnyChallengeUploading) return;

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep3()) {
      return;
    }

    // Stop tester audio
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      setIsPlayingTestAudio(false);
    }
    if (previewingPreset) {
      stopBgm();
      setPreviewingPreset(null);
    }

    const finalMusicUrl = musicType === "preset" ? selectedPreset : musicUrl.trim();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let finalImageUrl = cachedUploadedImageUrl;
      if (!finalImageUrl && imageFile) {
        setStatusText("Mengompres & mengunggah foto kado...");
        finalImageUrl = await uploadImageToImgBB(imageFile);
        setCachedUploadedImageUrl(finalImageUrl);
      }

      if (!giftIdRef.current) {
        giftIdRef.current = makeId();
      }
      const giftId = giftIdRef.current;

      setStatusText("Menyimpan kado ke server...");
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

  // Salin Tautan
  const handleCopyLink = () => {
    if (!createdGiftId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const giftLink = `${origin}/play/${createdGiftId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(giftLink)
        .then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
        })
        .catch(() => alert(`Salin tautan ini: ${giftLink}`));
    } else {
      alert(`Salin tautan ini: ${giftLink}`);
    }
  };

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
    setCurrentStep(1);
  };

  // =========================================================================
  // TAMPILAN SUKSES PENERBITAN KADO
  // =========================================================================
  if (createdGiftId) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const playUrl = `${origin}/play/${createdGiftId}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `Hai ${receiverName}! Ada kado spesial menunggumu di mini-game petualangan ini: ${playUrl}`
    )}`;

    return (
      <div className="w-full max-w-xl mx-auto rpg-box-golden p-6 md:p-10 text-center animate-fade-in relative z-10">
        <div className="inline-block p-4 bg-amber-400/10 rounded-full border border-amber-400/30 mb-4 animate-bounce">
          <PixelGift size={48} />
        </div>

        <h2 className="font-pixel text-base md:text-xl text-[#ffd166] mb-2 tracking-wide">
          KADO BERHASIL DIBUNGKUS!
        </h2>
        <p className="font-sans text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
          Petualangan digital untuk{" "}
          <span className="font-pixel text-[#39d86f]">{receiverName}</span> telah
          siap dimainkan.
        </p>

        <div className="rpg-inset p-3 mb-6 flex items-center justify-between gap-2 border border-[#383461]">
          <span className="font-pixel text-[10px] text-gray-400 truncate text-left select-all">
            {playUrl}
          </span>
          <span className="text-[10px] text-amber-300 font-pixel shrink-0">
            [TERSIMPAN]
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
            className="font-pixel text-[10px] text-slate-400 hover:text-amber-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            + Buat Kado Lainnya
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN FORMULIR WIZARD 3 LANGKAH + LIVE PREVIEW DESKTOP
  // =========================================================================
  return (
    <div className="w-full max-w-6xl mx-auto z-10 animate-fade-in">
      {/* Toast Notifikasi Ringan */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1e1a38]/95 border-2 border-amber-400/80 px-4 py-2 text-xs font-sans text-amber-200 shadow-2xl backdrop-blur-md rounded-xs flex items-center gap-2 animate-fade-in">
          <PixelSparkle size={13} className="text-amber-300 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Stepper Wizard Indicator (3 Langkah Retro) */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex flex-col items-center p-2.5 sm:p-3 border-2 transition-all cursor-pointer rounded-xs ${
              currentStep === 1
                ? "bg-[#241e3d] border-[#ffd166] shadow-[2px_2px_0px_#000]"
                : "bg-[#141226]/80 border-[#322d56] opacity-75 hover:opacity-100"
            }`}
          >
            <span className="font-pixel text-[9px] sm:text-[10px] text-[#ffd166] mb-1">
              TAHAP 01
            </span>
            <span className="font-sans text-xs sm:text-sm font-semibold text-white tracking-tight text-center">
              Penerima & Karakter
            </span>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`flex flex-col items-center p-2.5 sm:p-3 border-2 transition-all cursor-pointer rounded-xs ${
              currentStep === 2
                ? "bg-[#241e3d] border-[#ffd166] shadow-[2px_2px_0px_#000]"
                : "bg-[#141226]/80 border-[#322d56] opacity-75 hover:opacity-100"
            }`}
          >
            <span className="font-pixel text-[9px] sm:text-[10px] text-[#ffd166] mb-1">
              TAHAP 02
            </span>
            <span className="font-sans text-xs sm:text-sm font-semibold text-white tracking-tight text-center">
              Foto & Musik
            </span>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setCurrentStep(3);
            }}
            className={`flex flex-col items-center p-2.5 sm:p-3 border-2 transition-all cursor-pointer rounded-xs ${
              currentStep === 3
                ? "bg-[#241e3d] border-[#ffd166] shadow-[2px_2px_0px_#000]"
                : "bg-[#141226]/80 border-[#322d56] opacity-75 hover:opacity-100"
            }`}
          >
            <span className="font-pixel text-[9px] sm:text-[10px] text-[#ffd166] mb-1">
              TAHAP 03
            </span>
            <span className="font-sans text-xs sm:text-sm font-semibold text-white tracking-tight text-center">
              Kuis & Bungkus
            </span>
          </button>
        </div>
      </div>

      {/* Toggle Pratinjau Mobile (Khusus Layar Sempit < lg) */}
      <div className="lg:hidden mb-6 flex justify-center">
        <button
          type="button"
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#17152b] border border-[#ffd166]/50 rounded-xs text-[10px] font-pixel text-amber-300 shadow-sm cursor-pointer"
        >
          <PixelSparkle size={11} className="text-[#ffd166]" />
          <span>{showMobilePreview ? "Sembunyikan Pratinjau Kado ▲" : "Lihat Pratinjau Kado Live ▼"}</span>
        </button>
      </div>

      {/* Layout Grid 2-Kolom (Desktop lg: 7 Col Form / 5 Col Live Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* KOLOM KIRI: FORMULIR WIZARD AKTIF (lg:col-span-7)                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 w-full">
          <form onSubmit={handleSubmit} noValidate className="rpg-box p-5 sm:p-7 md:p-8">
            {/* Header Form Langkah */}
            <div className="mb-6 pb-4 border-b border-[#383461] flex items-center justify-between">
              <div>
                <span className="font-pixel text-[9px] text-[#ffd166] tracking-widest block mb-1">
                  QUEST BUILDER • LANGKAH {currentStep} DARI 3
                </span>
                <h2 className="font-pixel text-base sm:text-lg text-white">
                  {currentStep === 1 && "IDENTITAS & KARAKTER"}
                  {currentStep === 2 && "FOTO KENANGAN & MUSIK"}
                  {currentStep === 3 && "TANTANGAN KUIS & BUNGKUS"}
                </h2>
              </div>
              <span className="text-xs font-sans text-slate-400">
                {currentStep === 1 && "Langkah 1/3"}
                {currentStep === 2 && "Langkah 2/3"}
                {currentStep === 3 && "Langkah 3/3"}
              </span>
            </div>

            {/* Pesan Kesalahan Lembut / Estetis (Tanpa Banner Merah Agresif) */}
            {errorMessage && (
              <div className="p-3 bg-amber-950/30 border border-amber-400/50 rounded-xs text-amber-200 text-xs flex items-center gap-2 mb-6 font-sans animate-fade-in">
                <PixelAlert size={14} className="text-amber-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* LANGKAH 1: IDENTITAS & KARAKTER                               */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                {/* Nama Penerima */}
                <div>
                  <label htmlFor="receiverName" className="block text-xs font-pixel text-slate-200 mb-2">
                    NAMA PENERIMA KADO <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="receiverName"
                    type="text"
                    value={receiverName}
                    maxLength={50}
                    onChange={(e) => {
                      setReceiverName(e.target.value);
                      if (fieldErrors.receiverName) {
                        setFieldErrors((prev) => ({ ...prev, receiverName: undefined }));
                      }
                    }}
                    placeholder="Contoh: Ayunda, Budi, atau Sahabat Tercinta"
                    className={`rpg-input w-full p-3 text-sm rounded-none transition-colors ${
                      fieldErrors.receiverName
                        ? "border-2 border-amber-400/80 bg-amber-950/20 shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                        : ""
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1.5 text-xs text-slate-400">
                    {fieldErrors.receiverName ? (
                      <p className="text-amber-300 flex items-center gap-1.5 font-sans">
                        <PixelSparkle size={11} className="text-amber-400 shrink-0" />
                        <span>{fieldErrors.receiverName}</span>
                      </p>
                    ) : (
                      <span>Nama ini akan dipanggil oleh NPC di dalam game!</span>
                    )}
                    <span>{receiverName.length}/50</span>
                  </div>
                </div>

                {/* Surat / Pesan Rahasia */}
                <div>
                  <label htmlFor="messageText" className="block text-xs font-pixel text-slate-200 mb-2">
                    SURAT / PESAN RAHASIA <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    id="messageText"
                    value={messageText}
                    maxLength={500}
                    rows={5}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      if (fieldErrors.messageText) {
                        setFieldErrors((prev) => ({ ...prev, messageText: undefined }));
                      }
                    }}
                    placeholder="Tuliskan ucapan selamat ulang tahun, ungkapan terima kasih, atau pesan menyentuh hati yang akan terbuka di garis akhir..."
                    className={`rpg-input w-full p-3 text-sm rounded-none leading-relaxed transition-colors ${
                      fieldErrors.messageText
                        ? "border-2 border-amber-400/80 bg-amber-950/20 shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                        : ""
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1.5 text-xs text-slate-400">
                    {fieldErrors.messageText ? (
                      <p className="text-amber-300 flex items-center gap-1.5 font-sans">
                        <PixelSparkle size={11} className="text-amber-400 shrink-0" />
                        <span>{fieldErrors.messageText}</span>
                      </p>
                    ) : (
                      <span>Pesan akan dimainkan dengan animasi mesin tik UTF-8 di akhir quest.</span>
                    )}
                    <span>{messageText.length}/500</span>
                  </div>
                </div>

                {/* Pilih Karakter Pahlawan */}
                <div id="avatar-section" tabIndex={-1} className="outline-none">
                  <label className="block text-xs font-pixel text-slate-200 mb-2">
                    PILIH KARAKTER PAHLAWAN <span className="text-amber-400">*</span>
                  </label>
                  <p className="text-xs text-slate-300 font-sans mb-3">
                    Pilih avatar yang akan dikendalikan penerima kado saat menjelajahi kota senja:
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Avatar Cowok */}
                    <button
                      type="button"
                      onClick={() => setAvatar("male")}
                      className={`p-3.5 flex items-center gap-3 border-2 transition-all text-left cursor-pointer rounded-xs ${
                        avatar === "male"
                          ? "bg-[#221c3b] border-[#ffd166] shadow-[0_0_12px_rgba(255,209,102,0.2),2px_2px_0px_#000]"
                          : "bg-[#141226] border-[#383461] hover:border-slate-500 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="w-12 h-12 bg-[#121324] border border-black flex items-center justify-center shrink-0">
                        <canvas ref={maleCanvasRef} width={64} height={64} className="w-10 h-10 image-pixelated" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-pixel text-xs text-white">Cowok</span>
                          {avatar === "male" && (
                            <span className="text-[9px] font-pixel text-[#2ed573] bg-[#2ed573]/20 px-1 py-0.5 border border-[#2ed573]/40">
                              DIPILIH
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                          Pendekar Biru
                        </span>
                      </div>
                    </button>

                    {/* Avatar Cewek */}
                    <button
                      type="button"
                      onClick={() => setAvatar("female")}
                      className={`p-3.5 flex items-center gap-3 border-2 transition-all text-left cursor-pointer rounded-xs ${
                        avatar === "female"
                          ? "bg-[#221c3b] border-[#ffd166] shadow-[0_0_12px_rgba(255,209,102,0.2),2px_2px_0px_#000]"
                          : "bg-[#141226] border-[#383461] hover:border-slate-500 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="w-12 h-12 bg-[#121324] border border-black flex items-center justify-center shrink-0">
                        <canvas ref={femaleCanvasRef} width={64} height={64} className="w-10 h-10 image-pixelated" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-pixel text-xs text-white">Cewek</span>
                          {avatar === "female" && (
                            <span className="text-[9px] font-pixel text-[#ffd166] bg-[#ffd166]/20 px-1 py-0.5 border border-[#ffd166]/40">
                              DIPILIH
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                          Pita & Gaun Rose
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tombol Lanjut ke Langkah 2 */}
                <div className="pt-4 border-t border-[#383461] flex justify-end">
                  <RetroButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleNextToStep2}
                    className="py-3 px-6 text-xs font-pixel flex items-center gap-2"
                  >
                    <span>Lanjut ke Foto & Musik</span>
                    <PixelArrow direction="right" size={12} className="shrink-0" />
                  </RetroButton>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* LANGKAH 2: FOTO KENANGAN & MUSIK                              */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Unggah Foto Kenangan */}
                <div id="photo-dropzone" tabIndex={-1} className="outline-none">
                  <label className="block text-xs font-pixel text-slate-200 mb-2">
                    FOTO KENANGAN SPESIAL <span className="text-amber-400">*</span>
                  </label>
                  <p className="text-xs text-slate-300 font-sans mb-3">
                    Foto ini akan dibingkai rapi dalam gaya polaroid koleksi di akhir petualangan:
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="rpg-inset p-4 flex flex-col sm:flex-row items-center gap-4 border border-[#ffd166]/40">
                      <div className="w-28 sm:w-32 shrink-0">
                        <PixelPhotoFrame
                          imageUrl={imagePreview}
                          alt="Foto Kado Kenangan"
                          aspectRatio="square"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="font-pixel text-[10px] text-[#2ed573] flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                          <PixelCheck size={12} />
                          <span>Foto Siap Disematkan</span>
                        </span>
                        <p className="font-sans text-xs text-slate-300 mb-3">
                          {imageFile ? `${imageFile.name} (${Math.round(imageFile.size / 1024)} KB)` : "Foto tersimpan"}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <RetroButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-[10px] py-1.5 px-3"
                          >
                            Ganti Foto
                          </RetroButton>
                          <RetroButton
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={handleRemoveImage}
                            className="text-[10px] py-1.5 px-3"
                          >
                            Hapus
                          </RetroButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors rounded-xs select-none ${
                        fieldErrors.image
                          ? "border-amber-400 bg-amber-950/25"
                          : "border-[#4a4575] bg-[#141226] hover:border-[#ffd166] hover:bg-[#1b1834]"
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xs bg-[#1f1b3a] border border-[#ffd166]/40 flex items-center justify-center">
                        <PixelGift size={24} className="text-[#ffd166]" />
                      </div>
                      <span className="font-pixel text-xs text-[#ffd166] block mb-1">
                        KLIK UNTUK UNGGAH FOTO
                      </span>
                      <p className="font-sans text-xs text-slate-400">
                        Format JPG, PNG, atau WebP (Maksimal 10 MB, kompresi otomatis)
                      </p>
                    </div>
                  )}

                  {fieldErrors.image && (
                    <p className="mt-1.5 text-xs text-amber-300 flex items-center gap-1.5 font-sans">
                      <PixelSparkle size={11} className="text-amber-400 shrink-0" />
                      <span>{fieldErrors.image}</span>
                    </p>
                  )}
                </div>

                {/* Musik Latar 8-Bit */}
                <div id="music-section">
                  <label className="block text-xs font-pixel text-slate-200 mb-2">
                    MUSIK LATAR 8-BIT <span className="text-amber-400">*</span>
                  </label>

                  {/* Tabs Preset vs Custom */}
                  <div className="flex border-b border-[#383461] mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMusicType("preset");
                        if (testAudioRef.current) testAudioRef.current.pause();
                        setIsPlayingTestAudio(false);
                      }}
                      className={`py-2 px-4 font-pixel text-[10px] border-b-2 transition-all cursor-pointer ${
                        musicType === "preset"
                          ? "border-[#ffd166] text-[#ffd166] bg-[#1e1a38]"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      Melodi Pilihan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMusicType("custom");
                        stopBgm();
                        setPreviewingPreset(null);
                      }}
                      className={`py-2 px-4 font-pixel text-[10px] border-b-2 transition-all cursor-pointer ${
                        musicType === "custom"
                          ? "border-[#ffd166] text-[#ffd166] bg-[#1e1a38]"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      Tautan .mp3 Sendiri
                    </button>
                  </div>

                  {musicType === "preset" ? (
                    <div className="space-y-2.5">
                      {PRESET_BGM_OPTIONS.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-3 border-2 flex items-center justify-between transition-colors rounded-xs ${
                            selectedPreset === opt.id
                              ? "bg-[#221c3b] border-[#ffd166]"
                              : "bg-[#141226] border-[#383461] hover:border-slate-500"
                          }`}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                            <input
                              type="radio"
                              name="preset_music"
                              checked={selectedPreset === opt.id}
                              onChange={() => setSelectedPreset(opt.id)}
                              className="accent-[#ffd166] cursor-pointer"
                            />
                            <span className="font-sans text-xs sm:text-sm text-slate-200 font-medium">
                              {opt.label}
                            </span>
                          </label>

                          <RetroButton
                            type="button"
                            variant={previewingPreset === opt.id ? "danger" : "secondary"}
                            size="sm"
                            onClick={() => handleTogglePresetPreview(opt.id)}
                            className="text-[10px] py-1 px-2.5 shrink-0"
                          >
                            {previewingPreset === opt.id ? "⏹ STOP" : "▶ TES"}
                          </RetroButton>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
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
                          className="text-[10px] px-3 shrink-0"
                        >
                          {isPlayingTestAudio ? "⏹ STOP" : "▶ TES"}
                        </RetroButton>
                      </div>
                      {fieldErrors.music && (
                        <p className="mt-1.5 text-xs text-amber-300 flex items-center gap-1.5 font-sans">
                          <PixelSparkle size={11} className="text-amber-400 shrink-0" />
                          <span>{fieldErrors.music}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigasi Langkah 2 */}
                <div className="pt-4 border-t border-[#383461] flex items-center justify-between">
                  <RetroButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setCurrentStep(1)}
                    className="py-3 px-5 text-xs font-pixel flex items-center gap-2"
                  >
                    <PixelArrow direction="left" size={12} className="shrink-0" />
                    <span>Kembali</span>
                  </RetroButton>

                  <RetroButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleNextToStep3}
                    className="py-3 px-6 text-xs font-pixel flex items-center gap-2"
                  >
                    <span>Lanjut ke Kuis & Bungkus</span>
                    <PixelArrow direction="right" size={12} className="shrink-0" />
                  </RetroButton>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* LANGKAH 3: KUIS OPSIONAL, KENANGAN & SUBMIT                   */}
            {/* ------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                {/* Tantangan Kuis RPG */}
                <div id="quiz-section">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-pixel text-slate-200">
                      TANTANGAN KUIS RPG (OPSIONAL)
                    </label>
                    <span className="font-pixel text-[10px] text-[#ffd166]">
                      {challenges.length}/3 SOAL
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans mb-4">
                    Sematkan teka-teki rahasia yang ditemui di jalan. Menjawab benar memberikan hadiah buff perisai atau kecepatan!
                  </p>

                  {/* Daftar Soal */}
                  <div className="space-y-4 mb-4">
                    {challenges.map((c, cIdx) => (
                      <div
                        key={c.id || cIdx}
                        className="rpg-inset p-4 border border-[#443e6d] rounded-xs space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#2d294a]">
                          <span className="font-pixel text-[10px] text-[#ffd166]">
                            SOAL #{cIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChallenge(cIdx)}
                            className="text-[10px] font-pixel text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            [Hapus]
                          </button>
                        </div>

                        {/* Pertanyaan */}
                        <div>
                          <input
                            type="text"
                            maxLength={140}
                            value={c.question}
                            onChange={(e) => handleChallengeChange(cIdx, "question", e.target.value)}
                            placeholder="Tuliskan pertanyaan rahasia..."
                            className="rpg-input w-full p-2 text-xs rounded-none"
                          />
                        </div>

                        {/* Pilihan Jawaban */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {c.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name={`correct_${cIdx}`}
                                checked={c.correctIndex === oIdx}
                                onChange={() => handleChallengeChange(cIdx, "correctIndex", oIdx as 0 | 1 | 2 | 3)}
                                title="Pilih sebagai kunci jawaban benar"
                                className="accent-[#2ed573] cursor-pointer"
                              />
                              <input
                                type="text"
                                maxLength={60}
                                value={opt}
                                onChange={(e) => handleChallengeOptionChange(cIdx, oIdx, e.target.value)}
                                placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                                className="rpg-input flex-1 p-1.5 text-xs rounded-none"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Hadiah Buff */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#2d294a] text-xs">
                          <span className="font-sans text-slate-300">Hadiah Buff:</span>
                          <select
                            value={c.buff}
                            onChange={(e) => handleChallengeChange(cIdx, "buff", e.target.value as BuffType)}
                            className="rpg-input p-1 text-xs rounded-none bg-[#121324] border border-[#383461] text-[#ffd166]"
                          >
                            <option value="shield">🛡️ Perisai Hati (Kebal 1x)</option>
                            <option value="speed">⚡ Sepatu Kilat (+35% Lari)</option>
                            <option value="power_star">✨ Bintang Sihir (Tembak Bintang)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {challenges.length < 3 && (
                    <RetroButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddChallenge}
                      className="w-full py-2.5 text-xs font-pixel flex items-center justify-center gap-2 border-dashed"
                    >
                      <span>+ Tambah Soal Kuis ({challenges.length}/3)</span>
                    </RetroButton>
                  )}
                </div>

                {/* Pesan Khusus di 4 Bintang Kenangan (Accordion Opsional) */}
                <div className="border border-[#383461] rounded-xs bg-[#141226] p-3.5">
                  <button
                    type="button"
                    onClick={() => setShowMemorySection(!showMemorySection)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="font-pixel text-[10px] text-[#ffd166] flex items-center gap-1.5">
                      <PixelStar size={11} />
                      <span>Pesan Khusus di 4 Bintang Kenangan (Opsional)</span>
                    </span>
                    <span className="font-pixel text-[9px] text-slate-400">
                      {showMemorySection ? "[Tutup ▲]" : "[Buka ▼]"}
                    </span>
                  </button>

                  {showMemorySection && (
                    <div className="mt-3 pt-3 border-t border-[#2a264a] space-y-2 animate-fade-in">
                      <p className="font-sans text-xs text-slate-300 mb-2">
                        Teks singkat (maks 40 karakter) yang muncul saat pemain menyentuh tiap bintang kenangan:
                      </p>
                      {memoryMessages.map((msg, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="font-pixel text-[9px] text-[#ffd166] shrink-0 w-16">
                            Bintang {idx + 1}:
                          </span>
                          <input
                            type="text"
                            maxLength={40}
                            value={msg}
                            onChange={(e) => {
                              const next = [...memoryMessages];
                              next[idx] = e.target.value;
                              setMemoryMessages(next);
                            }}
                            placeholder={`Kenangan #${idx + 1}...`}
                            className="rpg-input flex-1 p-1.5 text-xs rounded-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigasi Langkah 3 & Submit Final */}
                <div className="pt-4 border-t border-[#383461] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <RetroButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setCurrentStep(2)}
                    className="py-3 px-5 text-xs font-pixel flex items-center justify-center gap-2"
                  >
                    <PixelArrow direction="left" size={12} className="shrink-0" />
                    <span>Kembali ke Foto</span>
                  </RetroButton>

                  <RetroButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting || isAnyChallengeUploading}
                    className="py-3.5 px-7 text-xs sm:text-sm font-pixel flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] hover:scale-[1.02] transition-transform"
                  >
                    {isSubmitting ? (
                      <>
                        <PixelSparkle size={14} className="animate-spin text-black shrink-0" />
                        <span>{statusText || "Memproses..."}</span>
                      </>
                    ) : (
                      <>
                        <PixelGift size={16} className="text-black shrink-0" />
                        <span>BUNGKUS KADO SEKARANG</span>
                      </>
                    )}
                  </RetroButton>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN: LIVE PREVIEW KARTU KADO (Desktop Sticky / Mobile Collapsible) */}
        {/* ========================================================================= */}
        <div className={`lg:col-span-5 w-full ${showMobilePreview ? "block" : "hidden lg:block"} lg:sticky lg:top-6`}>
          <div className="rpg-box-golden p-4 sm:p-5 shadow-2xl relative">
            {/* Header Pratinjau */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#ffd166]/30">
              <div className="flex items-center gap-1.5">
                <PixelSparkle size={12} className="text-[#ffd166] animate-pulse" />
                <span className="font-pixel text-[10px] text-[#ffd166] tracking-wider">
                  PRATINJAU KADO LIVE
                </span>
              </div>
              <span className="text-[9px] font-pixel text-[#2ed573] bg-[#2ed573]/20 px-1.5 py-0.5 border border-[#2ed573]/40">
                REAL-TIME
              </span>
            </div>

            {/* Kartu Polaroid Pratinjau */}
            <div className="bg-[#fffef0] text-[#1a1c2c] p-4 rounded-xs shadow-[4px_4px_0px_#000] border-2 border-[#1a1c2c] space-y-3.5">
              {/* Header Kartu */}
              <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                <div>
                  <span className="text-[9px] font-pixel text-gray-500 uppercase tracking-widest block">
                    Kado Spesial Untuk
                  </span>
                  <span className="font-pixel text-xs sm:text-sm text-[#1a1c2c] block mt-0.5 font-bold">
                    {receiverName.trim() || "Nama Penerima"}
                  </span>
                </div>
                <div className="w-10 h-10 bg-[#121324] border border-black rounded-xs flex items-center justify-center shrink-0">
                  <canvas
                    ref={livePreviewAvatarCanvasRef}
                    width={64}
                    height={64}
                    className="w-8 h-8 image-pixelated"
                  />
                </div>
              </div>

              {/* Foto Kenangan Live Preview */}
              <div className="w-full aspect-video bg-[#1e1c33] rounded-xs overflow-hidden flex items-center justify-center border-2 border-black relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Pratinjau Kado"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <PixelGift size={24} className="mx-auto mb-1.5 text-amber-300/60" />
                    <span className="font-pixel text-[9px] text-gray-400 block">
                      Foto kenangan akan tampil di sini
                    </span>
                  </div>
                )}
              </div>

              {/* Kutipan Pesan Rahasia */}
              <div className="bg-[#f7f5e7] p-2.5 border border-gray-300 rounded-xs min-h-[64px]">
                <p className="font-sans text-xs text-gray-700 italic leading-relaxed line-clamp-3">
                  &ldquo;{messageText.trim() || "Surat rahasia dan ucapan hangatmu akan terketik di sini..."}&rdquo;
                </p>
              </div>

              {/* Info Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] font-pixel text-gray-600">
                <span className="bg-gray-200 px-2 py-0.5 rounded-xs border border-gray-300">
                  ♪ {musicType === "preset" ? PRESET_BGM_OPTIONS.find((p) => p.id === selectedPreset)?.label.split(" ")[0] || "Cozy" : "Custom MP3"}
                </span>
                <span className="bg-gray-200 px-2 py-0.5 rounded-xs border border-gray-300">
                  {challenges.length} Kuis
                </span>
                <span className="bg-gray-200 px-2 py-0.5 rounded-xs border border-gray-300">
                  Format 16-Bit
                </span>
              </div>
            </div>

            {/* Status Checklist Ringkas */}
            <div className="mt-4 pt-3 border-t border-[#383461] space-y-1.5 text-[10px] font-sans text-slate-300">
              <div className="flex items-center justify-between">
                <span>Nama & Pesan:</span>
                <span className={receiverName.trim() && messageText.trim() ? "text-[#2ed573] font-bold" : "text-amber-400"}>
                  {receiverName.trim() && messageText.trim() ? "✓ Lengkap" : "Menunggu input"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Foto Kenangan:</span>
                <span className={imageFile || cachedUploadedImageUrl ? "text-[#2ed573] font-bold" : "text-amber-400"}>
                  {imageFile || cachedUploadedImageUrl ? "✓ Terunggah" : "Belum diunggah"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tantangan Kuis:</span>
                <span className="text-[#ffd166]">
                  {challenges.length > 0 ? `${challenges.length} Tantangan` : "0 (Opsional)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
