export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    quality?: number;
    convertToWebP?: boolean;
}
/**
 * Rasmni yuklashdan oldin siqish va optimallashtirish
 * @param file - Original rasm fayli
 * @param options - Siqish parametrlari (ixtiyoriy)
 * @returns Siqilgan rasm fayli
 */
export declare function compressImage(file: File, options?: CompressionOptions): Promise<File>;
/**
 * Rasmni tekshirish va kerak bo'lsa siqish
 * @param file - Original rasm fayli
 * @param maxSizeMB - Maksimal hajm MB (default: 1)
 * @returns Siqilgan rasm fayli yoki original fayl
 */
export declare function optimizeImageIfNeeded(file: File, maxSizeMB?: number): Promise<File>;
//# sourceMappingURL=image-compression.d.ts.map