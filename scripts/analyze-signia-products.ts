import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Form factor patterns
const formFactorPatterns = {
  BTE: [
    'bte', 'behind-the-ear', 'za uxom', 'za ushom', 'ush orqasida',
    'rite', 'receiver-in-the-ear', 'receiver in ear',
    'ric', 'receiver-in-canal', 'receiver in canal',
    'bte-iic', 'bte-iic power', 'bte power'
  ],
  ITE: [
    'ite', 'in-the-ear', 'v uxe', 'v ushe', 'ush ichida',
    'full shell', 'full shell ite', 'full shell itc'
  ],
  ITC: [
    'itc', 'in-the-canal', 'v kanale', 'v kanalda',
    'half shell', 'half shell itc'
  ],
  CIC: [
    'cic', 'completely-in-canal', 'polnostyu v kanale', 'to\'liq kanalda',
    'completely in canal', 'deep fit', 'deep fit cic'
  ],
  IIC: [
    'iic', 'invisible-in-canal', 'nevidimy v kanale', 'ko\'rinmas',
    'invisible in canal', 'deep iic', 'deep fit iic'
  ],
  RIC: [
    'ric', 'receiver-in-canal', 'receiver in canal',
    'receiver in ear', 'rite', 'receiver-in-the-ear'
  ],
  RITE: [
    'rite', 'receiver-in-the-ear', 'receiver in ear',
    'receiver behind ear', 'receiver za uxom'
  ]
};

// Audience patterns
const audiencePatterns = {
  children: [
    'children', 'kids', 'child', 'bolalar', 'detyam', 'detey',
    'pediatric', 'pediatricheskiy', 'pediatriya',
    'youth', 'young', 'yosh', 'molodye'
  ],
  adults: [
    'adults', 'adult', 'vzroslye', 'vzroslym', 'kattalar',
    'mature', 'zrelye', 'zrelaya'
  ],
  elderly: [
    'elderly', 'seniors', 'senior', 'pensioners', 'pensioner',
    'keksalar', 'pensionerlar', 'pozhilye', 'pozhilym',
    'mature adults', 'zrelye vzroslye'
  ]
};

// Smartphone compatibility patterns
const smartphonePatterns = {
  'bluetooth': [
    'bluetooth', 'bt', 'wireless', 'besprovodnoy',
    'wi-fi', 'wifi', 'wireless connection'
  ],
  'app': [
    'app', 'application', 'prilozhenie', 'mobilnoe prilozhenie',
    'mobile app', 'smartphone app', 'ios', 'android'
  ],
  'streaming': [
    'streaming', 'audio streaming', 'audio stream',
    'stream audio', 'audio transmission'
  ],
  'phone-calls': [
    'phone calls', 'calls', 'zvonki', 'telefonnye zvonki',
    'hands-free', 'hands free', 'hands-free calls'
  ]
};

function detectFormFactor(name: string, description: string = ''): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const detected: string[] = [];

  for (const [formFactor, patterns] of Object.entries(formFactorPatterns)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        if (!detected.includes(formFactor)) {
          detected.push(formFactor);
        }
      }
    }
  }

  // If no form factor detected, try to infer from name
  if (detected.length === 0) {
    // Check for common abbreviations
    if (text.match(/\b(bte|rite|ric|ite|itc|cic|iic)\b/)) {
      const match = text.match(/\b(bte|rite|ric|ite|itc|cic|iic)\b/);
      if (match) {
        detected.push(match[0].toUpperCase());
      }
    }
  }

  return detected.length > 0 ? detected : ['BTE']; // Default to BTE if not detected
}

function detectAudience(name: string, description: string = ''): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const detected: string[] = [];

  for (const [audience, patterns] of Object.entries(audiencePatterns)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        if (!detected.includes(audience)) {
          detected.push(audience);
        }
      }
    }
  }

  // Default to adults if not detected
  return detected.length > 0 ? detected : ['adults'];
}

function detectSmartphoneCompatibility(name: string, description: string = ''): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const detected: string[] = [];

  for (const [compatibility, patterns] of Object.entries(smartphonePatterns)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        if (!detected.includes(compatibility)) {
          detected.push(compatibility);
        }
      }
    }
  }

  // If bluetooth or app mentioned, add phone-calls
  if (detected.includes('bluetooth') || detected.includes('app')) {
    if (!detected.includes('phone-calls')) {
      detected.push('phone-calls');
    }
  }

  return detected;
}

