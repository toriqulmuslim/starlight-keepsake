import Link from "next/link";
import RetroButton from "@/components/RetroButton";
import PixelRibbonBanner from "@/components/PixelRibbonBanner";
import {
  PixelGift,
  PixelGamepad,
  PixelSparkle,
  PixelStar,
  PixelScroll,
  PixelCheck,
  PixelHeart,
  PixelSword,
  PixelShield,
} from "@/components/PixelIcons";

export default function HomePage() {
  return (
    <main className="min-h-dvh starlight-bg flex flex-col items-center text-slate-100 relative selection:bg-[#ffbe3b] selection:text-[#121324]">
      {/* Dekorasi Bintang Berkelip di Latar Belakang */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <span className="absolute top-[8%] left-[6%] text-amber-300/40 text-xs font-pixel animate-pulse">✦</span>
        <span className="absolute top-[18%] right-[10%] text-pink-300/40 text-sm font-pixel animate-pulse" style={{ animationDelay: "1s" }}>★</span>
        <span className="absolute top-[45%] left-[4%] text-amber-200/30 text-xs font-pixel animate-pulse" style={{ animationDelay: "1.5s" }}>✦</span>
        <span className="absolute top-[65%] right-[6%] text-indigo-300/40 text-sm font-pixel animate-pulse" style={{ animationDelay: "0.5s" }}>★</span>
        <span className="absolute top-[85%] left-[12%] text-amber-300/40 text-xs font-pixel animate-pulse" style={{ animationDelay: "2s" }}>✦</span>
      </div>

      {/* Navigasi Atas Ringkas */}
      <header className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-[#ffbe3b]/15 border-2 border-[#ffbe3b] flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <PixelSparkle size={16} className="text-[#ffd166] animate-pulse" />
          </div>
          <div>
            <span className="font-pixel text-xs sm:text-sm text-white tracking-wider block">
              STARLIGHT KEEPSAKE
            </span>
            <span className="text-[9px] font-sans font-semibold text-amber-300/80 tracking-wide block">
              Petualangan Kado Digital 16-Bit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/play/demo-quiz" className="hidden sm:inline-block">
            <span className="font-pixel text-[10px] text-slate-300 hover:text-amber-300 transition-colors px-3 py-1.5 border border-slate-700 hover:border-amber-400/50 bg-[#17152b]/80">
              Coba Demo
            </span>
          </Link>
          <Link href="/create">
            <RetroButton variant="primary" size="sm" className="text-[10px] sm:text-xs py-2 px-3 sm:px-4">
              <span className="flex items-center gap-1.5">
                <PixelGift size={12} className="shrink-0" />
                <span>Buat Kado</span>
              </span>
            </RetroButton>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SPLIT SECTION (2 Kolom Desktop, Stack Rapi Mobile)                   */}
      {/* ========================================================================= */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 pb-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Kolom Kiri: Headline & CTA */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge RPG Retro */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1e1a38] border border-[#ffbe3b]/40 rounded-xs text-[10px] font-pixel text-[#ffbe3b] shadow-sm mb-5">
            <PixelSparkle size={11} className="text-[#ffd166]" />
            <span>KADO DIGITAL PERSONAL INTERAKTIF</span>
          </div>

          {/* Headline Utama */}
          <h1 className="font-pixel text-xl sm:text-2xl md:text-3xl lg:text-[28px] text-white leading-relaxed tracking-wide mb-4 drop-shadow-[3px_3px_0px_#0c0d19]">
            Abadikan Ceritamu dalam Petualangan{" "}
            <span className="text-[#ffd166] drop-shadow-[3px_3px_0px_rgba(255,190,59,0.3)]">
              16-Bit HD-2D
            </span>{" "}
            yang Hangat
          </h1>

          {/* Subtitle Humanis & Hangat (Anti-Slop Copywriting) */}
          <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-xl">
            Rangkai pesan kasih sayang, foto kenangan terindah, dan teka-teki rahasia menjadi tautan game petualangan retro di atap kota senja.
            Orang tersayangmu akan memandu pahlawan pilihan, menjawab kuis manis, menghadapi boss naga, hingga membuka kado spesial di garis akhir.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
            <Link href="/create" className="w-full sm:w-auto">
              <RetroButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto py-3.5 px-7 text-xs sm:text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_#0c0d19]"
              >
                <PixelGift size={16} className="shrink-0 text-[#1a1c2c]" />
                <span>Buat Kado Sekarang</span>
              </RetroButton>
            </Link>
            <Link href="/play/demo-quiz" className="w-full sm:w-auto">
              <RetroButton
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto py-3.5 px-6 text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_#0c0d19]"
              >
                <PixelGamepad size={16} className="shrink-0 text-amber-300" />
                <span>Coba Contoh Kado</span>
              </RetroButton>
            </Link>
          </div>

          {/* Feature Badges / Trust Points */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-sans text-slate-400">
            <span className="flex items-center gap-1.5">
              <PixelCheck size={12} className="text-[#2ed573]" />
              <span>Nol Aplikasi (Langsung di Browser)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <PixelCheck size={12} className="text-[#2ed573]" />
              <span>Kirim Cepat via WhatsApp</span>
            </span>
            <span className="flex items-center gap-1.5">
              <PixelCheck size={12} className="text-[#2ed573]" />
              <span>Unduh Kartu Polaroid .PNG</span>
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Bingkai Visual Game 16-Bit Asli */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-md rpg-box-golden p-2 sm:p-3 shadow-2xl relative">
            {/* Sudut Ornamen Emas */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />

            {/* Header Jendela Retro */}
            <div className="bg-[#121024] px-3 py-1.5 mb-2 flex items-center justify-between border-b border-[#383461]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff4757] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffa502] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2ed573] inline-block" />
              </div>
              <span className="font-pixel text-[9px] text-[#ffd166] tracking-wider">
                STAGE 01: ATAP KOTA SENJA
              </span>
              <span className="text-[10px] text-slate-400">480×270</span>
            </div>

            {/* Kanvas Mockup Adegan Petualangan */}
            <div className="relative aspect-video w-full rounded-xs overflow-hidden border-2 border-black bg-gradient-to-b from-[#241734] via-[#4a2545] to-[#f49f1c]/70 flex flex-col justify-between p-3 select-none">
              {/* Siluet Langit Malam & Bintang */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/10 via-transparent to-transparent pointer-events-none" />

              {/* HUD Mini di Atas */}
              <div className="relative z-10 flex items-center justify-between text-[9px] font-pixel">
                <div className="flex items-center gap-1 bg-[#121324]/90 px-2 py-1 rounded-xs border border-[#ff4757]/60">
                  <span className="text-[#ff4757]">♥♥♥</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-[#ffd166]">★ 4/4</span>
                </div>
                <div className="bg-[#121324]/90 px-2 py-1 rounded-xs border border-[#ffbe3b]/60 text-[#ffd166]">
                  KUIS 3/3
                </div>
              </div>

              {/* Adegan Karakter di Atap Gedung */}
              <div className="relative z-10 flex items-end justify-between pb-1">
                {/* Karakter Pahlawan & Pet */}
                <div className="flex items-end gap-2">
                  <div className="relative">
                    {/* Sprite Kotak Karakter Pahlawan */}
                    <div className="w-7 h-11 bg-[#2980b9] border-2 border-black shadow-[2px_2px_0_#000] relative flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#f1c40f] absolute top-1 rounded-[1px]" />
                      <div className="w-1.5 h-1.5 bg-[#e74c3c] absolute top-2 right-1" />
                    </div>
                  </div>
                  {/* Pet Companion */}
                  <div className="w-4 h-4 bg-white border border-black rounded-[1px] relative flex items-center justify-center shadow-xs">
                    <div className="w-1 h-1 bg-pink-400 rounded-full" />
                  </div>
                </div>

                {/* Balon Dialog Melayang */}
                <div className="bg-white/95 border-2 border-[#1a1c2c] px-2.5 py-1.5 rounded-xs shadow-[2px_2px_0px_#000] max-w-[170px] -translate-y-2">
                  <p className="font-sans text-[10px] text-[#1a1c2c] font-bold leading-tight">
                    &ldquo;Kado spesial menunggumu di garis akhir!&rdquo;
                  </p>
                </div>

                {/* Kotak Kado Berkilau di Ujung Atap */}
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 bg-[#c0392b] border-2 border-black shadow-[2px_2px_0_#000] relative flex items-center justify-center animate-bounce">
                    <div className="w-2 h-full bg-[#ffd166]" />
                    <div className="h-2 w-full bg-[#ffd166] absolute" />
                    <PixelSparkle size={10} className="absolute -top-2 -right-2 text-[#ffd166] animate-ping" />
                  </div>
                </div>
              </div>

              {/* Lantai Genteng Atap Kota */}
              <div className="absolute bottom-0 inset-x-0 h-4 bg-[#524d67] border-t-2 border-[#2c2738] flex">
                <div className="w-full h-1 bg-[#766f8e]" />
              </div>
            </div>

            {/* Caption Bawah Mockup */}
            <div className="mt-2.5 pt-2 border-t border-[#383461] flex items-center justify-between text-[10px] font-pixel text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <PixelStar size={11} />
                <span>Format Full 16:9</span>
              </span>
              <span>Audio Chiptune 8-Bit</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ALUR 3 LANGKAH PETUALANGAN (Lega, Bersih, Nyaman Di-scroll)                */}
      {/* ========================================================================= */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 z-10 border-t border-[#2e2a54]">
        <div className="text-center mb-10">
          <PixelRibbonBanner
            title="CARA KERJA PETUALANGAN"
            subtitle="Tiga Langkah Mudah Merangkai Kado"
            variant="gold"
            className="w-full max-w-md mx-auto mb-3"
          />
          <p className="font-sans text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Tak perlu keahlian koding. Cukup isi cerita dan foto kenanganmu, kami yang merajutnya menjadi mini-game RPG yang dapat dimainkan seketika.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Langkah 1 */}
          <div className="rpg-box p-6 flex flex-col justify-between hover:border-[#ffd166]/80 transition-all hover:-translate-y-1 duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-pixel text-[10px] text-[#2ed573] bg-[#2ed573]/15 px-2.5 py-1 border border-[#2ed573]/40 rounded-xs">
                  TAHAP 01
                </span>
                <div className="w-8 h-8 rounded-xs bg-[#17152b] border border-[#2ed573]/40 flex items-center justify-center">
                  <PixelScroll size={16} className="text-[#2ed573]" />
                </div>
              </div>
              <h3 className="font-pixel text-sm text-white mb-2.5 tracking-wide">
                Tulis Pesan & Pilih Pahlawan
              </h3>
              <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tentukan nama penerima kado, tulis surat rahasia menyentuh hati, dan pilih karakter pahlawan (Pendekar Biru atau Gaun Rose) yang akan dimainkan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#383461] text-[10px] font-pixel text-slate-400 flex items-center gap-1.5">
              <span className="text-[#2ed573]">✓</span>
              <span>Animasi Mesin Tik UTF-8</span>
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="rpg-box p-6 flex flex-col justify-between hover:border-[#ffd166]/80 transition-all hover:-translate-y-1 duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-pixel text-[10px] text-[#ffbe3b] bg-[#ffbe3b]/15 px-2.5 py-1 border border-[#ffbe3b]/40 rounded-xs">
                  TAHAP 02
                </span>
                <div className="w-8 h-8 rounded-xs bg-[#17152b] border border-[#ffbe3b]/40 flex items-center justify-center">
                  <PixelStar size={16} className="text-[#ffd166]" />
                </div>
              </div>
              <h3 className="font-pixel text-sm text-white mb-2.5 tracking-wide">
                Sematkan Foto & Musik 8-Bit
              </h3>
              <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                Unggah foto kenangan terindah yang otomatis terkompresi tajam, lalu pilih melodi chiptune senja (*Cozy Sunset*, *Happy Birthday*, atau *Starlight Lullaby*).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#383461] text-[10px] font-pixel text-slate-400 flex items-center gap-1.5">
              <span className="text-[#ffd166]">✓</span>
              <span>Bingkai Polaroid 9-Slice Emas</span>
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="rpg-box p-6 flex flex-col justify-between hover:border-[#ffd166]/80 transition-all hover:-translate-y-1 duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-pixel text-[10px] text-[#ff6b81] bg-[#ff6b81]/15 px-2.5 py-1 border border-[#ff6b81]/40 rounded-xs">
                  TAHAP 03
                </span>
                <div className="w-8 h-8 rounded-xs bg-[#17152b] border border-[#ff6b81]/40 flex items-center justify-center">
                  <PixelGift size={16} className="text-[#ff6b81]" />
                </div>
              </div>
              <h3 className="font-pixel text-sm text-white mb-2.5 tracking-wide">
                Bungkus & Kirim Tautan
              </h3>
              <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dapatkan tautan unik instan untuk dibagikan ke WhatsApp. Penerima dapat langsung bermain di ponsel mereka dan mengunduh Kartu Kado koleksi beresolusi tinggi.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#383461] text-[10px] font-pixel text-slate-400 flex items-center gap-1.5">
              <span className="text-[#ff6b81]">✓</span>
              <span>Ekspor Kartu .PNG Siap Cetak</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FITUR UNGGULAN PETUALANGAN 16-BIT                                         */}
      {/* ========================================================================= */}
      <section className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 z-10 border-t border-[#2e2a54]">
        <div className="rpg-inset p-6 sm:p-8 md:p-12 border-2 border-[#383461] relative">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="font-pixel text-xs text-[#ffd166] tracking-widest block mb-2">
              ✦ PETUALANGAN CERITA 4 BABAK ✦
            </span>
            <h2 className="font-pixel text-base sm:text-xl text-white mb-3">
              Bukan Sekadar Pesan Biasa
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
              Setiap kado dirancang dengan kedalaman mekanik RPG yang adil, seru, dan sarat emosi romantis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-4 bg-[#141226] border border-[#2a264a] rounded-xs">
              <div className="flex items-center gap-2 mb-2 text-[#ffd166]">
                <PixelHeart size={14} className="text-[#ff4757]" />
                <span className="font-pixel text-[11px] text-white">Reuni Partner</span>
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Bertemu avatar pasangan di bawah Pohon Sakura Raksasa yang bergabung mendampingi petualanganmu.
              </p>
            </div>

            <div className="p-4 bg-[#141226] border border-[#2a264a] rounded-xs">
              <div className="flex items-center gap-2 mb-2 text-[#ffd166]">
                <PixelSword size={14} className="text-[#ffd166]" />
                <span className="font-pixel text-[11px] text-white">Dragon Boss</span>
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Pertarungan boss bayangan yang adil; semburan bola api naga dapat dilompati atau ditebas balik (*deflect*).
              </p>
            </div>

            <div className="p-4 bg-[#141226] border border-[#2a264a] rounded-xs">
              <div className="flex items-center gap-2 mb-2 text-[#ffd166]">
                <PixelShield size={14} className="text-[#2ed573]" />
                <span className="font-pixel text-[11px] text-white">Kuis & Buff</span>
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Jawab teka-teki manis dari NPC Kelinci untuk mendapatkan perisai hati dan peningkatan kecepatan kilat.
              </p>
            </div>

            <div className="p-4 bg-[#141226] border border-[#2a264a] rounded-xs">
              <div className="flex items-center gap-2 mb-2 text-[#ffd166]">
                <PixelSparkle size={14} className="text-[#ffbe3b]" />
                <span className="font-pixel text-[11px] text-white">Duo Finisher</span>
              </div>
              <p className="font-sans text-xs text-slate-300 leading-relaxed">
                Klimaks serangan duet *Duo Starlight Slash* berdua untuk memecahkan segel peti kado di garis akhir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION                                                      */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl px-4 sm:px-6 py-12 md:py-16 text-center z-10">
        <div className="rpg-box-golden p-8 sm:p-12 relative">
          <h2 className="font-pixel text-base sm:text-xl md:text-2xl text-white mb-3 tracking-wide">
            Siap Menghadirkan Senyum untuk Orang Tersayang?
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-6">
            Hanya butuh 2 menit untuk merangkai kado. Bagikan tautannya dan biarkan mereka merasakan keajaiban petualangan retro yang tak terlupakan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/create">
              <RetroButton variant="primary" size="lg" className="py-4 px-8 text-xs sm:text-sm font-pixel flex items-center gap-2 shadow-[4px_4px_0px_#000]">
                <PixelGift size={16} className="text-[#1a1c2c]" />
                <span>Mulai Buat Kado Sekarang</span>
              </RetroButton>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER RETRO                                                              */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-[#232042] py-8 text-center text-xs font-sans text-slate-400 z-10 bg-[#0d0c18]/90">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-amber-300">STARLIGHT KEEPSAKE</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-xs">Petualangan Kado Digital 16-Bit HD-2D</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-pixel text-[10px]">
            <Link href="/create" className="hover:text-amber-300 transition-colors">
              Buat Kado
            </Link>
            <Link href="/play/demo-quiz" className="hover:text-amber-300 transition-colors">
              Coba Demo
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
