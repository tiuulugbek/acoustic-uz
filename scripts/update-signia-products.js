const { PrismaClient } = require('@prisma/client');

// Use DATABASE_URL from environment or default
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

// Form factor detection patterns
const formFactorPatterns = {
  BTE: ['bte', 'behind-the-ear', 'za uxom', 'za ushom', 'ush orqasida', 'rite', 'receiver-in-the-ear', 'receiver in ear', 'ric', 'receiver-in-canal', 'receiver in canal'],
  ITE: ['ite', 'in-the-ear', 'v uxe', 'v ushe', 'ush ichida', 'full shell', 'full shell ite'],
  ITC: ['itc', 'in-the-canal', 'v kanale', 'v kanalda', 'half shell', 'half shell itc'],
  CIC: ['cic', 'completely-in-canal', 'polnostyu v kanale', 'to\'liq kanalda', 'completely in canal', 'deep fit'],
  IIC: ['iic', 'invisible-in-canal', 'nevidimy v kanale', 'ko\'rinmas', 'invisible in canal', 'deep iic'],
  RIC: ['ric', 'receiver-in-canal', 'receiver in canal', 'receiver in ear'],
  RITE: ['rite', 'receiver-in-the-ear', 'receiver in ear', 'receiver behind ear']
};

// Audience patterns
const audiencePatterns = {
  children: ['children', 'kids', 'child', 'bolalar', 'detyam', 'detey', 'pediatric', 'pediatricheskiy', 'pediatriya', 'youth', 'young', 'yosh'],
  adults: ['adults', 'adult', 'vzroslye', 'vzroslym', 'kattalar', 'mature', 'zrelye'],
  elderly: ['elderly', 'seniors', 'senior', 'pensioners', 'pensioner', 'keksalar', 'pensionerlar', 'pozhilye', 'pozhilym']
};

// Smartphone compatibility patterns
const smartphonePatterns = {
  'bluetooth': ['bluetooth', 'bt', 'wireless', 'besprovodnoy', 'wi-fi', 'wifi'],
  'app': ['app', 'application', 'prilozhenie', 'mobilnoe prilozhenie', 'mobile app', 'smartphone app', 'ios', 'android'],
  'streaming': ['streaming', 'audio streaming', 'audio stream', 'stream audio'],
  'phone-calls': ['phone calls', 'calls', 'zvonki', 'telefonnye zvonki', 'hands-free', 'hands free']
};

function detectFormFactor(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  const detected = [];

  for (const [formFactor, patterns] of Object.entries(formFactorPatterns)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        if (!detected.includes(formFactor)) {
          detected.push(formFactor);
        }
      }
    }
  }

  // Check for abbreviations
  if (detected.length === 0) {
    const match = text.match(/\b(bte|rite|ric|ite|itc|cic|iic)\b/);
    if (match) {
      detected.push(match[0].toUpperCase());
    }
  }

  // Signia specific patterns
  if (text.includes('pure') && text.includes('charge&go')) {
    detected.push('RIC');
  }
  if (text.includes('active') && text.includes('pro')) {
    detected.push('RIC');
  }
  if (text.includes('ax') && text.includes('insio')) {
    detected.push('ITE');
  }
  if (text.includes('ax') && text.includes('motion')) {
    detected.push('RIC');
  }

  return detected.length > 0 ? detected : ['BTE']; // Default
}

function detectAudience(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  const detected = [];

  for (const [audience, patterns] of Object.entries(audiencePatterns)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        if (!detected.includes(audience)) {
          detected.push(audience);
        }
      }
    }
  }

  // Signia specific: if no specific audience mentioned, default to adults
  // But check for power levels that might indicate children/elderly
  if (detected.length === 0) {
    if (text.includes('power') || text.includes('super power') || text.includes('ultra power')) {
      detected.push('elderly'); // High power usually for elderly
    } else if (text.includes('mini') || text.includes('small')) {
      detected.push('children'); // Small size might be for children
    } else {
      detected.push('adults'); // Default
    }
  }

  return detected.length > 0 ? detected : ['adults'];
}

function detectSmartphoneCompatibility(name, description = '') {
  const text = `${name} ${description}`.toLowerCase();
  const detected = [];

  for (const [compatibility, patterns] of Object.entries(smartphonePatterns)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        if (!detected.includes(compatibility)) {
          detected.push(compatibility);
        }
      }
    }
  }

  // Signia modern devices usually have bluetooth
  if (detected.length === 0) {
    // Check for modern Signia models (usually have bluetooth)
    if (text.includes('pure') || text.includes('active') || text.includes('ax') || text.includes('motion')) {
      detected.push('bluetooth');
      detected.push('app');
      detected.push('phone-calls');
    }
  } else if (detected.includes('bluetooth') || detected.includes('app')) {
    // If bluetooth or app, add phone-calls
    if (!detected.includes('phone-calls')) {
      detected.push('phone-calls');
    }
  }

  return detected;
}

async function updateSigniaProducts() {
  try {
    console.log('🔍 Signia apparatlarni tahlil qilmoqda...\n');

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

    console.log(`✅ Signia brand topildi: ${signiaBrand.name}\n`);

    // Get all Signia products
    const products = await prisma.product.findMany({
      where: {
        brandId: signiaBrand.id
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

    let updated = 0;
    let skipped = 0;

    // Analyze and update each product
    for (const product of products) {
      const name = `${product.name_uz} ${product.name_ru}`;
      const description = `${product.description_uz || ''} ${product.description_ru || ''}`;

      const detectedFormFactors = detectFormFactor(name, description);
      const detectedAudience = detectAudience(name, description);
      const detectedSmartphone = detectSmartphoneCompatibility(name, description);

      const currentFormFactors = product.formFactors || [];
      const currentAudience = product.audience || [];
      const currentSmartphone = product.smartphoneCompatibility || [];

      const formFactorsChanged = JSON.stringify(currentFormFactors.sort()) !== JSON.stringify(detectedFormFactors.sort());
      const audienceChanged = JSON.stringify(currentAudience.sort()) !== JSON.stringify(detectedAudience.sort());
      const smartphoneChanged = JSON.stringify(currentSmartphone.sort()) !== JSON.stringify(detectedSmartphone.sort());

      if (formFactorsChanged || audienceChanged || smartphoneChanged) {
        console.log(`📱 ${product.name_uz} (ID: ${product.numericId || product.id})`);
        
        if (formFactorsChanged) {
          console.log(`   Form Factors: [${currentFormFactors.join(', ') || 'bo\'sh'}] → [${detectedFormFactors.join(', ')}]`);
        }
        if (audienceChanged) {
          console.log(`   Audience: [${currentAudience.join(', ') || 'bo\'sh'}] → [${detectedAudience.join(', ')}]`);
        }
        if (smartphoneChanged) {
          console.log(`   Smartphone: [${currentSmartphone.join(', ') || 'bo\'sh'}] → [${detectedSmartphone.join(', ') || 'yo\'q'}]`);
        }

        // Update product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            formFactors: { set: detectedFormFactors },
            audience: { set: detectedAudience },
            smartphoneCompatibility: { set: detectedSmartphone }
          }
        });

        console.log(`   ✅ Yangilandi\n`);
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`\n✅ Tahlil yakunlandi!`);
    console.log(`   Jami: ${products.length} ta apparat`);
    console.log(`   Yangilandi: ${updated} ta`);
    console.log(`   O'zgarmadi: ${skipped} ta`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run update
updateSigniaProducts()
  .then(() => {
    console.log('\n🎉 Barcha Signia apparatlar yangilandi!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });
