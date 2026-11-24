# Product Requirement Document (PRD) Master: Starlight Keepsake
**Petualangan Kado Interaktif 16-Bit HD-2D (Cozy Sunset & Starlight Action-RPG)**

---

## 1. Gambaran Umum & Tech Stack

### 1.1 Ringkasan Proyek
**Starlight Keepsake** (sebelumnya *Digital-8-Bit*) adalah platform web interaktif untuk membuat kado digital personal berbasis web dengan estetika *16-bit HD-2D*. Pengguna dapat merancang pesan kasih sayang, mengunggah foto kenangan, menyusun tantangan kuis teka-teki manis, serta memilih musik latar 8-bit melalui wizard 3 langkah dengan *Live Preview*. Hasil kado diterbitkan menjadi sebuah tautan mini-game petualangan *16-bit Action-RPG* bertema *Cozy Sunset & Starlight* di mana penerima kado mengendalikan karakter pilihan mereka, menjelajahi atap kota senja bersama *Companion Pet*, mengalahkan monster, menjawab kuis rahasia, bergabung bersama *Partner Co-op* di bawah Pohon Sakura, menaklukkan *Dragon Boss* dengan *Duo Starlight Slash Finisher*, dan membuka kotak kado spesial di garis akhir. Di akhir misi, penerima dapat menyimpan Kartu Kado (.PNG) berkualitas tinggi bergaya polaroid koleksi lengkap dengan stempel prangko mini snapshot petualangan.

### 1.2 Tech Stack Utama
- **Framework Web:** Next.js 16 (App Router, React 19, Webpack / Turbopack).
- **Styling & Tema:** Tailwind CSS v4, Custom RPG Utility Classes (`globals.css`), CSS Pixel-Art Filtering (`image-rendering: pixelated`).
- **Game Engine:** KAPLAY.js (mode isolated instance `global: false`, resolusi virtual 480×270, rasio 16:9, penskalaan adaptif Full-Viewport 16:9 anti-burik).
- **Audio Engine:** Modul mandiri Web Audio API & HTML5 Audio singleton (`lib/game/sfx.ts`, zero React dependency, look-ahead scheduler 8-bit chiptune synthesizer).
- **Backend Database:** Google Sheets via Google Apps Script (GAS) Web App (Simple Request tanpa preflight CORS, format teks polos `@`, pencarian cepat `createTextFinder`, skema Kolom A–I).
- **Media Storage:** ImgBB API (client-side canvas pre-compression untuk file > 1.5 MB ke maksimal 1600 px kualitas 0.85, batas timeout 60 detik).
- **Visual & Typography:**
  - Font Judul & Aksen: `"Press Start 2P"` (Google Fonts).
  - Font Teks & Formulir: `"Plus Jakarta Sans"` (Google Fonts).
  - Animasi & Efek: Canvas Confetti, Partikel Ledakan 16-Bit, Mesin Tik JRPG 2-Tahap UTF-8 (kode poin aman emoji, bebas race condition).

### 1.3 Arsitektur Direktori
```
starlight-keepsake/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout & pemuatan Google Fonts (min-h-dvh, smooth scroll)
│   ├── page.tsx                # Beranda (Hero Split Starlight Keepsake + 3 Langkah Quest)
│   ├── not-found.tsx           # Layar 404 retro 8-bit global
│   ├── globals.css             # Tema warna, utilitas RPG, skala z-index
│   ├── create/page.tsx         # Halaman formulir pembuatan kado (3-Step RPG Wizard)
│   └── play/[id]/page.tsx      # Halaman petualangan game penerima kado (Full-screen)
├── components/                 # Komponen Antarmuka React
│   ├── CreateForm.tsx          # 3-Step RPG Quest Wizard + Live Preview Card (Amber Soft Validation)
│   ├── GameCanvas.tsx          # Wrapper canvas KAPLAY (Full-Viewport 16:9), HUD retro, & lifecycle
│   ├── StartScreen.tsx         # Layar penyambutan PRESS START & preloader 0% -> 100%
│   ├── PrologueModal.tsx       # Modal Live Cutscene JRPG (2-Stage Typewriter State Machine)
│   ├── ReunionModal.tsx        # Modal dialog reuni romantis (2-Stage Typewriter State Machine)
│   ├── ChallengeModal.tsx      # Modal interaksi kuis rahasia NPC kelinci (Clean Timer Cleanup)
│   ├── GiftModal.tsx           # Modal selebrasi kado, mesin tik instan skip, & ekspor kartu PNG
│   ├── PixelRibbonBanner.tsx   # Banner pita piksel 16-bit RPG klasik untuk header modal
│   ├── PixelPhotoFrame.tsx     # Bingkai foto 9-slice ornamen emas & sudut permata piksel
│   ├── PixelIcons.tsx          # Pustaka ikon piksel SVG 16-bit tajam (Zero-Emoji)
│   ├── VirtualDPad.tsx         # Kontrol sentuh on-screen (D-Pad) untuk mobile
│   └── RetroButton.tsx         # Komponen tombol bergaya arcade empuk berdimensi 16-bit
├── lib/
│   ├── api.ts                  # Integrasi GAS, caching sessionStorage, normalisasi data
│   ├── devFixtures.ts          # Fixture demo publik (demo-quiz, demo-basic) & dev
│   ├── imgbb.ts                # Client upload ImgBB dengan canvas compression
│   ├── types.ts                # Kontrak data TypeScript & metadata buff
│   ├── validate.ts             # Skema validasi formulir di sisi klien
│   └── game/                   # Logika murni game (bebas import React)
│       ├── createGame.ts       # Logika engine KAPLAY, entitas, physics, & level
│       ├── sfx.ts              # Sintesis audio BGM 8-bit & efek suara
│       └── sprites.ts          # Registrasi sprite, fallback prosedural, & scaling
├── gas/
│   └── Code.js                 # Kode backend Google Apps Script (Kolom A-I)
├── public/
│   ├── music/                  # Berkas BGM audio (cozy, happy, romantic)
│   └── sprites/                # Aset visual 16-bit PNG yang dioptimasi
├── PRD.md                      # Dokumen spesifikasi tunggal (Single Source of Truth)
└── README.md                   # Dokumentasi publik repositori GitHub
```

---

## 2. Alur Pengguna (User Flow)

```
[ Beranda (/) ] 
      │
      ├──> [ Tombol "Coba Contoh Kado" ] ──> /play/demo-quiz (Demo instan publik)
      │
      └──> [ Tombol "Buat Kado Sekarang" ]
                 │
                 ▼
       [ Formulir Pembuatan (/create) ]
       ├─ Identitas Penerima & Pesan Rahasia
       ├─ Pilihan Avatar (Cowok / Cewek)
       ├─ Unggah Foto Kenangan (Kompresi Otomatis)
       ├─ Quiz Builder (0–3 Soal + Hadiah Buff)
       └─ Pilihan Musik 8-Bit (Preset / Custom .mp3)
                 │
                 ▼
          [ Submit Form ] ───(Upload ImgBB & GAS Simpan)
                 │
                 ▼
       [ Layar Sukses Penerbitan Kado ]
       ├─ Salin Tautan (/play/[id])
       ├─ Bagikan Langsung ke WhatsApp
       └─ Opsi "Coba Mainkan Sendiri"
                 │
                 ▼
       [ Penerima Membuka /play/[id] ]
                 │
                 ├── (ID tidak ada) ──> [ 404 Retro Screen ]
                 │
                 ▼ (ID Valid)
       [ Start Screen: "PRESS START" ] ──(Audio Unlock & BGM Nyala)
                 │
                 ▼
       [ Mode Gameplay Interaktif ]
       ├─ Karakter & Companion Pet menembus Atap Kota Senja
       ├─ Melompati Jurang Antar-Atap & Platform Jembatan
       ├─ Combat: Kalahkan Slime, Kelelawar, & Skeleton
       ├─ Ambil Bintang Kenangan (Floating Toast)
       ├─ Bicara ke NPC Kelinci ──> [ Modal Kuis & Hadiah Buff ]
       └─ Sentuh Kotak Kado di Garis Akhir
                 │
                 ▼
       [ Selebrasi Kado & GiftModal ]
       ├─ Konfeti & Efek Mesin Tik Pesan Hangat
       ├─ Tampilan Foto Kenangan dalam Frame Polaroid
       └─ Unduh Kartu Kado (.PNG) Koleksi 16-Bit
```

### 2.1 Halaman Beranda (`/`)
- Desain *Hero Split* (2 Kolom Desktop, Stack Vertikal Rapi di Layar Ponsel) dengan tema *Starlight Keepsake* (16-bit HD-2D) berlatar belakang berbintang dinamis (`starlight-bg`).
- Sisi Kiri: Headline tajam, subjudul hangat yang singkat, dan 2 tombol aksi utama: **Buat Kado Sekarang** menuju `/create` dan **Coba Contoh Kado** menuju `/play/demo-quiz` (berjalan tanpa ketergantungan koneksi Google Sheets).
- Sisi Kanan: Bingkai pratinjau visual game 16-bit asli menggunakan aset internal proyek (`bg_city_mid`, sprite pahlawan, pet, dan peti kado).
- Di bawah Hero: Alur quest 3 langkah singkat yang lega dan nyaman di-scroll: Persiapan Pesan & Foto → Personalisasi Petualangan & Kuis → Bagikan & Rayakan.
- Seluruh halaman menggunakan `min-h-dvh` dengan scroll mulus tanpa batasan `overflow-hidden`.

### 2.2 Halaman Pembuatan Kado (`/create`)
- **Struktur RPG Quest Wizard (3 Langkah) + Live Preview Real-Time:**
  1. **Langkah 1 (Penerima & Pesan):**
     - Nama Penerima (1–50 karakter).
     - Surat Rahasia (1–500 karakter).
     - Pilihan Avatar Pahlawan: Cowok (Pendekar Biru) atau Cewek (Gaun & Pita Rose) dengan preview sprite interaktif.
  2. **Langkah 2 (Foto & Musik):**
     - Unggah Foto Kenangan: Dropzone retro responsif keyboard (`tabIndex={0}`), validasi format JPG/PNG/WebP maks 10MB, tombol ganti/hapus, serta auto-kompresi kanvas client-side.
     - Musik Latar 8-Bit: Pilihan preset (*Cozy Sunset*, *Happy Birthday*, *Starlight Lullaby*) dilengkapi tombol audio tester ▶ TES / ⏹ STOP, atau opsi input tautan `.mp3` langsung HTTPS.
  3. **Langkah 3 (Bonus & Bungkus):**
     - Tantangan Kuis RPG (Opsional, 0–3 soal) lengkap dengan 4 opsi jawaban, kunci jawaban, dan hadiah buff (*Shield Aura*, *Speed Boost*, *Power Star*).
     - Pesan Khusus 4 Bintang Kenangan (Opsional, maks 40 karakter per bintang) yang muncul saat bintang disentuh di Babak 1.
     - Tombol final **"Bungkus Kado Sekarang"** dengan safe-area bottom padding (`pb-[max(2rem,env(safe-area-inset-bottom))]`).
- **Live Preview Kartu Kado (Desktop `lg:`):**
  Kolom kanan menampilkan kartu pratinjau real-time dengan bingkai piksel 9-slice emas, nama penerima, sprite avatar aktif, dan foto kenangan yang diunggah.
