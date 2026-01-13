/**
 * Transliterates Cyrillic and Uzbek characters to Latin
 */
const transliterate = (text: string): string => {
  const cyrillicMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  };

  const uzbekMap: Record<string, string> = {
    'ў': 'o\'', 'ғ': 'g\'', 'ҳ': 'h', 'қ': 'q',
    'Ў': 'O\'', 'Ғ': 'G\'', 'Ҳ': 'H', 'Қ': 'Q',
  };

  let result = text;
  
  // Transliterate Cyrillic
  for (const [cyr, lat] of Object.entries(cyrillicMap)) {
    result = result.replace(new RegExp(cyr, 'g'), lat);
  }
  
  // Transliterate Uzbek
  for (const [uzb, lat] of Object.entries(uzbekMap)) {
    result = result.replace(new RegExp(uzb, 'g'), lat);
  }
  
  return result;
};

/**
 * Creates a URL-friendly slug from a text string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function createSlug(text: string): string {
  if (!text) return '';

  // Transliterate Cyrillic and Uzbek characters
  let slug = transliterate(text);

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Replace spaces and multiple spaces with single dash
  slug = slug.replace(/\s+/g, '-');

  // Remove special characters except dashes
  slug = slug.replace(/[^a-z0-9-]/g, '');

  // Replace multiple dashes with single dash
  slug = slug.replace(/-+/g, '-');

  // Remove leading and trailing dashes
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

