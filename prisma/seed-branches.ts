import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to format phone number
function formatPhone(tel: string): string {
  // Remove all non-digit characters
  const digits = tel.replace(/\D/g, '');
  // If starts with 998, add +, otherwise add +998
  if (digits.startsWith('998')) {
    return `+${digits}`;
  } else if (digits.length === 9) {
    return `+998${digits}`;
  } else {
    return `+998${digits}`;
  }
}

// Helper function to generate Google Maps iframe from coordinates
function generateMapIframe(lat: number, lng: number, name: string): string {
  return `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.floor(lat)}!4d${lng}!5e0!3m2!1suz!2suz!4v1234567890" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

const FILIALLAR = {
  "chilonzor": {
    "nomi": "Acoustic - Chilonzor filiali",
    "kenglik": 41.297306266331134,
    "uzunlik": 69.20506945414891,
    "tel": "712884444",
    "manzil": "Toshkent sh, Chilonzor 7-45-3"
  },
  "yunusobod": {
    "nomi": "Acoustic - Yunusobod filiali",
    "kenglik": 41.36200701177543,
    "uzunlik": 69.28818898298819,
    "tel": "945904114",
    "manzil": "Toshkent shahar, Yunusobod 2-mavze 6-uy. Mo'ljal Asaka Bank. The Elements mehmonxona ro'parasida"
  },
  "yakkasaroy": {
    "nomi": "Acoustic - Yakkasaroy filiali",
    "kenglik": 41.29482805319527,
    "uzunlik": 69.2537342099695,
    "tel": "712156850",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "toshmi": {
    "nomi": "Acoustic - Toshmi filiali",
    "kenglik": 41.34892415113293,
    "uzunlik": 69.17652213409222,
    "tel": "998804114",
    "manzil": "Toshkent shahar, Shayhontoxur tumani, Farobiy 35. Mo'ljal Safia Bakery to'g'risida"
  },
  "sergeli": {
    "nomi": "Acoustic - Sergeli filiali",
    "kenglik": 41.219489304004405,
    "uzunlik": 69.22274179647307,
    "tel": "903224114",
    "manzil": "Toshkent sh, Sergeli tumani, Sergeli 8 mavzesi, shokirariq ko'chasi, Mo'ljal: Baxt uyi to'yxona orqasida"
  },
  "qoyliq": {
    "nomi": "Acoustic - Qo'yliq filiali",
    "kenglik": 41.241842586370325,
    "uzunlik": 69.33474558113085,
    "tel": "903934114",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "sebzor": {
    "nomi": "Acoustic - Sebzor filiali",
    "kenglik": 41.3384931847745,
    "uzunlik": 69.25241099169301,
    "tel": "771514114",
    "manzil": "Toshkent shahar, Olmazor tumani, Sebzor 35V"
  },
  "guliston": {
    "nomi": "Acoustic - Guliston filiali",
    "kenglik": 40.50459092587306,
    "uzunlik": 68.7707139810919,
    "tel": "903324114",
    "manzil": "Sirdaryo viloyat, Guliston shahar, Birlashgan ko\`chasi, 6B-uy. Mo\`ljal: Suzish havzasi orqasida"
  },
  "samarqand": {
    "nomi": "Acoustic - Samarqand filiali",
    "kenglik": 39.66356652899635,
    "uzunlik": 66.93702432979721,
    "tel": "994474114",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "navoiy": {
    "nomi": "Acoustic - Navoiy filiali",
    "kenglik": 40.0904468842983,
    "uzunlik": 65.37393329641368,
    "tel": "937664114",
    "manzil": "Navoiy shahar Zarafshon MFY Lev Tolstoy ko'chasi 1/30-31 uy."
  },
  "buxoro": {
    "nomi": "Acoustic - Buxoro filiali",
    "kenglik": 39.75176019168013,
    "uzunlik": 64.43596539454518,
    "tel": "935130049",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "qarshi": {
    "nomi": "Acoustic - Qarshi filiali",
    "kenglik": 38.87481581351129,
    "uzunlik": 65.80650890984371,
    "tel": "908744114",
    "manzil": "Qarshi shahar, Chaqar MFY, Islom Karimov Ko'chasi, 353-uy. Mo'ljal: Eski shahar 4- maktab yonida"
  },
  "shahrisabz": {
    "nomi": "Acoustic - Shahrisabz filiali",
    "kenglik": 39.05949178901263,
    "uzunlik": 66.84198368286825,
    "tel": "998040605",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "termiz": {
    "nomi": "Acoustic - Termiz filiali",
    "kenglik": 37.22774555440551,
    "uzunlik": 67.27256185209002,
    "tel": "909794114",
    "manzil": "Surxondaryo viloyati. Termiz shahar, Taraqqiyot ko'chasi. 36 A. Mo'ljal: Viloyat prokuraturasi yonida."
  },
  "urganch": {
    "nomi": "Acoustic - Urganch filiali",
    "kenglik": 41.56322416092417,
    "uzunlik": 60.625337067655515,
    "tel": "902224114",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "nukus": {
    "nomi": "Acoustic - Nukus filiali",
    "kenglik": 42.466655629545826,
    "uzunlik": 59.61873943886847,
    "tel": "907094114",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "andijon": {
    "nomi": "Acoustic - Andijon filiali",
    "kenglik": 40.77613236348919,
    "uzunlik": 72.3559091811062,
    "tel": "994204114",
    "manzil": "Andijon shahar, Alisher Navoiy shox ko'chasi 86/88-uy"
  },
  "fargona": {
    "nomi": "Acoustic - Farg'ona filiali",
    "kenglik": 40.38304233120668,
    "uzunlik": 71.78483432341388,
    "tel": "911614114",
    "manzil": "Aniqlik kiritilmoqda"
  },
  "namangan": {
    "nomi": "Acoustic - Namangan filiali",
    "kenglik": 40.99393111918123,
    "uzunlik": 71.67986242344605,
    "tel": "932084114",
    "manzil": "Namangan shahar, Boburshox ko'chasi,  16/4. Mo'ljal 11-maktab ro'pparasida."
  },
  "qoqon": {
    "nomi": "Acoustic - Qo'qon filiali",
    "kenglik": 40.53595158781408,
    "uzunlik": 70.95132830992938,
    "tel": "916795334",
    "manzil": "Qo'qon shahar, Yangi Chorsu 219-uy."
  },
  "jizzax": {
    "nomi": "Acoustic - Jizzax filiali",
    "kenglik": 40.12635503885972,
    "uzunlik": 67.82918768107209,
    "tel": "933654114",
    "manzil": "Jizzax shahar, Toshloq MFY, Shifokorlar ko'chasi, 8A uy"
  }
};

// Helper function to translate city names
function getCityNameUz(key: string): string {
  const cityMap: Record<string, string> = {
    'chilonzor': 'Chilonzor',
    'yunusobod': 'Yunusobod',
    'yakkasaroy': 'Yakkasaroy',
    'toshmi': 'Toshmi',
    'sergeli': 'Sergeli',
    'qoyliq': 'Qo\'yliq',
    'sebzor': 'Sebzor',
    'guliston': 'Guliston',
    'samarqand': 'Samarqand',
    'navoiy': 'Navoiy',
    'buxoro': 'Buxoro',
    'qarshi': 'Qarshi',
    'shahrisabz': 'Shahrisabz',
    'termiz': 'Termiz',
    'urganch': 'Urganch',
    'nukus': 'Nukus',
    'andijon': 'Andijon',
    'fargona': 'Farg\'ona',
    'namangan': 'Namangan',
    'qoqon': 'Qo\'qon',
    'jizzax': 'Jizzax',
  };
  return cityMap[key] || key;
}

function getCityNameRu(key: string): string {
  const cityMap: Record<string, string> = {
    'chilonzor': 'Чилонзор',
    'yunusobod': 'Юнусабад',
    'yakkasaroy': 'Яккасарай',
    'toshmi': 'Тошми',
    'sergeli': 'Сергели',
    'qoyliq': 'Койлык',
    'sebzor': 'Себзор',
    'guliston': 'Гулистан',
    'samarqand': 'Самарканд',
    'navoiy': 'Навои',
    'buxoro': 'Бухара',
    'qarshi': 'Карши',
    'shahrisabz': 'Шахрисабз',
    'termiz': 'Термез',
    'urganch': 'Ургенч',
    'nukus': 'Нукус',
    'andijon': 'Андижан',
    'fargona': 'Фергана',
    'namangan': 'Наманган',
    'qoqon': 'Коканд',
    'jizzax': 'Джизак',
  };
  return cityMap[key] || key;
}

async function main() {
  console.log('🌱 Seeding branches with real data...');

  // Clear existing branches
  await prisma.branch.deleteMany();
  console.log('🗑️  Cleared existing branches');

  let order = 1;

  for (const [key, data] of Object.entries(FILIALLAR)) {
    const cityNameUz = getCityNameUz(key);
    const cityNameRu = getCityNameRu(key);
    
    // Extract city name from branch name for address
    const addressUz = data.manzil === 'Aniqlik kiritilmoqda' 
      ? `${cityNameUz} tumani, manzil aniqlashtirilmoqda`
      : data.manzil;
    
    const addressRu = data.manzil === 'Aniqlik kiritilmoqda'
      ? `${cityNameRu} район, адрес уточняется`
      : data.manzil
          .replace('Toshkent sh', 'г. Ташкент')
          .replace('Toshkent shahar', 'г. Ташкент')
          .replace('Chilonzor', 'Чилонзорский район')
          .replace('Yunusobod', 'Юнусабадский район')
          .replace('Yakkasaroy', 'Яккасарайский район')
          .replace('Shayhontoxur tumani', 'Шайхантахурский район')
          .replace('Sergeli tumani', 'Сергелийский район')
          .replace('Olmazor tumani', 'Олмазорский район')
          .replace('Sirdaryo viloyat', 'Сырдарьинская область')
          .replace('Guliston shahar', 'г. Гулистан')
          .replace('Samarqand', 'Самарканд')
          .replace('Navoiy shahar', 'г. Навои')
          .replace('Buxoro', 'Бухара')
          .replace('Qarshi shahar', 'г. Карши')
          .replace('Shahrisabz', 'Шахрисабз')
          .replace('Surxondaryo viloyati', 'Сурхандарьинская область')
          .replace('Termiz shahar', 'г. Термез')
          .replace('Urganch', 'Ургенч')
          .replace('Nukus', 'Нукус')
          .replace('Andijon shahar', 'г. Андижан')
          .replace('Farg\'ona', 'Фергана')
          .replace('Namangan shahar', 'г. Наманган')
          .replace('Qo\'qon shahar', 'г. Коканд')
          .replace('Jizzax shahar', 'г. Джизак');

    const branch = {
      name_uz: data.nomi,
      name_ru: data.nomi.replace('Acoustic -', 'Acoustic —').replace('filiali', 'филиал'),
      address_uz: addressUz,
      address_ru: addressRu,
      phone: formatPhone(data.tel),
      phones: [],
      latitude: data.kenglik,
      longitude: data.uzunlik,
      order: order++,
      map_iframe: generateMapIframe(data.kenglik, data.uzunlik, data.nomi),
    };

    await prisma.branch.create({
      data: branch,
    });

    console.log(`✅ Created branch: ${branch.name_uz}`);
  }

  console.log('✨ Branches seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding branches:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