- **Validasi Ramah & Estetik (Warm Amber):**
  Menggantikan banner merah keras dengan notifikasi peringatan lembut (*warm amber* `#FBBF24` / `bg-amber-950/30` berlis 1px halus), auto-focus ke field pertama yang belum terisi saat tombol "Lanjut" ditekan, serta indikator kelengkapan yang tenang.
- Generator ID menggunakan `makeId()` (idempoten via ref) untuk mencegah submit ganda.

### 2.3 Layar Mulai & Gameplay (`/play/[id]`)
- **Pemuatan Awal:** Loader retro bertema peti kado. Jika kado tidak ditemukan, tampil layar 404 retro 8-bit lengkap dengan tombol buat kado baru.
- **Start Screen Overlay (`z-30`):** Berfokus secara emosional dan elegan pada nama penerima kado, pita RPG `PixelRibbonBanner`, ilustrasi kado piksel 16-bit, dan tombol empuk **"⚔️ PRESS START"** dengan preloader jujur 0% → 100%.
- **Inisialisasi Audio & Alur Transisi:** Saat `PRESS START` ditekan, Web Audio API di-unlock seketika (sinkron gestur pengguna) dan alur membuka **Prolog Live Cutscene JRPG (3 Adegan HTML HD, `z-[290]`)** sebelum kontrol karakter aktif.
- **Prolog Live Cutscene JRPG (`z-[290]`):**
  - Kotak dialog JRPG bawah layar berbingkai bevel emas dengan potret pembicara (Shadow Boss, Partner Canvas, Panduan).
  - Menggunakan *2-Stage Typewriter State Machine* dengan `timerRef = useRef`:
    - Klik atau tombol `Spasi`/`Enter` saat teks mengetik langsung membatalkan timer aktif dan memunculkan 100% teks kalimat tanpa melompati adegan.
    - Klik / `Spasi` berikutnya baru memajukan ke adegan berikutnya.
    - Dilengkapi `e.repeat` guard agar penekanan lama tidak memicu glitch.
- **Kanvas Game (KAPLAY):**
  - **Full-Viewport 16:9 Adaptive Scaling:** Membesar maksimal 100% mengikuti lebar atau tinggi viewport (`100vw` / `100dvh`) dengan rumus `Math.min(vw / 480, vh / 270)` tanpa batas integer sempit, menghilangkan bingkai gelap tebal di laptop/desktop.
  - Resolusi virtual internal `480×270` piksel terkunci rasio 16:9 (`aspect-video`) dan filter CSS `image-rendering: pixelated;` tetap tajam.
  - `overflow-hidden` dikunci khusus di rute `/play/[id]` agar gameplay full-screen imersif.
- **HUD Kiri & Kanan Atas (`z-[260]`):** Indikator HP hati (`♥`), perisai, buff timer, progres kuis, dan tombol audio/jeda/bantuan.
- **Banner Orientasi Mobile Portrait:** Banner "Putar layar Anda (Landscape disarankan)" diposisikan aman di bawah HUD (`top-14` / `top-16`) dengan fitur auto-dismiss setelah 4 detik dan `pointer-events-none`.
- **Virtual D-Pad Mobile (`z-20`):** Otomatis aktif pada layar sentuh/sempit. Terletak nyaman di zona ibu jari bawah tanpa menutupi karakter gameplay.
- **Dialog Kuis (`ChallengeModal`, `z-[300]`):** Terbuka saat interaksi dengan NPC Kelinci. Game menjeda waktu; timer feedback 1.2s dibersihkan aman pada unmount. Menjawab benar memberi buff; salah mengurangi 1 HP.
- **Dialog Reuni (`ReunionModal`, `z-[290]`):** Terbuka saat mendekati Partner di Pohon Sakura dengan *2-Stage Typewriter State Machine* instan skip yang bebas race condition.
- **Selebrasi Akhir:** Saat Boss dikalahkan dan peti kado disentuh, kado berguncang diiringi fanfare dan `GiftModal` terbuka.

### 2.4 Modal Kado & Unduh Kartu (.PNG)
- **GiftModal (`z-[400]`):** Tampil di atas seluruh lapisan game dengan efek taburan konfeti.
- **Polaroid Foto Kenangan:** Foto kenangan ditampilkan di dalam frame polaroid miring 1 derajat bertekstur kertas album klasik.
- **Animasi Mesin Tik Bebas Glitch:**
  - Kalimat surat dimainkan dengan interval 25 ms/karakter (kode poin aman UTF-8 `Array.from`).
  - Timer disimpan di `typewriterTimerRef = useRef` sehingga tombol `[Lewati Animasi ▶▶]`, klik langsung pada panel perkamen, atau tombol keyboard `Spasi`/`Enter`/`Esc` langsung membatalkan timer seketika dan menampilkan 100% teks tanpa rewind glitch.
- **Ekspor Kartu Kado Museum-Grade (`handleSaveCard`):**
  - Menghasilkan gambar `.png` resolusi tinggi (800 × 1140 piksel) siap cetak/simpan ke galeri ponsel.
  - Menunggu `document.fonts.ready` agar tipografi ter-render sempurna.
  - Membagi paragraf teks per baris baru (`\n`) dan memotong kata panjang secara otomatis agar tidak keluar batas kotak surat.
  - Menyertakan deteksi proteksi CORS pada gambar eksternal dengan fallback pesan informatif dan ilustrasi kado emas.
  - Memuat stempel prangko mini *"MOMEN PETUALANGAN"* hasil snapshot kanvas kemenangan, cap resmi *"QUEST CLEARED 100% COMPLETE"*, dan tanggal arsip digital.

---

## 3. Skema Data & Kontrak Backend

### 3.1 Kontrak Model Data TypeScript (`lib/types.ts`)
```ts
export type AvatarGender = "male" | "female";
export type BuffType = "shield" | "speed" | "power_star";

export interface ChallengeItem {
  id: string;
  question: string;               // 1 - 140 karakter
  imageUrl?: string;              // Tautan HTTPS opsional (ImgBB)
  options: [string, string, string, string]; // Tepat 4 pilihan, masing-masing 1 - 60 karakter
  correctIndex: 0 | 1 | 2 | 3;
  buff: BuffType;
}

export interface GiftData {
  id: string;                     // 8 - 64 karakter alfanumerik / hyphen
  receiver_name: string;          // 1 - 50 karakter
  message_text: string;           // 1 - 500 karakter
  image_url: string;              // Tautan foto kado utama (https://i.ibb.co/...)
  music_url?: string;             // preset:cozy | preset:happy | preset:romantic | https://...mp3
  created_at?: string;            // ISO Timestamp
  avatar?: AvatarGender;          // 'male' | 'female' (default 'male')
  challenges?: ChallengeItem[];   // Maksimal 3 soal kuis
  memory_messages?: string[];     // Pesan di 4 Bintang Kenangan (opsional, maks 40 char/bintang)
}

export interface NormalizedGiftData {
  id: string;
  receiver_name: string;
  message_text: string;
  image_url: string;
  music_url?: string;
  created_at?: string;
  avatar: AvatarGender;
  challenges: ChallengeItem[];
  memory_messages?: string[];
}
```

### 3.2 Metadata Buff Gameplay (`BUFF_META`)
| Tipe Buff | Ikon | Label | Durasi | Efek Gameplay |
|---|:---:|---|:---:|---|
| `shield` | 🛡️ | Perisai Hati | 1× Sentuhan | Menolak 1 kali pengurangan nyawa saat tersentuh monster atau proyektil. |
| `speed` | ⚡ | Sepatu Kilat | 15 Detik | Meningkatkan kecepatan lari sebesar +35% (110 → 148 px/s) dan tinggi lompat. |
| `power_star` | ✨ | Bintang Sihir | 20 Detik | Memberikan kemampuan menembakkan proyektil bintang ajaib berkecepatan tinggi. |

### 3.3 Google Apps Script (`gas/Code.js`)
- **Skema Kolom Google Sheet (Sheet: `gifts`):**
  Kolom A–I dipetakan secara dinamis berdasarkan nama header:
  1. `id`
  2. `receiver_name`
  3. `message_text`
  4. `image_url`
  5. `music_url`
  6. `created_at`
  7. `avatar`
  8. `challenges` (disimpan dalam bentuk JSON string)
  9. `memory_messages` (disimpan dalam bentuk JSON string)
- **Aturan Integritas Spreadsheet:**
  - Baris baru selalu diformat Plain Text (`setNumberFormat('@')`) sebelum penulisan nilai agar input seperti `=1+1`, `007`, atau `1/2` tidak diubah menjadi formula, angka nol hilang, atau tanggal.
  - Pencarian ID kado menggunakan `sheet.getRange("A:A").createTextFinder(id).matchEntireCell(true).findNext()` untuk efisiensi tinggi tanpa memuat seluruh sheet ke memori.
  - Metode `doPost` mengunci eksekusi via `LockService.getScriptLock()` (maksimal 10 detik).
  - Metode `doGet` dibungkus dalam blok `try/catch` dan mengembalikan JSON terstruktur.
- **Protokol Jaringan Klien (`lib/api.ts`):**
  - Request POST dikirim dengan `Content-Type: text/plain;charset=utf-8` (Simple Request) agar browser tidak memicu preflight CORS OPTIONS yang sering gagal di serverless Google Apps Script.
  - Dilengkapi timeout 30 detik untuk penyimpanan (`createGift`) dan 15 detik untuk pengambilan (`fetchGift`) menggunakan `AbortController`.
  - Respons non-JSON otomatis dipetakan ke pesan ramah: *"Server sedang sibuk, coba lagi."*
  - Dukungan cache lokal `sessionStorage` untuk mempercepat pemuatan halaman kado yang sama tanpa membebani kuota harian Google Apps Script.
  - Kompatibilitas Kado Versi Lama: Jika kado tidak memiliki atribut `avatar` dan `challenges`, sistem otomatis mengisi default `avatar: "male"` dan `challenges: []`.

### 3.4 Penyimpanan Media ImgBB (`lib/imgbb.ts`)
- File diunggah langsung dari browser klien ke REST API ImgBB (`https://api.imgbb.com/1/upload`).
- **Kompresi Kanvas Otomatis:** File gambar yang berukuran > 1.5 MB otomatis diperkecil melalui Canvas HTML5 ke dimensi terpanjang maksimal 1600 px dengan kompresi WebP/JPEG kualitas 0.85 sebelum diunggah.
- Request dilindungi timeout 60 detik melalui `AbortController`.

---

## 4. Mekanik Gameplay & Engine KAPLAY

### 4.1 Standar Konfigurasi Layar & Physics
- **Resolusi Virtual:** 480 × 270 piksel (Hi-Bit Resolusi, Rasio Aspek 16:9, kelipatan presisi bulat 4× pada monitor Full HD 1080p).
- **Gravitasi Dunia:** 800 px/s².
- **Kecepatan Lari:** 100 px/s (Normal) / 135 px/s (Speed Buff).
- **Kekuatan Lompat:** -300 px/s (Menghasilkan tinggi lompatan ~56.25 px).
- **Penskalaan Full-Viewport 16:9 Adaptif (`computeScale`):**
  - Kanvas dirender pada resolusi virtual internal `480×270` piksel dan diperbesar adaptif mengikuti rumus `scale = Math.min(viewportWidth / 480, viewportHeight / 270)`.
  - Mengunci rasio 16:9 (`aspect-video`) secara presisi tanpa memotong konten dan tanpa bingkai gelap tebal di keempat sisi pada layar Laptop maupun Desktop.
  - Mempertahankan CSS `image-rendering: pixelated;` sehingga setiap piksel 16-bit tetap tajam sempurna pada layar Retina / High-DPI.
  - Pada Mobile Portrait (`390×844`), kanvas membentang 100% penuh kiri-kanan, sedangkan Virtual D-Pad berada rapi di zona ibu jari bawah layar.
  - Pada Mobile Landscape (`844×390`), kanvas memenuhi viewport secara imersif dengan HUD proporsional di sudut layar.

