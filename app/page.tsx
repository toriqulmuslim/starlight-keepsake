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
} from "@/components/PixelIcons";

export default function HomePage() {
  return (
    <main className="min-h-screen starlight-bg flex flex-col items-center justify-center px-4 py-8 md:py-16 text-slate-100 relative overflow-hidden">
      {/* Dekorasi Bintang Berkelip di Latar Belakang */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <span className="absolute top-[12%] left-[10%] text-amber-300/40 text-xs font-pixel animate-pulse">✦</span>
        <span className="absolute top-[20%] right-[15%] text-pink-300/50 text-sm font-pixel animate-pulse" style={{ animationDelay: "1s" }}>★</span>
        <span className="absolute top-[65%] left-[8%] text-amber-200/30 text-xs font-pixel animate-pulse" style={{ animationDelay: "1.5s" }}>✦</span>
        <span className="absolute top-[75%] right-[12%] text-indigo-300/40 text-sm font-pixel animate-pulse" style={{ animationDelay: "0.5s" }}>★</span>
        <span className="absolute top-[40%] left-[88%] text-amber-300/40 text-xs font-pixel animate-pulse" style={{ animationDelay: "2s" }}>✦</span>
      </div>

      {/* Container Utama (Card RPG) */}
      <div className="w-full max-w-4xl rpg-box p-6 sm:p-8 md:p-14 relative z-10 animate-fade-in">
        {/* Sudut Piksel Dekoratif */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#ffbe3b] border border-black" />

        {/* Pita Judul Retro 16-Bit */}
        <div className="flex justify-center mb-6">
          <PixelRibbonBanner
            title="KADO DIGITAL 8-BIT"
            subtitle="Petualangan Kado Interaktif 16-Bit"
            variant="gold"
            className="w-full max-w-md"
          />
        </div>

        {/* Ilustrasi Kotak Kado 16-Bit */}
        <div className="flex justify-center mb-6">
          <div className="relative group cursor-pointer">
            {/* Glow Aura di belakang kado */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />

            {/* Kotak Kado Pixel Art */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#d63031] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              {/* Pita Kuning Vertikal */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-5 bg-gradient-to-r from-[#ffd166] to-[#f49f1c] border-x-2 border-black/30" />
              {/* Pita Kuning Horizontal */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-b from-[#ffd166] to-[#f49f1c] border-y-2 border-black/30" />
              {/* Simpul Pita Atas */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1">
                <div className="w-5 h-5 bg-[#ffd166] border-2 border-black rotate-45 shadow-[inset_1px_1px_0_#fff]" />
                <div className="w-5 h-5 bg-[#f49f1c] border-2 border-black -rotate-45 shadow-[inset_1px_1px_0_#fff]" />
              </div>
              {/* Kilauan Tengah */}
              <div className="absolute z-10 w-3 h-3 bg-white rotate-45 animate-ping opacity-75" />
            </div>
          </div>
        </div>

        {/* Judul Hero */}
        <div className="text-center mb-6">
          <h1 className="font-pixel text-base sm:text-xl md:text-2xl text-[#ffd166] tracking-wider leading-relaxed mb-3 drop-shadow-[3px_3px_0px_rgba(0,0,0,0.9)]">
            PETUALANGAN KADO RETRO
          </h1>
          <p className="font-sans text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ubah pesan kasih dan foto kenanganmu menjadi mini-game petualangan retro yang hangat.
            Orang tersayangmu akan memandu karakternya menembus senja, menjawab teka-teki manis,
            dan membuka kotak kado spesial di garis akhir.
          </p>
        </div>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/create" className="w-full sm:w-auto">
            <RetroButton
              variant="primary"
              size="lg"
              className="w-full sm:w-auto py-4 px-8 text-xs sm:text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <PixelGift size={16} className="shrink-0" />
              <span>Buat Kado Sekarang</span>
            </RetroButton>
          </Link>
          <Link href="/play/demo-quiz" className="w-full sm:w-auto">
            <RetroButton
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto py-4 px-6 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <PixelGamepad size={16} className="shrink-0" />
              <span>Coba Contoh Kado</span>
            </RetroButton>
          </Link>
        </div>

        {/* 3 Langkah Mudah (Quest Cards) */}
        <div className="border-t-2 border-[#383461] pt-8">
          <div className="text-center mb-6">
            <span className="font-pixel text-xs text-[#ffbe3b] tracking-widest flex items-center justify-center gap-2">
              <PixelSparkle size={12} />
              <span>CARA KERJA PETUALANGAN</span>
              <PixelSparkle size={12} />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Langkah 1 */}
            <div className="rpg-inset p-5 flex flex-col justify-between group hover:border-[#ffbe3b]/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-pixel text-[10px] text-[#2ed573] bg-[#2ed573]/10 px-2 py-0.5 border border-[#2ed573]/30">
                    TAHAP 01
                  </span>
                  <PixelScroll size={18} className="text-[#2ed573]" />
                </div>
                <h3 className="font-pixel text-xs text-slate-100 mb-2">Tulis Pesan</h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">
                  Tentukan nama penerima, ketik surat menyentuh hati, dan pilih musik latar senja 8-bit kesukaanmu.
                </p>
              </div>
            </div>

            {/* Langkah 2 */}
            <div className="rpg-inset p-5 flex flex-col justify-between group hover:border-[#ffbe3b]/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-pixel text-[10px] text-[#ffbe3b] bg-[#ffbe3b]/10 px-2 py-0.5 border border-[#ffbe3b]/30">
                    TAHAP 02
                  </span>
                  <PixelStar size={18} className="text-[#ffd166]" />
                </div>
                <h3 className="font-pixel text-xs text-slate-100 mb-2">Sematkan Foto</h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">
                  Unggah foto kenangan terindah dan tambahkan kuis tantangan manis agar petualangan terasa lebih seru.
                </p>
              </div>
            </div>

            {/* Langkah 3 */}
            <div className="rpg-inset p-5 flex flex-col justify-between group hover:border-[#ffbe3b]/60 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-pixel text-[10px] text-[#ff6b81] bg-[#ff6b81]/10 px-2 py-0.5 border border-[#ff6b81]/30">
                    TAHAP 03
                  </span>
                  <PixelGift size={18} className="text-[#ff6b81]" />
                </div>
                <h3 className="font-pixel text-xs text-slate-100 mb-2">Kirim Tautan</h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">
                  Dapatkan tautan kado unik yang siap dikirimkan lewat WhatsApp, DM, atau kartu ucapan instan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Features Info */}
        <div className="mt-8 pt-6 border-t border-[#282548] flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-sans">
          <span className="flex items-center gap-1.5">
            <PixelCheck size={12} className="text-emerald-400 shrink-0" />
            <span>100% Gratis Tanpa Akun</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <PixelCheck size={12} className="text-amber-400 shrink-0" />
            <span>Mendukung HP & Laptop</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <PixelCheck size={12} className="text-pink-400 shrink-0" />
            <span>Kartu Kado Bisa Diunduh (.PNG)</span>
          </span>
        </div>
      </div>
    </main>
  );
}
