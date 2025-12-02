import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number; // Maximum size in MB (default: 1)
  maxWidthOrHeight?: number; // Maximum width or height (default: 1920)
  useWebWorker?: boolean; // Use web worker for better performance (default: true)
  quality?: number; // Image quality 0-1 (default: 0.8)
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1, // 1MB dan katta bo'lmasin
  maxWidthOrHeight: 1920, // 1920px dan katta bo'lmasin
  useWebWorker: true, // Web worker ishlatish
  quality: 0.85, // 85% sifat (sifat buzilmasligi uchun)
};

/**
 * Rasmni yuklashdan oldin siqish va optimallashtirish
 * @param file - Original rasm fayli
 * @param options - Siqish parametrlari (ixtiyoriy)
 * @returns Siqilgan rasm fayli
 */
export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  // Faqat rasm fayllarini siqish
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const compressionOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    // Rasmni siqish
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Siqilgan fayl hajmini tekshirish
    const originalSizeMB = file.size / (1024 * 1024);
    const compressedSizeMB = compressedFile.size / (1024 * 1024);
    
    console.log(`📸 Rasm siqildi: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`);
    
    return compressedFile;
  } catch (error) {
    console.error('Rasm siqishda xatolik:', error);
    // Xatolik bo'lsa, original faylni qaytarish
    return file;
  }
}

/**
 * Rasmni tekshirish va kerak bo'lsa siqish
 * @param file - Original rasm fayli
 * @param maxSizeMB - Maksimal hajm MB (default: 1)
 * @returns Siqilgan rasm fayli yoki original fayl
 */
export async function optimizeImageIfNeeded(
  file: File,
  maxSizeMB: number = 1
): Promise<File> {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // Agar fayl kichik bo'lsa, siqish kerak emas
  if (fileSizeMB <= maxSizeMB) {
    return file;
  }
  
  // Katta faylni siqish
  return compressImage(file, { maxSizeMB });
}







