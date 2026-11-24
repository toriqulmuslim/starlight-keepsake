/**
 * Memperkecil foto jika ukuran file > 1.5 MB untuk mempercepat upload dan hemat kuota (D7).
 * Sisi terpanjang dibatasi ke 1600 px dan kualitas 0.85 (JPEG / WebP).
 */
async function compressImageIfNeeded(file: File): Promise<Blob | File> {
  const MAX_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
  if (file.size <= MAX_SIZE_BYTES || typeof window === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1600;
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const mimeType = file.type === "image/png" ? "image/webp" : (file.type || "image/jpeg");
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, 0.85);
    });

    if (blob && blob.size < file.size) {
      return blob;
    }
    return file;
  } catch {
    // Jika manipulasi kanvas gagal, gunakan file asli
    return file;
  }
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey || apiKey === "your_imgbb_api_key_here") {
    throw new Error(
      "API Key ImgBB belum dikonfigurasi. Silakan periksa file .env.local"
    );
  }

  const processedBlob = await compressImageIfNeeded(file);
  const formData = new FormData();
  formData.append("image", processedBlob, file.name);

  // D7: AbortController batas waktu 60 detik
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    if (json.success && json.data && json.data.url) {
      return json.data.url as string;
    }

    throw new Error(json.error?.message || "Gagal mengunggah foto, coba lagi.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Unggah foto melebihi batas waktu (60 detik). Periksa koneksi internet Anda.");
      }
      throw error;
    }
    throw new Error("Gagal mengunggah foto, periksa koneksi internet Anda.");
  } finally {
    clearTimeout(timeoutId);
  }
}
