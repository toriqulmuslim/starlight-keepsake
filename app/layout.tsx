import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starlight Keepsake | Petualangan Kado Digital 16-Bit",
  description:
    "Kirimkan kado digital personal bernuansa Action-RPG 16-bit HD-2D untuk sahabat, pasangan, atau keluarga. Jelajahi atap senja, pecahkan kuis rahasia, dan buka kejutan terindah!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="min-h-full">
      <head>
        <meta name="theme-color" content="#121324" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#121324] text-slate-100 selection:bg-[#ffbe3b] selection:text-[#121324] antialiased">
        {children}
      </body>
    </html>
  );
}