### 4.2 Struktur Level & Rintangan Atap Kota
Level membentang sepanjang 1900 piksel dengan pola tanah bertingkat (`getFloorYAt(x)`):
- **Babak 1 — Atap Gedung Senja (`x: 0 – 1050`):** Ketinggian lantai standar `FLOOR_Y = 224`.
  - Segmen Atap 1: x = 0 s.d. 385 (lebar 385 px).
  - Jurang 1: x = 385 s.d. 420 (lebar 35 px, dapat diseberangi dengan lompatan normal).
  - Segmen Atap 2: x = 420 s.d. 610 (lebar 190 px).
  - Jurang 2: x = 610 s.d. 645 (lebar 35 px, dapat diseberangi dengan lompatan normal).
  - Segmen Atap 3: x = 645 s.d. 1050 (lebar 405 px).
- **Undakan Tangga Naik (`x: 1050 – 1100`):** Undakan atap bertangga naik dari `y = 224` → `y = 206`.
- **Dataran Tinggi Puncak & Arena Boss (`x: 1100 – 1920`):** Ketinggian lantai puncak `PEAK_FLOOR_Y = 188`.
  - Area Taman Puncak Sakura (`x: 1100 – 1420`): Menampung Checkpoint Lentera 2 (`x = 1190`), landmark Pohon Sakura Raksasa & Ayunan Berdua (`x = 1270`), dan titik temu Partner (`x = 1295`).
  - Area Arena Boss Penjaga Kado (`x: 1420 – 1920`): Gerbang segel ungu di `x = 1420`, arena pertempuran naga (`x = 1420 – 1830`), jurang lama `1540–1580` ditutup rata di `y = 188`, dan Kotak Kado akhir di `x = 1850`.
- **Dinding Gedung Penutup Bawah (`building_wall`):**
  Disusun berulang ke bawah dari `y = FLOOR_Y + 16` (atau `PEAK_FLOOR_Y + 16`) hingga `y = 270 + 16` menutup penuh seluruh area dasar layar tanpa ada celah hitam kosong.
- **Platform Jembatan Kayu (Elevated Walkways):**
  - Platform 1: x = 380, y = 182 (lebar 64 px, delta 42 px dari lantai).
  - Platform 2: x = 750, y = 182 (lebar 64 px, delta 42 px dari lantai).
  - Ketinggian platform memberikan margin lompatan aman sebesar 14.25 px tanpa memerlukan buff tambahan.
- **Collider Statis Bersatu:** Tiap segmen lantai dan jembatan menggunakan 1 collider statis utuh (`Rect(0, 0, width, height)`) dengan tinggi mencakup dasar layar untuk mencegah pemain tersangkut pada sambungan tile 16 px.

### 4.3 Kamera & Parallax Terkunci
- Kamera mengikuti pergerakan horizontal pemain (`player.pos.x`) dengan rentang kuncian sumbu X dari 240 hingga `LEVEL_WIDTH - 240` (1660 piksel pada level 1900 px).
- **Kamera Reveal Vertikal:** Sumbu Y kamera berada pada 135 piksel di Babak 1 (`x < 1060`), lalu melakukan *smooth lerp reveal* ke atas (`camY: 135 → 108`) saat pemain menanjak ke Dataran Tinggi Puncak (`x >= 1060`) agar kemegahan kanopi Pohon Sakura dan pertarungan Dragon Boss terlihat utuh.
- **Kamera Lock Arena Boss:** Saat memasuki arena Boss (`x >= 1430`), kamera terkunci horizontal di `x = 1660, y = 108` dan pemain tidak dapat kembali ke kiri.
- **Parallax Background:**
  - `bg_sky`: Mengikuti kamera penuh (posisi X kamera, Y = 135, diskalakan 1.5× mengisi viewport 480×270).
  - `bg_city_mid` (gedung perkotaan dengan jendela menyala): Faktor parallax 0.25 (lebar ubin 480 px, 3 ubin fixed bergerak mulus tanpa celah).
  - Pendar ganda lembut di sekitar lampu jalan (`FLOOR_Y - 32`), lentera checkpoint 1 (`FLOOR_Y - 12`), dan lentera checkpoint 2 (`PEAK_FLOOR_Y - 12`).

### 4.4 Entitas Karakter, Companion Pet, & Monster
1. **Pemain (Player):**
   - Karakter Cowok (`player_male`) atau Cewek (`player_female`) dengan animasi menghadap samping: `idle` (6 frame), `run` (6 frame), `jump` (2 frame), dan `attack` (4 frame).
   - Collision box: `Rect(vec2(0, 0), 12, 22)` dengan titik tumpu `anchor("bot")` sehingga berdiri presisi di atas lantai genteng.
   - Serangan Jarak Dekat: Tombol serang memicu tebasan pedang arcade 16-bit (`weapon_slash`, area 20×20 px) di depan karakter selama 0.15 detik.
2. **Companion Pet (`pet`):**
   - Hewan peliharaan mini yang setia menemani pahlawan di sepanjang atap gedung.
   - Bergerak mulus mengikuti pemain menggunakan interpolasi posisi (`lerp`), otomatis membalik arah hadap (`flipX`), dan otomatis berteleportasi saat karakter respawn.
3. **Monster & Musuh 16-Bit:**
   - **Green Slime (`monster_slime`):** Berpatroli di lantai atap (x = 220 & x = 710), otomatis berbalik arah di dekat jurang atau saat mendekati NPC pemandu (jarak aman ≥ 40 px). HP: 1.
   - **Dusk Bat (`monster_bat`):** Terbang melayang di udara dengan lintasan sinusoidal halus. HP: 1.
   - **Skeleton Warrior (`monster_skeleton`):** Berpatroli di atas platform jembatan jangkung (x = 600). HP: 2.
   - Setiap monster yang dikalahkan memicu efek suara tebasan dan animasi ledakan arcade 16-bit (`vfx_explosion`).
4. **Zona Terlarang Spawning (`FORBIDDEN_ZONES`):**
   Sistem memastikan NPC kuis, monster, lentera jalan, dan pohon tidak pernah saling bertumpuk atau muncul di atas jurang.
5. **Sistem Terpadu Respawn (`respawnPlayer` & `loseHeart`):**
   Terluka oleh monster, jatuh ke jurang, atau salah menjawab kuis di saat sisa nyawa 1 memicu fungsi respawn terpusat: memindahkan pemain ke titik awal/checkpoint, menghentikan kecepatan, mereset knockback, mengaktifkan invulnerability 0.8 detik, memulihkan HP, menteleportasi pet, dan memusatkan kamera.

---

## 5. Sistem Audio & BGM 8-Bit (`lib/game/sfx.ts`)

- **Arsitektur:** Modul murni singleton TypeScript tanpa komponen React, beroperasi langsung di atas Web Audio API native browser dan HTML5 Audio.
- **Protokol Buka Kunci (Unlock Audio):**
  Handler klik tombol PRESS START memanggil fungsi `unlockAudio()` secara sinkron untuk memutar 1 sampel hening instan dan meresume `AudioContext`. Hal ini memastikan audio tidak diblokir oleh kebijakan autoplay browser (termasuk iOS Safari & Chrome Mobile).
- **Melodi BGM 8-Bit Bawaan (Chiptune Synthesizer):**
  - `preset:cozy` (*Cozy Sunset*): Melodi pentatonik santai bertempo sedang (80 BPM) bergelombang kotak/segitiga hangat.
  - `preset:happy` (*Happy Birthday Retro*): Variasi ceria lagu selamat ulang tahun tempo 120 BPM dengan harmoni arpeggio 8-bit.
  - `preset:romantic` (*Starlight Lullaby*): Melodi romantis lembut bertempo 72 BPM dengan modulasi filter lembut.
- **Look-Ahead Scheduler:** Penjadwalan notasi nada dikalkulasikan 100 ms ke depan berdasarkan `ctx.currentTime` dengan interval pulsa 25 ms, menghasilkan ritme nada yang stabil dan presisi bebas latensi frame loop.
- **Transisi Halus (Smooth Gain Ramping):** Setiap penghentian atau penggantian lagu menerapkan gain ramp down ke 0 dalam 30 ms sebelum node diputus, mencegah bunyi klik/pop kasar pada speaker.
- **Audio Eksternal (Custom MP3):** Memutar file `.mp3` eksternal via elemen HTML5 Audio terisolasi dengan atribut loop dan kontrol volume. Kontrol bisu (*mute*) diimplementasikan via properti `audio.muted = true` untuk menjamin kompatibilitas mutlak pada iOS Safari.

---

## 6. Desain Visual & UI/UX

### 6.1 Arah Visual: Cozy 16-Bit Sunset RPG
- **Atmosfer:** Langit senja keemasan berpadu dengan siluet gedung kota bertingkat, jendela bercahaya hangat, jembatan kayu, dan lentera temaram.
- **Palet Warna Utama:**
  - Latar Langit Senja: Indigo Malam (`#151428`), Ungu Twilight (`#282548`), Oranye Senja (`#f49f1c`).
  - Elemen Emas & Aksen: Emas Amber (`#ffd166`, `#ffbe3b`), Kuning Emas (`#f6d32d`).
  - Permukaan Arsitektur: Genteng Slate (`#524d67`), Lis Kayu Jembatan (`#9e6331`), Dinding Bata Hangat (`#cca98b`).
  - Aksen Status & UI: Hati Merah (`#ff4757`), Sukses Hijau (`#2ed573`), Magis Ungu (`#a55eea`).
- **Hierarki Tipografi:**
  - Font Piksel (`Press Start 2P`): Khusus untuk judul hero, angka skor, badge RPG, HUD game, keycap kontrol, dan tombol aksi utama.
  - Font Bersih (`Plus Jakarta Sans`): Digunakan pada seluruh teks paragraf, deskripsi panduan, label formulir, placeholder input, soal kuis, dan isi surat polaroid demi kenyamanan membaca (*readability*).

### 6.2 Standar Skala Z-Index (`globals.css`)
Untuk mencegah tumpang tindih elemen visual antar modul, digunakan skala z-index terstandarisasi:
```css
/* D-Pad Kontrol Layar Sentuh Mobile */
z-index: 20;

/* StartScreen Overlay (Sebelum Game Dimulai) */
z-index: 30;

/* Balon Interaksi HTML Tajam Mengambang di atas NPC (Prompt Kuis) */
z-index: 45;

/* Overlay Jeda Permainan (Pause Screen) */
z-index: 250;

/* Toast Notifikasi Bintang Kenangan */
z-index: 258;

/* Heads-Up Display Utama (HUD Nyawa, Bintang, Kuis, Audio) */
z-index: 260;

/* Layar Loader Inisialisasi & Popup Bantuan */
z-index: 270;

/* Tombol Kontrol Bisu Audio & Bantuan */
z-index: 280;

/* Modal Kuis Tantangan Rahasia (ChallengeModal) */
z-index: 300;

/* Modal Selebrasi Akhir Kado & Unduh Kartu (GiftModal) */
z-index: 400;
```

