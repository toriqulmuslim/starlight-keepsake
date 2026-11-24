import { GiftData } from "./types";

export const DEMO_FIXTURES: Record<string, Partial<GiftData>> = {
  "demo-quiz": {
    id: "demo-quiz",
    receiver_name: "Ayunda Putri",
    message_text: "Terima kasih sudah selalu ada. Semoga harimu penuh senyuman dan kebahagiaan! 🎁✨",
    image_url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600",
    music_url: "preset:romantic",
    avatar: "female",
    memory_messages: [
      "Kopi pertama di bangku taman ☕",
      "Tawa lepas di tengah gerimis 🌧️",
      "Lagu favorit yang diulang terus 🎵",
      "Sampai di puncak bersamamu! ✨",
    ],
    challenges: [
      {
        id: "q1",
        question: "Tempat favorit kita saat pertama kali jalan bareng di mana?",
        options: ["Kafe Kopi Kenangan", "Taman Kota", "Bioskop XXI", "Tepi Pantai"],
        correctIndex: 1,
        buff: "shield",
      },
      {
        id: "q2",
        question: "Tebak, foto kenangan ini diambil di mana ya?",
        imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400",
        options: ["Puncak Bogor", "Yogyakarta", "Bandung", "Bali"],
        correctIndex: 2,
        buff: "speed",
      },
      {
        id: "q3",
        question: "Makanan apa yang selalu bikin kamu ceria lagi?",
        options: ["Es Krim Cokelat", "Martabak Manis", "Mie Instan Kuah", "Sate Ayam"],
        correctIndex: 0,
        buff: "power_star",
      },
    ],
  },
  "demo-basic": {
    id: "demo-basic",
    receiver_name: "Budi Petualang",
    message_text: "Selamat ulang tahun bro! Ini petualangan spesial buat kamu. Teruslah melangkah dan raih impianmu!",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600",
    music_url: "preset:cozy",
    avatar: "male",
    challenges: [],
  },
};

export const DEV_FIXTURES: Record<string, Partial<GiftData>> = {
  ...DEMO_FIXTURES,
  "dev-male-0q": {
    id: "dev-male-0q",
    receiver_name: "Budi Petualang",
    message_text: "Selamat ulang tahun bro! Ini petualangan spesial buat kamu.",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600",
    music_url: "preset:cozy",
    avatar: "male",
    challenges: [],
  },
  "dev-female-3q": {
    id: "dev-female-3q",
    receiver_name: "Ayunda Putri",
    message_text: "Terima kasih sudah selalu ada. Semoga harimu penuh senyuman dan kebahagiaan!",
    image_url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600",
    music_url: "preset:romantic",
    avatar: "female",
    memory_messages: [
      "Kopi pertama di bangku taman ☕",
      "Tawa lepas di tengah gerimis 🌧️",
      "Lagu favorit yang diulang terus 🎵",
      "Sampai di puncak bersamamu! ✨",
    ],
    challenges: [
      {
        id: "q1",
        question: "Tempat favorit kita saat pertama kali jalan bareng di mana?",
        options: ["Kafe Kopi Kenangan", "Taman Kota", "Bioskop XXI", "Tepi Pantai"],
        correctIndex: 1,
        buff: "shield",
      },
      {
        id: "q2",
        question: "Tebak, foto kenangan ini diambil di mana ya?",
        imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400",
        options: ["Puncak Bogor", "Yogyakarta", "Bandung", "Bali"],
        correctIndex: 2,
        buff: "speed",
      },
      {
        id: "q3",
        question: "Makanan apa yang selalu bikin kamu ceria lagi?",
        options: ["Es Krim Cokelat", "Martabak Manis", "Mie Instan Kuah", "Sate Ayam"],
        correctIndex: 0,
        buff: "power_star",
      },
    ],
  },
  "dev-legacy": {
    id: "dev-legacy",
    receiver_name: "Sahabat Sejati",
    message_text: "Kado retro klasik dari masa lalu tanpa kuis dan avatar.",
    image_url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600",
    music_url: "preset:happy",
    // Tanpa avatar dan challenges untuk menguji backward compatibility
  },
};
