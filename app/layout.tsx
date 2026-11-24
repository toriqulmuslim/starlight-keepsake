import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kado Digital 8-Bit | Petualangan Hadiah Retro Spesial",
  description:
    "Kirimkan kado digital interaktif bernuansa indie RPG 16-bit untuk sahabat, pasangan, atau keluarga. Mainkan quest-nya, pecahkan tantangannya, dan buka kejutan terindahnya!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
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
