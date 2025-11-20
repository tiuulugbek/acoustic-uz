import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create slug from text
function createSlug(text: string): string {
  if (!text) return '';

  // Transliterate Cyrillic and Uzbek characters
  const cyrillicMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };

  const uzbekMap: Record<string, string> = {
    'ў': 'o\'', 'ғ': 'g\'', 'ҳ': 'h', 'қ': 'q',
    'Ў': 'O\'', 'Ғ': 'G\'', 'Ҳ': 'H', 'Қ': 'Q',
  };

  let slug = text;
  
  // Transliterate Cyrillic
  for (const [cyr, lat] of Object.entries(cyrillicMap)) {
    slug = slug.replace(new RegExp(cyr, 'g'), lat);
  }
  
  // Transliterate Uzbek
  for (const [uzb, lat] of Object.entries(uzbekMap)) {
    slug = slug.replace(new RegExp(uzb, 'g'), lat);
  }
  
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

async function addSlugsToBranches() {
  console.log('🔄 Fetching all branches...');
  const branches = await prisma.branch.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' },
      ],
    },
  });

  console.log(`📋 Found ${branches.length} branches without slugs`);

  for (const branch of branches) {
    // Generate slug from name_uz
    const slug = createSlug(branch.name_uz);
    
    if (!slug) {
      console.warn(`⚠️  Could not generate slug for branch: ${branch.name_uz} (ID: ${branch.id})`);
      continue;
    }

    // Check if slug already exists
    const existingBranch = await prisma.branch.findFirst({
      where: {
        slug: slug,
        id: { not: branch.id },
      },
    });

    let finalSlug = slug;
    if (existingBranch) {
      // If slug exists, append branch ID to make it unique
      finalSlug = `${slug}-${branch.id.slice(-6)}`;
      console.log(`⚠️  Slug "${slug}" already exists, using "${finalSlug}" for branch: ${branch.name_uz}`);
    }

    try {
      await prisma.branch.update({
        where: { id: branch.id },
        data: { slug: finalSlug },
      });
      console.log(`✅ Added slug "${finalSlug}" to branch: ${branch.name_uz}`);
    } catch (error) {
      console.error(`❌ Error updating branch ${branch.id}:`, error);
    }
  }

  console.log('✨ Done!');
}

addSlugsToBranches()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

