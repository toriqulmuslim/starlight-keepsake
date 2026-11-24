<div align="center">

# Starlight Keepsake
### 16-Bit HD-2D Retro Action-RPG Interactive Gift Experience

*Ubah ucapan ulang tahun, anniversary, atau ungkapan terima kasih menjadi petualangan game retro 16-bit berkesan yang dapat dimainkan langsung di web.*

<br/>

[![Next.js 16](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![KAPLAY.js](https://img.shields.io/badge/KAPLAY.js-FF2D20?style=for-the-badge&logo=javascript&logoColor=white)](https://kaplayjs.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)](https://developers.google.com/apps-script)
[![ImgBB API](https://img.shields.io/badge/ImgBB_API-0080FF?style=for-the-badge&logo=icloud&logoColor=white)](https://imgbb.com/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

[**Coba Demo Langsung**](https://starlight-keepsake.vercel.app/play/demo-quiz) • [**Baca Master PRD**](./PRD.md) • [**Cara Menjalankan**](#quick-start)

</div>

---

## Tentang Proyek

**Starlight Keepsake** adalah platform web modern yang mentransformasikan kartu ucapan konvensional menjadi petualangan aksi-RPG *16-bit HD-2D* bertema *Cozy Sunset & Starlight*.

Penerima kado memainkan karakter pahlawan pilihan mereka melintasi atap kota senja, menjawab kuis kenangan pribadi untuk mendapatkan buff tempur, bereuni dengan pasangan (*AI Co-op Partner*) di bawah naungan Pohon Sakura Raksasa, bertarung mengalahkan *Dragon Boss*, mengeksekusi serangan kombo pamungkas **Duo Starlight Slash**, dan membuka peti kado berisi foto kenangan serta pesan manis yang dapat diekspor menjadi **Kartu Pos Polaroid HD (.PNG)** lengkap dengan stempel prangko petualangan.

---

## Fitur Unggulan

| Fitur | Deskripsi Singkat |
| :--- | :--- |
| **3-Step RPG Quest Wizard** | Formulir pembuatan kado `/create` terbagi rapi ke dalam 3 langkah dengan **Live Preview Kartu Kado real-time** di desktop dan peringatan validasi *Soft Amber* yang lembut. |
| **Full-Viewport 16:9 Engine** | Penskalaan kanvas adaptif `Math.min(vw/480, vh/270)` memenuhi layar 100% tanpa bingkai gelap tebal di laptop/desktop, tetap tajam dengan CSS `image-rendering: pixelated;`. |
| **4 Babak Cerita & Prolog Sinematik** | Alur sinematik JRPG lengkap: Pencurian kado oleh *Shadow Boss*, reuni emosional di Puncak Sakura, arena pertempuran naga, dan mode damai pasca tamat (*Peaceful Post-Game*). |
| **JRPG 2-Stage Typewriter** | Animasi ketikan mesin tik bebas *glitch* dan *race condition* dengan `useRef`. Klik atau Spasi saat mengetik langsung menyelesaikan teks instan; klik berikutnya memajukan cerita. |
| **AI Co-op Partner & Duo Finisher** | Rekan petualang AI yang mendampingi naik-turun atap, membantu menyerang berkala, menyelamatkan saat HP kritis (*Partner Rescue*), serta eksekusi tebasan silang duet *Duo Starlight Slash*. |
| **Procedural Chiptune Audio** | Generator audio 8-bit prosedural menggunakan native Web Audio API (zero asset lag) dengan 3 preset lagu chiptune berulang, dukungan custom MP3, dan unlock sinkron anti-blokir browser. |
| **Polaroid Export (.PNG)** | Hasil kado diarsipkan menjadi kartu polaroid digital 800×1140 px siap cetak dengan stempel prangko *Momen Petualangan* hasil tangkapan layar kanvas kemenangan. |
| **Mobile First & Thumb-Friendly** | Virtual D-Pad ergonomis, safe-area padding iPhone/Android, dan banner orientasi potret auto-dismiss 4 detik yang tidak menutupi HUD. |

---

## Tech Stack & Ekosistem

- **Frontend Core:** [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Bahasa:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode & Clean Architecture)
- **Game Engine:** [KAPLAY.js](https://kaplayjs.com/) (`v3001.0.19`, WebGL 2D ECS terisolasi di `lib/game/`)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + Custom Pixel-Art CSS Utilities
- **Audio Engine:** Web Audio API Native + HTML5 Audio Scheduler
- **Backend & Database:** [Google Apps Script](https://developers.google.com/apps-script) + Google Sheets (Serverless, No Monthly Cost)
- **Penyimpanan Media:** [ImgBB REST API](https://imgbb.com/) (Client-side Canvas Pre-Compression)
- **Quality Assurance:** [Playwright](https://playwright.dev/) End-to-End Automated Browser Testing

---

## Quick Start

### 1. Kloning & Pasang Dependensi
```bash
git clone https://github.com/toriqulmuslim/starlight-keepsake.git
cd starlight-keepsake
npm install
```

### 2. Konfigurasi Lingkungan (`.env.local`)
Buat berkas `.env.local` di root proyek:
```env
# URL Web App Google Apps Script (Opsional untuk pengujian demo lokal)
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/YOUR_GAS_DEPLOYMENT_ID/exec

# ImgBB API Key untuk unggah foto kado (Opsional)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

> **Mode Demo Publik Instan:** Anda dapat langsung mencoba gameplay lengkap tanpa setup backend di:  
> **[https://starlight-keepsake.vercel.app/play/demo-quiz](https://starlight-keepsake.vercel.app/play/demo-quiz)**

---

## Verifikasi & Standar Kode

Proyek ini menerapkan protokol verifikasi ketat sebelum setiap *commit*:
```bash
# 1. Typecheck TypeScript
npx tsc --noEmit

# 2. Linting Kode
npm run lint

# 3. Production Build
npx next build --webpack
```

---

## Struktur Direktori Ringkas

```
starlight-keepsake/
├── app/                        # Next.js App Router (/, /create, /play/[id])
├── components/                 # UI Komponen React, Wizard 3-Langkah, & JRPG Modal
├── lib/
│   ├── api.ts                  # Integrasi Google Apps Script & SessionStorage Cache
│   ├── imgbb.ts                # Client Image Upload & Canvas Compression
│   ├── types.ts                # Kontrak Data TypeScript & Skema Buff
│   └── game/                   # Logika Murni Game KAPLAY (Bebas Hook React)
├── gas/
│   └── Code.js                 # Kode Backend Google Apps Script (Kolom A-I Sheet)
├── public/                     # Aset Musik 8-Bit & Sprite Retro 16-Bit
├── PRD.md                      # Master Product Requirement Document
└── README.md                   # Dokumentasi Utama Repositori
```

---

## Lisensi & Atribusi

- **Source Code:** Berlisensi [MIT License](LICENSE).
- **Aset Sprite 16-Bit:** Lisensi aset publik retro oleh Ansimuz (*Legacy Collection / Grotto Escape 2*).
- **Spesifikasi Lengkap:** Pelajari seluruh detail teknis, formula fisika, dan aturan arsitektur di [PRD.md](./PRD.md).