async function analyzeAndUpdateSigniaProducts() {
  try {
    // Find Signia brand
    const signiaBrand = await prisma.brand.findFirst({
      where: {
        name: {
          contains: 'Signia',
          mode: 'insensitive'
        }
      }
    });

    if (!signiaBrand) {
      console.error('❌ Signia brand topilmadi!');
      return;
    }

    console.log(`✅ Signia brand topildi: ${signiaBrand.name} (ID: ${signiaBrand.id})`);
    console.log('');

    // Get all Signia products
    const products = await prisma.product.findMany({
      where: {
        brandId: signiaBrand.id
      },
      select: {
        id: true,
        numericId: true,
        name_uz: true,
        name_ru: true,
        slug: true,
        description_uz: true,
        description_ru: true,
        formFactors: true,
        audience: true,
        smartphoneCompatibility: true,
        productType: true,
        signalProcessing: true,
        powerLevel: true,
        hearingLossLevels: true,
        tinnitusSupport: true,
        availabilityStatus: true
      },
      orderBy: {
        name_uz: 'asc'
      }
    });

    console.log(`📊 Jami ${products.length} ta Signia apparat topildi\n`);

    if (products.length === 0) {
      console.log('⚠️  Signia apparatlar topilmadi!');
      return;
    }

    // Analyze and prepare updates
    const updates: Array<{
      id: string;
      numericId: bigint | null;
      name: string;
      formFactors: string[];
      audience: string[];
      smartphoneCompatibility: string[];
      changes: string[];
    }> = [];

    for (const product of products) {
      const name = `${product.name_uz} ${product.name_ru}`;
      const description = `${product.description_uz || ''} ${product.description_ru || ''}`;

      const detectedFormFactors = detectFormFactor(name, description);
      const detectedAudience = detectAudience(name, description);
      const detectedSmartphone = detectSmartphoneCompatibility(name, description);

      const changes: string[] = [];

      // Check if formFactors need update
      const currentFormFactors = product.formFactors || [];
      const formFactorsChanged = JSON.stringify(currentFormFactors.sort()) !== JSON.stringify(detectedFormFactors.sort());
      if (formFactorsChanged) {
        changes.push(`formFactors: [${currentFormFactors.join(', ') || 'bo\'sh'}] → [${detectedFormFactors.join(', ')}]`);
      }

      // Check if audience needs update
      const currentAudience = product.audience || [];
      const audienceChanged = JSON.stringify(currentAudience.sort()) !== JSON.stringify(detectedAudience.sort());
      if (audienceChanged) {
        changes.push(`audience: [${currentAudience.join(', ') || 'bo\'sh'}] → [${detectedAudience.join(', ')}]`);
      }

      // Check if smartphoneCompatibility needs update
      const currentSmartphone = product.smartphoneCompatibility || [];
      const smartphoneChanged = JSON.stringify(currentSmartphone.sort()) !== JSON.stringify(detectedSmartphone.sort());
      if (smartphoneChanged) {
        changes.push(`smartphoneCompatibility: [${currentSmartphone.join(', ') || 'bo\'sh'}] → [${detectedSmartphone.join(', ')}]`);
      }

      if (changes.length > 0) {
        updates.push({
          id: product.id,
          numericId: product.numericId,
          name: product.name_uz,
          formFactors: detectedFormFactors,
          audience: detectedAudience,
          smartphoneCompatibility: detectedSmartphone,
          changes
        });
      }
    }

    console.log(`📋 ${updates.length} ta apparat yangilanish kerak:\n`);

    // Display analysis results
    for (const update of updates) {
      console.log(`📱 ${update.name} (ID: ${update.numericId || update.id})`);
      console.log(`   Form Factors: ${update.formFactors.join(', ')}`);
      console.log(`   Audience: ${update.audience.join(', ')}`);
      console.log(`   Smartphone: ${update.smartphoneCompatibility.join(', ') || 'yo\'q'}`);
      console.log(`   O'zgarishlar:`);
      update.changes.forEach(change => console.log(`     - ${change}`));
      console.log('');
    }

    // Ask for confirmation
    console.log(`\n⚠️  ${updates.length} ta apparat yangilanishi kerak.`);
    console.log('Davom etish uchun script'ni yangilash va update qilish kerak.');

    return {
      total: products.length,
      needsUpdate: updates.length,
      updates
    };

  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run analysis
analyzeAndUpdateSigniaProducts()
  .then((result) => {
    if (result) {
      console.log('\n✅ Tahlil yakunlandi!');
      console.log(`   Jami: ${result.total} ta apparat`);
      console.log(`   Yangilanish kerak: ${result.needsUpdate} ta`);
    }
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });
