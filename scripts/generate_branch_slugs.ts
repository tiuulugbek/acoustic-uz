import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
 */
function createSlug(text: string): string {
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

async function generateBranchSlugs() {
  try {
    console.log('🔍 Fetching all branches...');
    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name_uz: true,
        name_ru: true,
        slug: true,
      },
    });

    console.log(`📋 Found ${branches.length} branches`);

    let updated = 0;
    let skipped = 0;

    for (const branch of branches) {
      // Skip if slug already exists
      if (branch.slug) {
        console.log(`⏭️  Skipping ${branch.name_uz} - slug already exists: ${branch.slug}`);
        skipped++;
        continue;
      }

      // Generate slug from name_uz
      const newSlug = createSlug(branch.name_uz);
      
      if (!newSlug) {
        console.log(`⚠️  Could not generate slug for ${branch.name_uz}`);
        skipped++;
        continue;
      }

      // Check if slug already exists
      const existingBranch = await prisma.branch.findFirst({
        where: {
          slug: newSlug,
          id: { not: branch.id },
        },
      });

      let finalSlug = newSlug;
      if (existingBranch) {
        // If slug exists, append branch ID
        finalSlug = `${newSlug}-${branch.id.slice(-6)}`;
        console.log(`⚠️  Slug ${newSlug} already exists, using ${finalSlug}`);
      }

      // Update branch with new slug
      await prisma.branch.update({
        where: { id: branch.id },
        data: { slug: finalSlug },
      });

      console.log(`✅ Updated ${branch.name_uz}: ${branch.slug || 'null'} → ${finalSlug}`);
      updated++;
    }

    console.log(`\n✨ Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${branches.length}`);
  } catch (error) {
    console.error('❌ Error generating branch slugs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateBranchSlugs()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });


