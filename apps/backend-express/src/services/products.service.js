/**
 * Products Service
 * 
 * Bu service products bilan bog'liq barcha database operatsiyalarini bajaradi.
 * Service layer - business logic va data access logic'ni ajratadi.
 */

const { prisma } = require('../config/database');

/**
 * Barcha product'larni olish (multilingual support bilan)
 * 
 * @param {Object} filters - Filter parametrlari
 * @param {string} filters.lang - Til kodi (uz/ru/en)
 * @param {string} filters.status - Status filter (published/draft)
 * @param {string} filters.categoryId - Category ID filter
 * @param {string} filters.brandId - Brand ID filter
 * @param {number} filters.limit - Limit results
 * @param {number} filters.offset - Pagination offset
 * @returns {Promise<Array>} Products array
 */
async function getAllProducts(filters = {}) {
  const {
    lang = 'uz',
    status = 'published',
    categoryId,
    brandId,
    limit,
    offset,
  } = filters;
  
  // Where clause yaratish
  const where = {};
  
  // Status filter
  if (status) {
    where.status = status;
  }
  
  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  // Brand filter
  if (brandId) {
    where.brandId = brandId;
  }
  
  // Database'dan product'larni olish
  const products = await prisma.product.findMany({
    where,
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      category: {
        select: {
          id: true,
          name_uz: true,
          name_ru: true,
          slug: true,
        },
      },
    },
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  // Product'larni multilingual formatga o'tkazish
  // Har bir product'da faqat kerakli til ma'lumotlarini qaytarish
  return products.map(product => formatProductForLanguage(product, lang));
}

/**
 * Bitta product'ni ID bo'yicha olish (multilingual support bilan)
 * 
 * @param {string} id - Product ID
 * @param {string} lang - Til kodi (uz/ru/en)
 * @returns {Promise<Object|null>} Product object yoki null
 */
async function getProductById(id, lang = 'uz') {
  // Database'dan product'ni olish
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      category: {
        select: {
          id: true,
          name_uz: true,
          name_ru: true,
          slug: true,
        },
      },
    },
  });
  
  // Product topilmasa
  if (!product) {
    return null;
  }
  
  // Product'ni multilingual formatga o'tkazish
  return formatProductForLanguage(product, lang);
}

/**
 * Yangi product yaratish
 * 
 * @param {Object} productData - Product ma'lumotlari
 * @returns {Promise<Object>} Yaratilgan product
 */
async function createProduct(productData) {
  // Slug yaratish (agar berilmagan bo'lsa)
  if (!productData.slug && productData.name_uz) {
    productData.slug = generateSlug(productData.name_uz);
  }
  
  // Slug unique ekanligini tekshirish
  const existingProduct = await prisma.product.findUnique({
    where: { slug: productData.slug },
  });
  
  if (existingProduct) {
    // Agar slug allaqachon mavjud bo'lsa, unga raqam qo'shish
    productData.slug = `${productData.slug}-${Date.now()}`;
  }
  
  // Database'ga product yaratish
  const product = await prisma.product.create({
    data: productData,
    include: {
      brand: true,
      category: true,
    },
  });
  
  return product;
}

/**
 * Product'ni yangilash
 * 
 * @param {string} id - Product ID
 * @param {Object} updateData - Yangilanish kerak bo'lgan field'lar
 * @returns {Promise<Object|null>} Yangilangan product yoki null
 */
async function updateProduct(id, updateData) {
  // Slug yangilansa, unique ekanligini tekshirish
  if (updateData.slug) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug: updateData.slug,
        NOT: { id },
      },
    });
    
    if (existingProduct) {
      throw new Error('Bu slug allaqachon ishlatilgan');
    }
  }
  
  // Database'da product'ni yangilash
  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      brand: true,
      category: true,
    },
  });
  
  return product;
}

/**
 * Product'ni o'chirish
 * 
 * @param {string} id - Product ID
 * @returns {Promise<boolean>} O'chirildi yoki yo'q
 */
async function deleteProduct(id) {
  try {
    // Database'dan product'ni o'chirish
    await prisma.product.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    // Product topilmasa
    if (error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}

/**
 * Product'ni multilingual formatga o'tkazish
 * Til bo'yicha faqat kerakli field'larni qaytaradi
 * 
 * @param {Object} product - Product object
 * @param {string} lang - Til kodi (uz/ru/en)
 * @returns {Object} Formatted product
 */
function formatProductForLanguage(product, lang) {
  // Base product ma'lumotlari
  const formatted = {
    id: product.id,
    slug: product.slug,
    status: product.status,
    price: product.price,
    stock: product.stock,
    productType: product.productType,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
  
  // Til bo'yicha name va description'ni qo'shish
  if (lang === 'uz') {
    formatted.name = product.name_uz;
    formatted.description = product.description_uz;
    formatted.intro = product.intro_uz;
    formatted.features = product.features_uz || [];
    formatted.benefits = product.benefits_uz || [];
    formatted.tech = product.tech_uz;
    formatted.fittingRange = product.fittingRange_uz;
    formatted.regulatoryNote = product.regulatoryNote_uz;
  } else if (lang === 'ru') {
    formatted.name = product.name_ru;
    formatted.description = product.description_ru;
    formatted.intro = product.intro_ru;
    formatted.features = product.features_ru || [];
    formatted.benefits = product.benefits_ru || [];
    formatted.tech = product.tech_ru;
    formatted.fittingRange = product.fittingRange_ru;
    formatted.regulatoryNote = product.regulatoryNote_ru;
  } else {
    // English uchun default Uzbek yoki Russian
    formatted.name = product.name_uz || product.name_ru;
    formatted.description = product.description_uz || product.description_ru;
    formatted.intro = product.intro_uz || product.intro_ru;
    formatted.features = product.features_uz || product.features_ru || [];
    formatted.benefits = product.benefits_uz || product.benefits_ru || [];
    formatted.tech = product.tech_uz || product.tech_ru;
    formatted.fittingRange = product.fittingRange_uz || product.fittingRange_ru;
    formatted.regulatoryNote = product.regulatoryNote_uz || product.regulatoryNote_ru;
  }
  
  // Brand va Category ma'lumotlarini qo'shish
  if (product.brand) {
    formatted.brand = product.brand;
  }
  
  if (product.category) {
    formatted.category = {
      id: product.category.id,
      slug: product.category.slug,
      name: lang === 'uz' ? product.category.name_uz : product.category.name_ru,
    };
  }
  
  // Gallery va thumbnail
  formatted.galleryIds = product.galleryIds || [];
  formatted.thumbnailId = product.thumbnailId;
  
  return formatted;
}

/**
 * Slug yaratish (Uzbek/Russian text'dan)
 * 
 * @param {string} text - Text
 * @returns {string} Slug
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Maxsus belgilarni olib tashlash
    .replace(/[\s_-]+/g, '-') // Bo'shliqlarni tire bilan almashtirish
    .replace(/^-+|-+$/g, ''); // Bosh va oxiridagi tire'larni olib tashlash
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};






