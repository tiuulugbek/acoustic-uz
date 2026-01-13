import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number; // Maximum size in MB (default: 0.5)
  maxWidthOrHeight?: number; // Maximum width or height (default: 1920)
  useWebWorker?: boolean; // Use web worker for better performance (default: true)
  quality?: number; // Image quality 0-1 (default: 0.75)
  convertToWebP?: boolean; // Convert to WebP format (default: true)
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 0.15, // 150KB dan katta bo'lmasin (juda kichik hajm)
  maxWidthOrHeight: 1920, // 1920px dan katta bo'lmasin
  useWebWorker: true, // Web worker ishlatish
  quality: 0.65, // 65% sifat (yaxshiroq siqish)
  convertToWebP: false, // WebP formatga o'tkazish - ixtiyoriy (muammo bo'lsa false qiling)
};

/**
 * Rasmni WebP formatga o'tkazish
 */
async function convertToWebP(file: File, quality: number = 0.65, maxSizeMB: number = 0.15): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Rasm o'lchamini tekshirish va kerak bo'lsa kichiklashtirish
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Rasmni chizish
        ctx.drawImage(img, 0, 0, width, height);
        
        // WebP ga o'tkazish va hajmini tekshirish
        const convertWithQuality = (q: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert to WebP'));
                return;
              }
              
              const sizeMB = blob.size / (1024 * 1024);
              
              // Agar hajm katta bo'lsa, sifatni pasaytirish
              if (sizeMB > maxSizeMB && q > 0.5) {
                convertWithQuality(q - 0.1);
                return;
              }
              
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(webpFile);
            },
            'image/webp',
            q
          );
        };
        
        convertWithQuality(quality);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
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
        fileToCompress = await convertToWebP(file, compressionOptions.quality, compressionOptions.maxSizeMB || 0.15);
        console.log('📸 Rasm WebP ga o\'tkazildi:', {
          original: file.name,
          webp: fileToCompress.name,
          originalSize: (file.size / 1024).toFixed(1) + 'KB',
          webpSize: (fileToCompress.size / 1024).toFixed(1) + 'KB',
        });
      } catch (webpError) {
        console.warn('⚠️ WebP ga o\'tkazishda xatolik, original formatda davom etilmoqda:', webpError);
        // WebP ga o'tkazishda xatolik bo'lsa, original fayl bilan davom etish
        fileToCompress = file;
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







