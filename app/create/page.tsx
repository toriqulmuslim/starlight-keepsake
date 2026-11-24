import Link from "next/link";
import CreateForm from "@/components/CreateForm";
import { PixelSparkle, PixelArrow } from "@/components/PixelIcons";

export default function CreateGiftPage() {
  return (
    <main className="min-h-screen starlight-bg flex flex-col items-center px-4 pt-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] md:py-12 text-slate-100 relative">
      {/* Tombol Kembali ke Beranda */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-pixel text-[10px] text-amber-300 hover:text-white transition-colors bg-[#1d1c3a] px-3 py-2 border-2 border-black shadow-[2px_2px_0_#000] active:translate-y-[1px]"
        >
          <PixelArrow direction="left" size={10} className="shrink-0" />
          <span>KEMBALI KE BERANDA</span>
        </Link>
        <span className="font-pixel text-[9px] text-slate-400 hidden sm:flex items-center gap-1.5">
          <PixelSparkle size={10} className="text-[#ffd166]" />
          <span>QUEST BUILDER 16-BIT</span>
          <PixelSparkle size={10} className="text-[#ffd166]" />
        </span>
      </div>

      {/* Formulir Pembuatan */}
      <CreateForm />
    </main>
  );
}