### 6.3 Komponen Visual HD & Desain Modal 16-Bit Baru
- **Balon Interaksi HTML Tajam (`GameCanvas.tsx`):**
  - Menggantikan prompt teks kanvas lawas dengan elemen HTML/CSS mengambang tepat di atas kepala NPC Kuis.
  - Memiliki latar putih bersih (`#ffffff`), border 2px gelap tegas (`#1a1c2c`, `shadow-[2px_2px_0px_#0c0d19]`), ekor panah segitiga piksel menunjuk ke bawah, ikon piksel `📜`, teks `"Buka Kuis"` tajam, serta kotak keycap `E` (desktop) atau indikator `TAP 👆` (mobile) dengan animasi melayang halus 16-bit (`.animate-retro-bob`).
  - **Sinkronisasi Posisi via DOM Ref:** Posisi balon mengikuti pergerakan kamera dan skala `computeScale` secara langsung melalui mutasi `translate3d` pada referensi DOM elemen (`interactionBubbleRef`) tanpa memicu re-render React 60 FPS.
- **Bingkai Foto 9-Slice Emas & Permata Piksel (`PixelPhotoFrame.tsx`):**
  - Menggunakan teknik 9-slice berbasis SVG vektor piksel murni (`shapeRendering="crispEdges"`) dengan ornamen emas berdimensi, lis matras beludru malam (`#0d0c18`), dan permata ruby piksel (`#ff4757`) di keempat sudutnya.
  - Menjamin foto kenangan (`GiftModal`) dan foto petunjuk soal (`ChallengeModal`) selalu tampil tajam tanpa pernah melar, pecah, atau buram di berbagai ukuran layar.
- **Pita Judul Retro RPG (`PixelRibbonBanner.tsx`):**
  - Komponen banner pita piksel 16-bit klasik untuk header modal (nomor tantangan kuis dan selebrasi kado).
  - Dilengkapi sayap pita berujung takik (*fishtail notch*), lipatan bayangan 3D (*shadow fold*), paku keling sudut emas, serta lis jahitan emas.
- **Kartu Buku Cerita & Tombol Bevel 16-Bit (`ChallengeModal.tsx`, `GiftModal.tsx`, `RetroButton.tsx`):**
  - Latar krem hangat (*warm parchment*, `.rpg-parchment-card`, `#fffbf0`) berbingkai piksel gelap 4px tegas dan bayangan berdimensi mendalam.
  - Tombol aksi arcade dengan efek bevel tebal, highlight atas-kiri dan bayangan bawah-kanan tegas, serta respon tekan taktil (`active:translate-x-[2px] active:translate-y-[2px]`).

---

## 7. Aturan Wajib untuk AI Developer & Panduan Pemeliharaan

Setiap pengembang atau asisten AI yang memelihara atau menambahkan fitur baru pada repositori ini **WAJIB MEMATUHI ATURAN BERIKUT TANPA PENGECUALIAN**:

1. **Isolasi Logika Game dari React:**
   - Folder `lib/game/` (termasuk `createGame.ts`, `sfx.ts`, `sprites.ts`) **DILARANG KERAS** mengimpor pustaka atau hook React (`useState`, `useEffect`, `useRef`, dll). Seluruh komunikasi ke antarmuka React wajib melalui callback controller terdaftar (`onHudUpdate`, `onOpenChallenge`, `onMemoryToast`, `onWin`).
2. **KAPLAY Component Constraints:**
   - Komponen `lifespan` pada KAPLAY **WAJIB** disertai komponen `opacity(1)`. Memasang `lifespan` tanpa `opacity` akan memicu error fatal saat entitas musnah.
   - Seluruh objek fisik yang berdiri di atas tanah (pemain, musuh, pet, kado, NPC) **WAJIB** menggunakan `anchor("bot")`.
   - Timer internal gameplay **WAJIB** dihitung secara manual menggunakan delta time frame `k.dt()`, **DILARANG** menggunakan `k.wait()` untuk timer berbasis state loop.
3. **Integritas Skema API & Google Sheets:**
   - **DILARANG** mengubah nama kolom, urutan kolom, atau struktur JSON kontrak Google Apps Script (`status`, `data`, `id`, `challenges`).
   - Setiap penulisan baris ke spreadsheet wajib menjaga format sel `@` (Plain Text).
4. **Kinerja Render & State React:**
   - Pembaruan HUD dari game loop wajib dipagari dengan pengecekan kunci string (`lastHudKey`), agar React tidak me-render ulang kanvas pada setiap frame (60 FPS).
   - Di `GameCanvas.tsx`, manipulasi jeda (`pause`/`resume`) harus dilakukan di luar fungsi updater state React.
5. **Surgical Changes & Zero Unnecessary Dependencies:**
   - Dilarang menambahkan pustaka atau dependency npm baru tanpa izin tertulis dari pengguna. Manfaatkan Web Audio API native, Canvas API HTML5, dan utilitas yang sudah ada di dalam proyek.
6. **Protokol Verifikasi 3-Langkah:**
   Setiap kali selesai mengubah kode, jalankan dan pastikan ketiga perintah berikut menghasilkan **Exit Code 0**:
   ```bash
   npx tsc --noEmit
   npm run lint
   npx next build --webpack
   ```

---

## 8. Roadmap Upgrade Visual Hybrid HD (Hi-Bit Architecture)

### 8.1 Prinsip Arsitektur Hybrid HD
1. **HTML + SVG Piksel (Resolusi Asli Layar / Retina HD):**
   - Menangani 100% teks, ikon, balon interaksi, Heads-Up Display (HUD), Virtual D-Pad, dan seluruh modal dialog.
   - Merender pada resolusi piksel fisik asli perangkat (Retina / High-DPI) sehingga teks dan ikon tidak pernah mengalami distorsi atau kekaburan akibat penskalaan kanvas.
2. **Kanvas KAPLAY (WebGL):**
   - Berfokus murni menangani rendering dunia game: latar belakang kota senja, karakter pahlawan, pet companion, monster, kalkulasi fisika, dan partikel arcade.
   - Menjamin frame rate stabil di 60 FPS dan penggunaan memori yang sangat hemat di ponsel pintar (*low-end mobile devices*).
3. **Aturan Ketat Implementasi:**
   - **Nol Dependency NPM Baru:** Seluruh aset ikon dan bingkai wajib dibuat menggunakan SVG piksel murni (`shapeRendering="crispEdges"`) atau CSS murni.
   - **Isolasi Logika Game:** Tetap menjaga modul `lib/game/` 100% bebas dari impor atau hook React.
   - **Bebas Re-Render 60 FPS:** Seluruh elemen overlay bergerak yang disinkronkan dengan koordinat dunia game wajib dimanipulasi secara langsung via DOM ref (`translate3d`) tanpa memicu re-render siklus hidup React.

---

### 8.2 Pembagian Fase Eksekusi Bertahap (Status: Seluruh Fase HD Selesai)

#### Fase HD-1 — Pembasmian Emoji OS & Upgrade HUD / D-Pad [SELESAI & TERVERIFIKASI]
- **Pembasmian Emoji Sistem:**
  Mengganti seluruh emoji standar sistem operasi di HUD, Balon Interaksi, Virtual D-Pad, dan Start Screen dengan komponen ikon SVG piksel seragam buatan sendiri (`PixelIcons.tsx`, `shapeRendering="crispEdges"`), menghilangkan tampilan inkonsisten antar platform.
- **Upgrade Kapsul HUD & Virtual D-Pad:**
  Mempercantik kapsul HUD atas dan tombol kontrol layar sentuh `VirtualDPad` dengan bingkai bevel/9-slice 16-bit yang senada dengan bahasa desain modal baru.

