import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number; // Maximum size in MB (default: 0.5)
  maxWidthOrHeight?: number; // Maximum width or height (default: 1920)
  useWebWorker?: boolean; // Use web worker for better performance (default: true)
  quality?: number; // Image quality 0-1 (default: 0.75)
  convertToWebP?: boolean; // Convert to WebP format (default: true)
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 0.5, // 500KB dan katta bo'lmasin (yaxshiroq siqish)
  maxWidthOrHeight: 1920, // 1920px dan katta bo'lmasin
  useWebWorker: true, // Web worker ishlatish
  quality: 0.75, // 75% sifat (yaxshiroq siqish)
  convertToWebP: true, // WebP formatga o'tkazish
};

/**
 * Rasmni WebP formatga o'tkazish
 */
async function convertToWebP(file: File, quality: number = 0.75): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert to WebP'));
              return;
            }
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
    let fileToCompress = file;
    
    // Agar WebP ga o'tkazish kerak bo'lsa va fayl allaqachon WebP emas
    if (compressionOptions.convertToWebP && !file.type.includes('webp')) {
      try {
        fileToCompress = await convertToWebP(file, compressionOptions.quality);
        console.log('📸 Rasm WebP ga o\'tkazildi');
      } catch (webpError) {
        console.warn('WebP ga o\'tkazishda xatolik, original formatda davom etilmoqda:', webpError);
        // WebP ga o'tkazishda xatolik bo'lsa, original fayl bilan davom etish
      }
    }

    // Rasmni siqish
    const compressedFile = await imageCompression(fileToCompress, {
      maxSizeMB: compressionOptions.maxSizeMB,
      maxWidthOrHeight: compressionOptions.maxWidthOrHeight,
      useWebWorker: compressionOptions.useWebWorker,
      fileType: fileToCompress.type, // WebP yoki original format
    });
    
    // Siqilgan fayl hajmini tekshirish
    const originalSizeMB = file.size / (1024 * 1024);
    const compressedSizeMB = compressedFile.size / (1024 * 1024);
    const reductionPercent = ((1 - compressedSizeMB / originalSizeMB) * 100).toFixed(1);
    
    console.log(`📸 Rasm siqildi: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${reductionPercent}% kamaydi)`);
    
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