#### Fase HD-2 — Nol Teks di Dalam Kanvas (Zero-Canvas-Text) [SELESAI & TERVERIFIKASI]
- Membersihkan 100% pemanggilan `k.text(...)` di dalam engine KAPLAY (`lib/game/createGame.ts`).
- Memindahkan teks `"Checkpoint!"`, tanda centang status `✓` pada NPC kuis yang selesai ([`PixelCheck`](file:///d:/Code/Digital-8-Bit/components/PixelIcons.tsx)), serta floating toast bintang kenangan ke lapisan HTML overlay tajam via manipulasi DOM ref (`translate3d`) tanpa memicu re-render React 60 FPS.

#### Fase HD-3 — Upgrade Dunia Game ke Resolusi Hi-Bit (480×270) & Atmosfer Senja HD [SELESAI & TERVERIFIKASI]
- **Peningkatan Resolusi Virtual Kanvas:**
  Menaikkan resolusi internal kanvas game dari `320×180` menjadi `480×270` (tetap berasio 16:9, menghasilkan kelipatan bulat 4× presisi pada monitor Full HD 1080p) dan memperbarui algoritma `computeScale`.
- **Penyesuaian Kamera & Proporsi Dunia:**
  Menyesuaikan kamera (pusat X: `240` s.d. `LEVEL_WIDTH - 240`, pusat Y: `135`), `FLOOR_Y = 224`, platform jembatan `y = 182`, dinding gedung menutup penuh sampai dasar layar `y = 270`, serta menyinkronkan proyeksi layar balon interaksi dan lencana selesai.
- **Polesan Atmosfer Senja HD:**
  Meningkatkan kedalaman visual kota senja (skala ubin 480 px mulus tanpa celah, 19 bintang berkelip, dan pendar ganda hangat di sekitar lentera jalan).

#### Fase HD-4 — Penyelarasan UI/UX Menyeluruh (/, /create, StartScreen) [SELESAI & TERVERIFIKASI]
- Menerapkan bahasa desain baru (*warm parchment* & *starlight*, bingkai piksel 9-slice, `PixelRibbonBanner`, tombol bevel 16-bit, dan ikon SVG piksel) ke seluruh halaman aplikasi:
  - **Halaman Beranda (`/`):** Pita judul `PixelRibbonBanner`, 3 kartu langkah quest dengan ikon SVG piksel seragam, dan tombol CTA retro bebas emoji OS.
  - **Formulir Pembuatan Kado (`/create`):** Seksi formulir rapi, ikon SVG piksel seragam, preview foto menggunakan `PixelPhotoFrame`, dan kartu sukses penerbitan kado yang estetik.
  - **Layar Mulai (`StartScreen.tsx`):** Header `PixelRibbonBanner` serasi dengan `GiftModal` dan tombol start dengan ikon piksel tajam.
  - **Kotak Flash Resolusi HD:** Memastikan `triggerHurtFlash` dan flash salah kuis di `createGame.ts` mencakup kanvas penuh `480×270`.

---

### 8.3 Kriteria Selesai Tiap Fase HD
1. **Eksekusi Bertahap:** Dikerjakan satu fase per sesi, dan menunggu tinjauan/persetujuan pengguna sebelum melangkah ke fase berikutnya.
2. **Protokol Verifikasi 3-Langkah Wajib:**
   ```bash
   npx tsc --noEmit && npm run lint && npx next build --webpack
   ```
   Seluruh perintah wajib menghasilkan **Exit Code 0** tanpa error.
3. **Pengujian Responsif & Kompatibilitas:**
   Teruji tampil presisi dan responsif di desktop maupun perangkat seluler (orientasi portrait & landscape) tanpa menimbulkan regresi pada fitur yang sudah stabil (kuis, buff, mesin tik UTF-8, ekspor kartu kado PNG, dan audio).

---

## 9. Roadmap Ekspansi Cerita 4 Babak, Co-op Partner & Boss Penjaga Kado (v4.0)

Roadmap v4.0 memperluas Digital-8-Bit dari sekadar perjalanan platformer linear menjadi pengalaman petualangan RPG emosional berbasis cerita 4 babak. Fitur ini memperkenalkan narasi prolog buku cerita (*storybook cutscene*), rekan kooperatif AI (*AI Co-op Partner*), pertempuran Boss bayangan yang menegangkan, serta serangan pamungkas duet (*Special Duo Combo Finisher*).

```
[ START SCREEN ]
       │  (PRESS START)
       ▼
[ PROLOG CUTSCENE (3 Slide HTML HD) ]
  ├─ Slide 1: Kotak Kado Diculik Shadow Boss!
  ├─ Slide 2: Partner Berlari Mengejar ke Pohon Besar
  └─ Slide 3: Panduan Kontrol & Tombol Mulai Petualangan
       │
       ▼
[ BABAK 1: ATAP KOTA (x: 0 - 1050) ] ──────────► [ COMBAT JUICE ]
  ├─ Platforming & Bintang Kenangan                ├─ Hitstop Mikro (0.04s)
  ├─ Monster Kroco (Slime, Bat, Skeleton)          ├─ Hit-Flash & Knockback (0.1s)
  └─ NPC Kuis Kelinci (Buff Krusial untuk Boss)   └─ HTML Combo Counter (3.0s timer)
       │
       ▼
[ BABAK 2: REUNI POHON BESAR (x: 1050 - 1380) ]
  ├─ Landmark Pohon Rindang (decor_big_tree) & Checkpoint Akhir
  ├─ Efek Full Heal Otomatis (HP kembali 3/3 + Notifikasi HD)
  └─ Dialog Reuni HTML HD ──► Partner Bergabung (AI Co-op)
       │
       ▼
[ BABAK 3: ARENA BOSS PENJAGA KADO (x: 1380 - 1900) ]
  ├─ Kamera Lock Arena & BGM Tempo Up
  ├─ Boss HP Bar 9-Slice HTML HD (HP: 8) & Kotak Kado Tersegel Aura Ungu
  ├─ Pola Serangan Boss: Semburan Bola Api (Bisa Dideflect) & Kibasan Ekor
  └─ Bantuan AI Partner: Serang berkala (1 DMG / 3.0s) + Partner Rescue (2x)
       │
       ▼ (Saat Boss HP = 1: Status STUNNED)
[ BABAK 4: KLIMAKS & DUO FINISHER! ]
  ├─ Prompt HTML Menyala: [F] / [⚔️] SERANGAN DUO!
  ├─ Layar Meredup + Cut-In Banner HD: "★ DUO STARLIGHT SLASH! ★"
  ├─ Tebasan Silang Duet (X-Slash Emas & Pink) + Hitstop 0.15s + Shake
  └─ Ledakan Boss ──► Segel Kado Terbuka ──► Selebrasi & GiftModal
```

---

### 9.1 Narasi & Alur Gameplay 4 Babak

#### Prolog — Live Cutscene & JRPG Dialogue Box (3 Adegan HTML HD, `z-[290]`)
Setelah tombol `PRESS START` ditekan, game tidak menampilkan modal kartu statis yang menutupi layar, melainkan menyajikan **adegan sinematik hidup (*live cutscene*)** bergaya MMORPG/JRPG 16-bit di mana panggung kanvas atas tetap terlihat dinamis dan teks narasi berada di kotak dialog bawah:
- **Panggung Visual Animasi Kanvas Atas (Live Cutscene Stage):**
  - **Adegan 1 (Pencurian Kado):** Kotak kado berkilau di atas atap kota senja. Tiba-tiba kabut dan kilatan ungu meledak, sosok bayangan misterius **Penjaga Kado (*Shadow Boss*)** muncul menyambar peti kado, dan melesat kabur ke arah kanan.
  - **Adegan 2 (Pengejaran Partner):** Avatar Pasangan (kebalikan gender pemain) muncul dengan balon tanda seru kaget (`!`), lalu berlari mengejar ke arah kanan menuju Pohon Besar.
  - **Adegan 3 (Siap Berangkat):** Kamera kembali membidik karakter utama pemain dan pet yang bersiap di titik awal kota senja, ditemani kartu kendali kontrol yang bersih.
- **Kotak Dialog JRPG Bawah Layar + Typewriter UTF-8:**
  - Terletak di bagian bawah layar (`fixed bottom-2 sm:bottom-4 inset-x-2 sm:inset-x-6 z-[290]`) berbingkai bevel emas RPG dengan kontras tinggi.
  - **Potret & Nama Pembicara:** Menampilkan potret piksel di sisi kiri (*Narator*, *Partner*, atau *Panduan*) lengkap dengan label nama.
  - **Efek Ketik Bertahap & SFX:** Kalimat diketik huruf demi huruf (~28 ms/karakter, aman emoji dengan `Array.from`) diiringi efek suara ketikan lembut retro (`playDialog` setiap 2–3 huruf, patuh status bisu).
  - **Navigasi Pintar:**
    - Jika teks masih mengetik: ketukan layar / tombol `Spasi` / `Enter` langsung menuntaskan kalimat seketika (*instant completion*).
    - Jika teks telah selesai: ketukan berikutnya melanjutkan ke adegan selanjutnya (disertai ikon panah berkedip `▼` di pojok kanan bawah kotak dialog).
  - **Tombol Lewati (ESC):** Tetap tersedia di sudut kanan atas layar bagi pemain yang ingin langsung melompat ke kontrol bebas gameplay.

---

#### Babak 1 — Perjalanan Atap Kota (`x: 0 – 1050`) & Combat Juice
Perjalanan platforming klasik melintasi atap gedung kota senja, mengumpulkan Bintang Kenangan, dan menaklukkan tantangan kuis:
- **Pentingnya Buff Kuis:** Hadiah buff dari NPC Kelinci (*Shield Aura*, *Speed Boost*, dan *Power Star*) kini menjadi bekal strategis pemain untuk bertahan hidup saat menghadapi pertempuran Boss.
- **Peningkatan Combat Juice (`createGame.ts` & `GameCanvas.tsx`):**
  - **Hitstop (Micro-Freeze):** Frame game dijeda mikro selama `0.04` detik (`k.dt() = 0`) seketika saat tebasan pedang mengenai musuh, menghadirkan bobot benturan mekanik yang renyah dan berdampak (*satisfying impact*).
  - **Hit-Flash & Knockback:** Karakter musuh berkedip putih terang selama `0.1` detik disertai hentakan mundur ringan (knockback `18` px) untuk memberikan *feedback* visual instan kepada pemain.
  - **HTML Combo Counter Tajam:** Lencana kombo dinamis berbasis DOM ref mengambang di layar (`2x COMBO!`, `3x COMBO!`, dst.) saat pemain memukul atau menumbangkan musuh beruntun dalam rentang `3.0` detik, lengkap dengan bilah timer mini yang berkurang sebelum kombo terputus.

---

#### Babak 2 — Taman Puncak Sakura Bertingkat & Reuni Pasangan (`x: 1050 – 1420`)
Area transisi emosional yang menghubungkan atap kota menuju arena puncak pertempuran:
- **Pola Tanah Bertingkat Menuju Puncak (`getFloorYAt(x)`):**
  - Undakan atap bertangga naik dari `y = 224` → `y = 206` (`x: 1050 – 1100`) → `y = 188` (`x: 1100 – 1920`, `PEAK_FLOOR_Y`).
  - Seluruh dataran tinggi puncak dan arena akhir tersusun rapat dengan dinding batu gedung (`building_wall`) hingga dasar layar `y = 270`, jurang `1540–1580` ditutup rata.
  - Kamera melakukan *smooth lerp reveal* ke atas (`camY` 135 → 108) saat pemain menanjak (`x > 1060`) agar kanopi sakura terlihat utuh, disertai bunyi lonceng angin lembut (*soft wind chime*) saat pertama mencapai puncak (`x >= 1150`).
- **Landmark Pohon Sakura Raksasa (`decor_big_tree`) & Taman Romantis:**
  - Pohon Sakura megah berskala tinggi visual ~193 px (`scale: 1.28`) di atas alas gundukan rumput taman (`x: 1270, y: PEAK_FLOOR_Y + 3`), akar 100% tertanam rapat anti-ngambang.
  - Dilengkapi ayunan kayu untuk berdua (*couple swing*) yang berayun lembut otomatis, 2 pohon sakura kecil di latar belakang (`x: 1175, 1365`), pagar kayu pendek, semak bunga pink, dan lampu taman gantung (*fairy string lights*) berpendar kuning hangat.
  - Dihiasi guguran partikel kelopak bunga sakura pink melayang lembut (`x: 1160 – 1400`) serta 8 titik kunang-kunang emas (*golden fireflies*) beredar perlahan.
  - Lentera Checkpoint ke-2 berada di `x: 1190, y: 188`.
- **Full Heal Otomatis:**
  - Melangkah masuk ke area Pohon Sakura (`x: 1270`) memicu pemulihan instan HP pemain ke status penuh (`MAX_HP = 3`), ditandai dengan pendar cahaya hijau zamrud dan notifikasi toast HTML tajam: *"Kekuatan Pulih Penuh di Bawah Naungan Pohon!"*.
- **Reuni & AI Co-op Partner:**
  - Avatar Pasangan berdiri menunggu pemain di bawah naungan pohon (`x: 1295, y: 188`).
  - Saat pemain mendekat, muncul **Dialog Reuni HTML HD** singkat berbingkai RPG:
    > *"Kamu akhirnya sampai! Kado spesialmu ada di depan sana, tapi Penjaga Kado menghalangi jalan. Ayo kita hadapi bersama!"*
  - Tepat setelah dialog selesai, muncul emote hati mini `♥` piksel melayang naik di antara kepala pemain dan partner, lalu Partner secara otomatis bergabung mendampingi pemain naik-turun undakan dan jembatan secara natural (menggunakan helper `getFloorYAt(x)` anti-ngambang) menuju arena pertempuran di Babak 3.

---

#### Babak 3 — Arena Boss Penjaga Kado (`x: 1380 – 1900`) — Co-op Boss Fight
Pertarungan klimaks melawan monster Dragon Boss berwibawa:
- **Penguncian Kamera & Suasana Arena:**
  - Batas kamera terkunci di arena Boss (`x: 1380` s.d. `1900`, posisi kamera di `x = 1660, y = 108`). Pemain dan Partner tidak dapat berbalik arah ke kiri.
  - Tempo musik latar meningkat dinamis (*battle tempo*).
  - Kotak kado di ujung arena (`x: 1850`) diselubungi segel aura kubah ungu berdenyut yang tidak bisa dibuka sampai Boss kalah.
- **Boss HP Bar HTML 9-Slice:**
  - Bar nyawa Boss berbingkai mewah 16-bit muncul di bagian bawah layar: *"PENJAGA KADO — SHADOW GUARDIAN"* dengan `8` slot bar HP bertahap warna merah menyala.
- **Karakteristik & Pola Serangan Boss (Dragon Boss, HP 8):**
  - Menggunakan 3 spritesheet terpisah (`boss_dragon_idle.png`, `boss_dragon_breath.png`, `boss_dragon_tail.png`) berdimensi frame 144×64 px.
  - Memiliki rancangan serangan yang adil, 100% visual, terbaca (*telegraphed*), dan ramah pemain kasual:
    1. **Semburan Bola Api (*Fire Orb Breath*):** Ancang-ancang 0.7 detik mulut naga berpendar api oranye terang, lalu memainkan animasi `breath` dan menembakkan bola api menyala (kecepatan santai 105 px/s). Bola api dapat dilompati atau **ditebas balik (*deflect*)** oleh pemain menuju naga untuk menghasilkan **2 damage bonus** + hitstop.
    2. **Kibasan Ekor (*Tail Flame Swipe*):** Ancang-ancang 0.7 detik dengan **garis peringatan lantai merah-oranye menyala** di area jangkauan ekor di depan naga, disusul animasi `tail` dan **busur gelombang api ekor** selama 0.35 detik. Hitbox damage ekor hanya aktif selama efek visual tebasan api tampil.
  - **Proteksi Fair Combat:** *Contact damage* hanya aktif di inti tubuh naga (radius 22 px) dan **dinonaktifkan** saat pemain sedang mengayunkan pedang atau saat Boss *Stunned*.
  - **Mode Enraged & Jeda Istirahat:** Memasuki mode *Enraged* saat HP ≤ 4 dengan partikel api membara. Jeda waktu istirahat yang lega antar-serangan: `2.4` detik di fase normal dan `1.8` detik saat Enraged, memberi ruang nyaman bagi pemain untuk maju menebas.
- **Bantuan AI Co-op Partner & Partner Rescue:**
  - Partner kebal terhadap damage musuh sehingga pemain tidak terbebani menjaga nyawa rekan (*zero babysitting stress*).
  - Setiap `3.0` detik, Partner melesat maju menebas Boss memberikan `1` damage pembantu secara berkala.
  - **Partner Rescue (Maksimal 2×):** Jika HP pemain habis (0 HP) saat pertarungan Boss aktif, Partner otomatis membangkitkan pemain dengan 2 HP, masa kebal 2.0 detik berpartikel emas-pink, SFX kebangkitan, dan pesan penyemangat emosional.

---

#### Babak 4 — Klimaks: Special Duo Combo Finisher!
Puncak penyelesaian pertarungan yang dramatis, romantis, dan memuaskan:
- **Kondisi Stunned:**
  - Saat HP Boss tersisa `1`, Boss berlutut pusing dengan bintang berputar di atas kepalanya (*Stunned State*) dan berhenti menyerang.
  - Di layar muncul prompt interaksi raksasa berdenyut emas:
    **`⚡ [F] / [⚔️] SERANGAN DUO!`** (dapat diaktifkan via keyboard atau tombol layar sentuh).
- **Animasi Finisher Duet (`~1.8` detik):**
  1. *Freeze & Dim:* Layar meredup dramatis, musik hening sesaat dengan desingan energi pedang.
  2. *Cut-In Banner HD:* Banner potret kedua avatar melintas di tengah layar dengan tulisan bercahaya:
     **`★ DUO STARLIGHT SLASH! ★`**.
  3. *Cross Slash Dash:* Karakter Pemain melesat dari kiri dengan jejak cahaya pedang emas, sementara Partner melesat dari kanan dengan jejak cahaya pedang pink/cyan, menembus tubuh Boss dan membentuk silang tebasan raksasa (**X-Slash**).
  4. *Explosion & Unseal:* *Hitstop* dramatis `0.15` detik diikuti guncangan layar (*screen shake*). Boss meledak menjadi partikel cahaya berkilauan dan lenyap seutuhnya.
  5. *Victory:* Segel kubah ungu pada Kotak Kado pecah berkeping-keping. Pemain dan Partner berjalan bersama mendekati peti kado, memicu selebrasi kado dan membuka `GiftModal`.

---

### 9.2 Aturan Teknis & Batasan Arsitektur

1. **Prinsip Nol Teks Kanvas (Zero-Canvas-Text):**
   - 100% teks Prolog, dialog reuni, Boss HP bar, combo counter, cut-in banner, dan prompt Serangan Duo **WAJIB** dirender menggunakan lapisan HTML + SVG Piksel murni beresolusi layar asli (Retina HD).
   - Kanvas KAPLAY hanya merender sprite, partikel efek WebGL, fisik, dan kalkulasi koordinat kamera.
2. **Akumulator Delta Waktu (`k.dt()`):**
   - Seluruh timer gameplay (durasi hitstop, jeda serangan Boss, combo window `3.0` detik, interval serang Partner `3.0` detik) **WAJIB** dihitung secara manual menggunakan delta waktu frame `dt`, **DILARANG** menggunakan `k.wait()` untuk timer berbasis perulangan state.
3. **Isolasi Logika Game dari React:**
   - Logika Boss, AI Partner, dan finisher di `lib/game/createGame.ts` dilarang mengimpor modul/hook React. Seluruh status dikomunikasikan ke UI React via callback controller terdaftar:
     - `onBossHpUpdate?: (hp: number, maxHp: number, visible: boolean) => void`
     - `onComboUpdate?: (combo: number, timeLeft: number) => void`
     - `onStoryTrigger?: (phase: "reunion" | "finisher_prompt" | "finisher_cutin") => void`
4. **Kompatibilitas Penuh Kado Lama (v1–v3):**
   - Seluruh URL kado yang sudah ada di Google Sheets tetap berjalan 100% tanpa migrasi data, karena seluruh data cerita otomatis diadaptasi dari `avatar` dan `receiver_name` kado terkait.
5. **Nol Dependensi Baru:**
   - Tidak ada paket npm baru. Seluruh efek visual dibangun dengan Tailwind CSS, CSS 3D transforms, dan komponen SVG piksel yang sudah tersedia di proyek.

---

### 9.3 Pembagian Fase Eksekusi Bertahap

Pengerjaan Roadmap v4.0 dibagi menjadi 3 fase terisolasi:

```
┌────────────────────────────────────────────────────────────────────────┐
│ FASE S-1: PROLOG CUTSCENE, PERSIAPAN START SCREEN & COMBAT JUICE       │
│ • Pembersihan kotak kontrol StartScreen.tsx                            │
│ • Modal Storybook Prolog 3 Slide HTML HD (z-[290]) + tombol Skip/Start │
│ • Combat Juice: Hitstop mikro (0.04s), Hit-Flash, HTML Combo Counter   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Review & Approval)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FASE S-2: PERLUASAN DUNIA, POHON BESAR & AI CO-OP PARTNER              │
│ • Perluasan level hingga x = 1900 (arsitektur ubin 480×270)            │
│ • Landmark Pohon Rindang (decor_big_tree) + Checkpoint & Full Heal     │
│ • Reuni Avatar Pasangan + Dialog HTML HD & AI Partner Controller       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Review & Approval)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FASE S-3: ARENA BOSS PENJAGA KADO & SPECIAL DUO COMBO FINISHER         │
│ • Integrasi 3 Spritesheet Dragon Boss (Idle, Breath, Tail) & Segel     │
│ • Pola Serangan: Semburan Api (bisa di-deflect) & Kibasan Ekor         │
│ • Boss HP Bar 9-Slice HTML HD (HP 8) & Logika Serang Co-op Partner     │
│ • Mekanik Finisher: Boss Stunned + Prompt Serangan Duo [F] / TAP       │
│ • Animasi Duo Starlight Slash (Cut-In Banner, X-Slash & Partner Rescue)│
└────────────────────────────────────────────────────────────────────────┘
```

1. **Fase S-1 — Prolog Cutscene, Persiapan Start Screen & Combat Juice [SELESAI & TERVERIFIKASI]:**
   - Bersihkan kotak kontrol dari [StartScreen.tsx](file:///d:/Code/Digital-8-Bit/components/StartScreen.tsx).
   - Bangun komponen [PrologueModal.tsx](file:///d:/Code/Digital-8-Bit/components/PrologueModal.tsx) (3 slide cerita, ilustrasi kado dicuri, avatar partner mengejar, panduan kontrol ringkas, dan tombol Mulai/Lewati).
   - Implementasikan *Combat Juice* di [createGame.ts](file:///d:/Code/Digital-8-Bit/lib/game/createGame.ts): hitstop `0.04` detik saat tebasan kena musuh, kedipan hit-flash putih `0.1` detik, dan *HTML Combo Counter* memantul via DOM ref di [GameCanvas.tsx](file:///d:/Code/Digital-8-Bit/components/GameCanvas.tsx).
2. **Fase S-2 — Perluasan Dunia, Taman Puncak Sakura & AI Co-op Partner [SELESAI & TERVERIFIKASI]:**
   - Perlebar rentang level dari `1050` ke `1900` px dengan arsitektur ubin bertingkat 480×270 (`y = 224` → `206` → `188`), jembatan platform antar-atap gedung, dan memindahkan Kotak Kado akhir ke `x: 1850, y: 188` (jurang `1540–1580` ditutup rata).
   - Integrasikan landmark Pohon Sakura Raksasa [decor_big_tree.png](file:///d:/Code/Digital-8-Bit/public/sprites/decor_big_tree.png) (tinggi visual ~193 px) di atas gundukan rumput taman atap (`x: 1270, y: 188`), ayunan kayu berdua (*couple swing*), 2 pohon sakura latar belakang, lampu gantung *fairy lights*, Checkpoint Lentera ke-2 (`x: 1190`), dan pemulihan *Full Heal* otomatis (`hearts = 3`) sekali jalan berpartikel hijau zamrud.
   - Hadirkan efek kamera reveal vertikal (`camY` 135 → 108), lonceng angin lembut (*wind chime*), 8 kunang-kunang emas, guguran kelopak sakura, dan emote hati `♥` saat reuni.
   - Hadirkan Avatar Pasangan di bawah pohon (`x: 1295, y: 188`); buka dialog JRPG HTML HD [ReunionModal.tsx](file:///d:/Code/Digital-8-Bit/components/ReunionModal.tsx) saat didekati; jadikan Partner sebagai entitas AI Co-op pendamping yang berlari, melompat, dan meniru aksi pemain secara mulus menapaki undakan via `getFloorYAt(x)` tanpa mengambang.
3. **Fase S-3 — Arena Boss Penjaga Kado & Special Duo Combo Finisher [SELESAI & TERVERIFIKASI]:**
   - Integrasikan 3 file spritesheet asli Dragon Boss dari `Grotto-escape-2-boss-dragon`:
     1. [boss_dragon_idle.png](file:///d:/Code/Digital-8-Bit/public/sprites/boss_dragon_idle.png) (864×64 px, 6 frame: idle 0..5, hurt/stunned 1..2).
     2. [boss_dragon_breath.png](file:///d:/Code/Digital-8-Bit/public/sprites/boss_dragon_breath.png) (1008×64 px, 7 frame: semburan api 0..6).
     3. [boss_dragon_tail.png](file:///d:/Code/Digital-8-Bit/public/sprites/boss_dragon_tail.png) (1152×64 px, 8 frame: kibasan ekor 0..7).
     Lengkap dengan preflight per-file dan fallback prosedural terpisah di [sprites.ts](file:///d:/Code/Digital-8-Bit/lib/game/sprites.ts). Transisi aksi Boss dilakukan langsung dengan mengganti sprite/animasi pada entitas `bossObj`.
   - Penguncian Arena Pertarungan (`x >= 1430`): memunculkan gerbang segel ungu solid di `x = 1420`, mengunci kamera horizontal di `x = 1660, y = 108`, intro Boss bergetar dengan kabut ungu dan *Title Card HTML HD* (`PENJAGA KADO — SHADOW GUARDIAN`, `z-[255]`), serta percepatan tempo BGM pertarungan via [sfx.ts](file:///d:/Code/Digital-8-Bit/lib/game/sfx.ts).
   - Selubungi Kotak Kado di `x: 1850` dengan kubah segel sihir ungu berdenyut yang tidak bisa dibuka sebelum Boss dikalahkan.
   - Mekanik Boss (HP 8, HP Bar 9-Slice HTML di dasar layar `z-[260]`):
     - Pola Serangan 1: *Semburan Bola Api* (telegraf 0.7s pendaran oranye terang di mulut, lalu menembakkan bola api menyala berkecepatan santai 105 px/s). Bola api dapat dilompati atau ditebas balik (*deflect*) menuju naga untuk menghasilkan **2 damage bonus** + hitstop.
     - Pola Serangan 2: *Kibasan Ekor* (telegraf 0.7s garis peringatan lantai merah-oranye di area depan naga, dilanjutkan tebasan busur api ekor yang sangat terlihat jelas selama 0.35s). Hitbox damage ekor hanya aktif selama efek visual tebasan tampil.
     - Proteksi *Fair Combat*: contact damage hanya aktif di inti tubuh naga (radius 22 px) dan dinonaktifkan saat pemain sedang mengayunkan pedang atau saat Boss stunned.
     - Mode *Enraged* (HP <= 4): percikan api membara, percepatan jeda serangan istirahat dari 2.4s ke 1.8s.
     - Respons Serangan: hitstop mikro 0.04s, hit-flash putih terang 0.1s, dan combo counter HTML bertambah.
   - Peran AI Co-op Partner di Arena:
     - Memberikan bantuan tebasan berkala ke Boss (1 damage tiap 3.0 detik).
     - *Partner Rescue* (maks 2x per pertarungan): saat HP pemain habis di arena Boss, Partner menyembuhkan 2 HP, memberikan masa kebal 2.0s berpartikel emas-pink, memainkan SFX kebangkitan, dan memunculkan toast emosional (*"Jangan menyerah, aku di sini! Bangkit lagi!"*).
   - Klimaks Babak 4 — Stunned & Duo Finisher:
     - Saat HP Boss tersisa 1, Boss memasuki status *Stunned* (berlutut lemas dengan bintang pusing di kepala) dan memunculkan tombol emas berdenyut *[F] / TAP SERANGAN DUO!* (`z-[280]`).
     - Memicu tombol meluncurkan *Cinematic Cut-In Banner HTML HD* (`z-[290]`): layar meredup, banner diagonal emas bersinar `★ DUO STARLIGHT SLASH! ★` dengan potret avatar pemain dan pasangan berdampingan selama 1.6s.
     - Eksekusi *Cross-Slash Dash*: Player dan Partner melesat menyilang dari kedua sisi menghasilkan tebasan X raksasa bergetar hebat (`hitstop 0.15s`, `k.shake(6)`).
     - Ledakan Kemenangan: Boss meledak dalam semburan 45 partikel ungu-emas, gerbang segel arena dan kubah segel kado hancur lebur, tempo BGM kembali normal, hujan kelopak sakura pink + partikel emas meriah terus-menerus turun, karakter pemain/partner/pet melompat gembira dengan emote hati `♥`, kamera kembali bebas, dan Kotak Kado di `x: 1850` terbuka untuk memicu selebrasi akhir *GiftModal*.


---

## 10. Roadmap Polish HD-2D, Fitur Emosional & Stabilitas (v5.0)

Roadmap v5.0 adalah tahap penyempurnaan menyeluruh (*high-tier polish*) yang mentransformasi Digital-8-Bit dari game petualangan 16-bit fungsional menjadi mahakarya visual bergaya **HD-2D** modern, stabil di seluruh kelas perangkat (desktop & mobile *low-end*), serta kaya akan sentuhan emosional personal yang mendalam.

```
┌────────────────────────────────────────────────────────────────────────┐
│ FASE P-1: STABILITAS, PRELOADER & GAME FEEL                            │
│ • Preloader Bar 16-bit (0% → 100%) bebas asset pop-in                  │
│ • Auto-Pause & Audio Mute cerdas saat ganti tab (visibilitychange)     │
│ • Particle Cap (maksimal 45 partikel) penjaga 60 FPS mobile            │
│ • Haptic Feedback halus mobile (tebasan, deflect, Duo Finisher)        │
│ • Tirai transisi Fade-In/Out hitam-emas cepat (0.3s)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Review & Approval)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FASE P-2: VISUAL HD-2D & ATMOSFER DINAMIS                              │
│ • Transisi Langit Dinamis (Senja Jingga → Malam Sakura → Fajar Emas)   │
│ • Kota "Bernapas" (Jendela gedung menyala-mati & bintang jatuh acak)   │
│ • Foreground Parallax 1.25x (Siluet dedaunan/kelopak sakura depan)     │
│ • Ambient Glow, Fake Bloom halus & Vignette sinematik                  │
│ • Squash & Stretch elastis + Ghost Trail (Afterimage) tebasan          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Review & Approval)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FASE P-3: FITUR EMOSIONAL, EASTER EGG & PERSONALISASI                  │
│ • Boss Personal Taunt (Menyebut nama penerima kado di Title Card)      │
│ • Easter Egg "Duduk di Ayunan Berdua" + Pesan Rahasia Manis            │
│ • Mode Bebas "Kembali ke Taman Sakura" setelah tamat (Post-Game Peace) │
│ • Prangko Petualangan mini-snapshot pada Kartu Kado .PNG               │
│ • 4 Pesan Kenangan Kustom di /create (Kolom I Sheet, Backwards-Compat) │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 10.1 Alur dan Filosofi Pemolesan v5.0

Penyempurnaan v5.0 berlandaskan pada 3 pilar utama:
1. **Pilar Stabilitas (Rock-Solid Stability):** Seluruh aset game wajib siap di memori sebelum petualangan dimulai. Game tidak boleh mengalami lonjakan lag (*frame drop*), glitch partikel menumpuk, atau audio yang tetap berbunyi saat layar HP dimatikan.
2. **Pilar Keindahan HD-2D (Atmospheric Beauty):** Menghadirkan kedalaman ruang visual melalui gradasi pencahayaan ambient yang hangat, transisi waktu alami mengikuti babak cerita, dan lapisan parallax multi-dimensi dari latar belakang hingga latar depan terdekat.
3. **Pilar Sentuhan Emosional (Heartfelt Personalization):** Setiap kado adalah surat cinta atau ucapan berharga. Memberikan detail personal intim (Boss yang mengenali nama penerima, momen duduk berayun berdua, eksplorasi damai post-game, serta kenangan kustom pada tiap bintang) yang membekas di hati penerima kado.

---

### 10.2 Aturan Teknis & Batasan Arsitektur (Mematuhi Bagian 7)

1. **Prinsip Nol Teks Kanvas (Zero-Canvas-Text):**
   - Seluruh teks baru (persentase preloader, dialog taunt Boss, pesan rahasia ayunan, dan tombol post-game) **WAJIB** dirender via lapisan HTML + SVG Piksel murni beresolusi tajam (*Retina HD*).
   - Kanvas KAPLAY hanya merender sprite, partikel efek, pencahayaan/tint latar, dan deformasi transformasi.
2. **Komponen Lifespan & Opacity:**
   - Setiap pemanggilan entitas partikel dengan `k.lifespan(...)` (kelopak sakura, bintang jatuh, bara api, ghost trail) **WAJIB** menyertakan komponen `k.opacity(...)` untuk mencegah runtime error KAPLAY.
3. **Kamera Standar Modern:**
   - Gunakan `k.setCamPos(...)` dan `k.getCamPos(...)`, hindari pemanggilan metode terdepresiasi `k.camPos(...)`.
4. **Akumulator Delta Waktu (`k.dt()`):**
   - Seluruh pewaktu (transisi langit, bintang jatuh, interval lampu kota, squash & stretch) **WAJIB** dihitung secara manual menggunakan delta waktu `dt`, dilarang menggunakan `k.wait()` untuk timer berbasis state.
5. **Isolasi Logika Game dari React:**
   - Seluruh modul di `lib/game/` tetap bebas dari ketergantungan hook React. Komunikasi state baru (persentase loading, trigger ayunan, snapshot kado) dialirkan melalui callback interface terdaftar pada `GameCanvas.tsx`.
6. **Nol Dependensi Baru:**
   - Dilarang menginstal library npm baru. Haptic feedback menggunakan `navigator.vibrate` native, snapshot menggunakan Canvas API bawaan browser, dan vignette menggunakan CSS murni.

---

### 10.3 Pembagian 3 Fase Eksekusi Bertahap

#### Fase P-1 — Stabilitas, Preloader & Game Feel [SELESAI & TERVERIFIKASI]
Fokus pada keandalan eksekusi teknis, kenyamanan kontrol, dan kinerja 60 FPS bebas *pop-in*:
1. **Preloader Bar 16-Bit yang Jujur:**
   - Menghadirkan bilah loading piksel (`0% → 100%`) berbingkai 9-slice emas retro di tengah `StartScreen.tsx`.
   - Mengalkulasikan progres aktual pemuatan aset (`preflightImage` & `k.loadSprite` untuk seluruh sprite: `boss_dragon_*`, `decor_big_tree`, `emote_heart`, background, dll.). Tombol **`PRESS START`** hanya aktif setelah progres mencapai 100%, menghilangkan masalah aset terlambat muncul (*pop-in*).
2. **Auto-Pause Pintar (`visibilitychange`):**
   - Mendengarkan event `document.addEventListener("visibilitychange")`.
   - Saat tab diminimalkan atau ponsel menerima panggilan/chat: game otomatis dijeda (*auto-pause*) dan volume audio BGM di-mute seketika tanpa merusak posisi karakter atau BGM look-ahead scheduler.
   - Saat tab aktif kembali: memunculkan banner overlay ringkas *"Game Dijeda — Ketuk untuk Melanjutkan"*.
3. **Batas Maksimal Partikel (*Particle Cap*):**
   - Menerapkan pembatas kuota partikel visual aktif di kanvas maksimal **`45` partikel**.
   - Jika kuota tercapai, sistem membuang (*recycle/destroy*) partikel tertua secara anggun, mencegah penumpukan partikel berlebih pada momen puncak (hujan sakura + bara api + ledakan *Duo Finisher*) agar ponsel *entry-level* tetap stabil di 60 FPS.
4. **Haptic Feedback (Getar Halus Mobile):**
   - Mengintegrasikan API native `navigator.vibrate` dengan pengecekan aman (`"vibrate" in navigator`) dan menghormati preferensi perangkat:
     - Tebasan pedang biasa mengenai musuh: `navigator.vibrate(15)` (getar mikro renyah).
     - Menangkis bola api naga (*deflect*): `navigator.vibrate(25)`.
     - Ledakan pamungkas *Duo Starlight Slash*: `navigator.vibrate([40, 30, 60])` (pola getar dramatis).
5. **Transisi Fade-In/Out Antar Adegan:**
   - Tirai transisi hitam/emas cepat (`0.3` detik) yang meredup halus saat berpindah fase (*Start Screen → Live Cutscene Prolog → Gameplay → Layar Kado*), menciptakan sambungan adegan yang mulus dan sinematik.

#### Fase P-2 — Visual HD-2D & Atmosfer Dinamis [SELESAI & TERVERIFIKASI]
Fokus pada peningkatan kualitas grafis, pencahayaan, dan kedalaman atmosfer:
1. **Transisi Langit Dinamis (Senja Jingga → Malam Sakura → Fajar Emas):**
   - Mengubah gradasi warna latar langit (`sky_gradient`) secara halus berbasis progres posisi pemain `player.pos.x` dan status pertarungan:
     - **Babak 1 (`x: 0 – 1050`):** Langit senja jingga hangat bergradasi ungu-oranye (*Warm Cozy Sunset*).
     - **Babak 2 (`x: 1050 – 1420`):** Langit malam biru gelap bertabur bintang lembut menemani cahaya kunang-kunang di bawah Pohon Sakura.
     - **Babak 3 (`x: 1420 – 1920`):** Langit ungu gelap berbadai petir halus yang menegangkan saat menghadapi Dragon Boss.
     - **Babak 4 (Pasca Finisher):** Langit fajar keemasan (*Golden Dawn*) yang merekah cerah melambangkan kemenangan dan harapan.
2. **Kota yang "Bernapas" (*Living City Silhouette*):**
   - Menambahkan variasi pada ubin gedung perkotaan (`bg_city_mid`): jendela-jendela kuning kecil yang menyala dan mati secara perlahan dan acak.
   - Efek **bintang jatuh** (*shooting star*): seberkas cahaya emas melesat miring di langit atap kota secara acak setiap `12–15` detik (menggunakan `k.lifespan` + `k.opacity`).
3. **Foreground Parallax (Lapisan Depan Kamera, Kedalaman 2.5D):**
   - Menambahkan lapisan visual terdepan di atas kanvas gameplay (`z-index: 55`, bergerak dengan faktor parallax `1.25×` kecepatan kamera horizontal).
   - Menampilkan siluet lembut dedaunan atap gedung atau kelopak sakura berukuran besar yang melintas kabur di pinggir layar, memberikan sensasi kedalaman ruang (*depth of field*).
4. **Cahaya Ambient, Fake Bloom & Vignette Sinematik:**
   - Menambahkan pendar cahaya melingkar lembut (*ambient radial glow*) di sekitar lentera jalan, lampu gantung pohon, mata naga, dan bola api.
   - Lapisan CSS *vignette* tipis transparan di keempat sudut viewport permainan untuk memusatkan fokus mata pemain ke karakter utama.
5. **Squash & Stretch + Ghost Trail (*Afterimage*):**
   - Deformasi elastis pada sprite pemain: karakter sedikit memipih saat bersiap melompat (`scale(0.88, 1.12)`) dan saat mendarat di genteng (`scale(1.15, 0.85)`).
   - Efek *Ghost Trail* (2–3 bayangan semu transparan berkedip) yang tertinggal di belakang karakter saat melakukan tebasan pedang beruntun dan saat melesat cepat pada serangan *Duo Starlight Slash*.

#### Fase P-3 — Fitur Emosional, Easter Egg & Personalisasi [SELESAI & TERVERIFIKASI]
Fokus pada kedekatan emosional, rahasia manis, dan kenangan kado yang abadi:
1. **Boss yang "Nyebut Nama" (*Personal Taunt*):**
   - Pada *Title Card* kemunculan Dragon Boss di awal Babak 3, tambahkan 1 baris teks personal interaktif yang menyapa nama penerima kado:
     > *"Kado spesial untuk [receiver_name] terlalu berharga untuk dilepas begitu saja!"*
   - Menegaskan bahwa pertempuran ini dirancang khusus untuk memperjuangkan kado penerima.
2. **Easter Egg "Duduk di Ayunan Berdua":**
   - Setelah dialog reuni selesai di Babak 2, jika pemain berdiri mendekati ayunan kayu di bawah Pohon Sakura (`x: 1255 – 1285`), muncul prompt interaksi manis: **`[E] / [TAP] DUDUK BERAYUN`**.
   - Saat ditekan: kedua avatar otomatis duduk berdampingan di ayunan kayu yang bergerak pelan, kamera melakukan *soft zoom-in* sinematik, guguran kelopak sakura melayang lembut, dan muncul balon dialog manis rahasia bergaya JRPG (misal: *"Menghabiskan waktu bersamamu selalu jadi momen favoritku."*). Pemain bisa berdiri kembali kapan saja dengan menekan tombol arah/lompat.
3. **Mode "Jalan-Jalan Santai" Setelah Tamat (Post-Game Peace):**
   - Pada modal akhir `GiftModal.tsx`, tambahkan tombol sekunder: **"🌸 Kembali ke Puncak Sakura"**.
   - Mengembalikan pemain ke arena puncak dalam mode damai (*Peaceful Post-Game*): seluruh musuh dan naga telah tiada, cuaca fajar keemasan yang indah, Partner berjalan setia mendampingi, pemain bebas berkeliling atap, duduk kembali di ayunan, atau mengambil tangkapan layar/rekaman video kenangan.
4. **Stempel "Momen Petualangan" di Kartu Kado `.png`:**
   - Sesaat setelah ledakan *Duo Finisher* berhasil dan perayaan hujan sakura dimulai, sistem mengambil *mini canvas snapshot* (tangkapan layar piksel 80×50 px).
   - Saat penerima menekan tombol **"Simpan Kartu Kado"** (`handleSaveCard`), snapshot petualangan tersebut otomatis ditempelkan sebagai **stiker prangko piksel kecil berbingkai emas** di sudut kartu polaroid PNG, menjadikan kartu kado sebagai bukti kenangan petualangan bersama yang otentik.
5. **Pesan Custom di 4 Bintang Kenangan (Formulir `/create`):**
   - Pada halaman `/create`, tambahkan akordeon opsional: **"Pesan Khusus di Tiap Bintang Kenangan (Opsional)"** berisi 4 baris input teks pendek (maks 40 karakter per bintang).
   - Jika diisi, saat pemain menyentuh Bintang Kenangan 1, 2, 3, dan 4 di Babak 1, toast notifikasi menampilkan pesan khusus pembuat kado (misal: *"Kenangan pertama kita di bioskop"*). Jika dikosongkan, sistem memakai pesan default yang sudah ada.
   - **Kompatibilitas Database Bersih:** Data disimpan di kolom ke-9 (Kolom I) Google Sheets sebagai string JSON `memory_messages` tanpa mengubah urutan atau struktur Kolom A–H yang sudah ada. Kado lama v1–v4 tetap berjalan 100% dengan teks default.

---

## 11. Changelog & Arsitektur Stabil Terkini (v5.1 Post-Audit Enhancements)

Versi 5.1 adalah hasil integrasi menyeluruh dan pengujian otomatis *end-to-end* (Playwright WebApp Testing + Antislop UI/UX) yang memastikan proyek memenuhi standar industri tertinggi, siap pakai secara publik, dan bebas regresi:

### 11.1 Pemulihan Aksesibilitas Scroll & Tata Letak Rute
- **Pemisahan Kuncian Viewport:** Menghapus `overflow-hidden` global dari `layout.tsx`, `page.tsx`, dan `create/page.tsx`. Halaman Beranda (`/`) dan Formulir (`/create`) kini memiliki tinggi fleksibel `min-h-dvh` dan dapat di-scroll dengan sangat halus (*smooth native scroll*) di seluruh resolusi layar (Desktop, Laptop, Tablet, dan Mobile).
- **Isolasi Viewport Game:** Pembatasan `overflow-hidden` dikunci secara eksklusif hanya pada rute `/play/[id]` agar kanvas KAPLAY dan elemen kontrol on-screen tetap stabil tanpa scroll samping yang tidak disengaja.

### 11.2 Redesign Beranda Starlight Keepsake (Hero Split)
- Mengubah tata letak kotak tunggal lama menjadi **Hero Split 2 Kolom**:
  - Sisi Kiri: Tipografi judul retro modern *Starlight Keepsake*, deskripsi bernada hangat, dan 2 tombol CTA jelas ("Buat Kado Sekarang" & "Coba Demo").
  - Sisi Kanan: Bingkai pratinjau kanvas 16-bit asli yang memanfaatkan aset internal proyek (`bg_city_mid`, karakter, kado).
- Menambahkan bagian panduan 3 langkah petualangan di bawah hero dengan kontras tinggi dan ukuran font yang nyaman dibaca di layar HP.

### 11.3 Redesign Formulir Quest Wizard 3 Langkah & Live Preview
- **Wizard 3 Langkah:** Membagi formulir panjang menjadi 3 tahap terfokus (Langkah 1: Identitas & Pesan; Langkah 2: Foto & Musik; Langkah 3: Kuis & Bonus) dengan bar progres retro yang bersih.
- **Live Preview Kartu Kado Real-Time:** Menghadirkan kolom pratinjau langsung di sebelah form (layar Desktop `lg:`) yang menampilkan nama penerima, sprite avatar pilihan, dan foto kenangan secara dinamis saat pengguna mengetik.
- **Validasi Lembut (*Soft Amber Alert*):** Menghapus border merah keras dan banner error yang agresif, menggantinya dengan aksen *warm amber* (`#FBBF24` / `bg-amber-950/30` lis halus), auto-focus ke kolom yang belum diisi saat tombol "Lanjut" ditekan, serta ringkasan kelengkapan yang tenang.
- **Safe-Area Padding Mobile:** Menambahkan padding bawah aman `pb-[max(2rem,env(safe-area-inset-bottom))]` agar tombol submit tidak tertutup bar navigasi iPhone/Android.

### 11.4 Penskalaan Kanvas Full-Viewport 16:9 Adaptif
- Memperbarui logika penskalaan di `GameCanvas.tsx` dari *integer scaling* kaku menjadi **Full-Viewport 16:9 Adaptif**:
  $$\text{scale} = \min\left(\frac{\text{vw}}{480}, \frac{\text{vh}}{270}\right)$$
- Kanvas membesar maksimal hingga batas 100% viewport (`100vw` / `100dvh`), mengeliminasi bingkai gelap tebal di keempat sisi pada layar laptop maupun desktop tanpa memotong konten dan tanpa distorsi rasio 16:9.

### 11.5 State Machine Typewriter 2-Tahap JRPG (Zero Race Condition)
- Memperbaiki bug glitch pengetikan pada seluruh modal dialog (`PrologueModal.tsx`, `ReunionModal.tsx`, `GiftModal.tsx`):
  - ID timer disimpan di dalam `useRef` terpisah (`timerRef`, `typewriterTimerRef`).
  - **Tahap 1 (Saat Mengetik):** Menekan tombol `Spasi`, `Enter`, atau mengklik kotak dialog langsung membatalkan timer aktif (`clearInterval`), mengubah status ke selesai, dan menampilkan 100% teks seketika tanpa melompati adegan.
  - **Tahap 2 (Saat Teks Penuh):** Input berikutnya baru melanjutkan ke adegan dialog selanjutnya atau menutup modal.
  - Proteksi `e.repeat` ditambahkan pada event listener keyboard untuk mencegah pemicuan ganda saat tombol ditahan.
  - `ChallengeModal.tsx` dilengkapi pembersihan timer feedback 1200ms saat unmount agar bebas dari kebocoran memori.

### 11.6 Penyesuaian HUD & Banner Orientasi Mobile
- Memindahkan posisi banner instruksi orientasi `"Putar layar Anda (Landscape disarankan)"` ke `top-14` / `top-16` tepat di bawah kapsul HUD atas di layar potret ponsel, dengan `pointer-events-none` dan fitur **auto-dismiss setelah 4 detik** (lengkap dengan cleanup timeout).
