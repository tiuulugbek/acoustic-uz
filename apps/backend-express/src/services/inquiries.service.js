/**
 * Inquiries Service
 * 
 * Bu service inquiries (contact form submissions) bilan bog'liq database operatsiyalarini bajaradi.
 */

const { prisma } = require('../config/database');

/**
 * Yangi inquiry yaratish
 * 
 * @param {Object} inquiryData - Inquiry ma'lumotlari
 * @param {string} inquiryData.name - Ism
 * @param {string} inquiryData.email - Email (optional)
 * @param {string} inquiryData.phone - Telefon
 * @param {string} inquiryData.message - Xabar (optional)
 * @param {string} inquiryData.productId - Product ID (optional)
 * @param {string} inquiryData.source - Form source (contact/product/etc)
 * @returns {Promise<Object>} Yaratilgan inquiry
 */
async function createInquiry(inquiryData) {
  // Database'ga inquiry yaratish
  const inquiry = await prisma.lead.create({
    data: {
      name: inquiryData.name,
      email: inquiryData.email || null,
      phone: inquiryData.phone,
      message: inquiryData.message || null,
      productId: inquiryData.productId || null,
      source: inquiryData.source || 'contact',
      status: 'new', // Default status
    },
  });
  
  // Bu yerda email notification yuborish mumkin
  // await sendEmailNotification(inquiry);
  
  return inquiry;
}

/**
 * Barcha inquiry'larni olish
 * 
 * @param {Object} filters - Filter parametrlari
 * @param {string} filters.status - Status filter (new/contacted/converted/archived)
 * @param {number} filters.limit - Limit results
 * @param {number} filters.offset - Pagination offset
 * @returns {Promise<Array>} Inquiries array
 */
async function getAllInquiries(filters = {}) {
  const {
    status,
    limit,
    offset,
  } = filters;
  
  // Where clause yaratish
  const where = {};
  
  // Status filter
  if (status) {
    where.status = status;
  }
  
  // Database'dan inquiry'larni olish
  const inquiries = await prisma.lead.findMany({
    where,
    include: {
      // Agar productId bo'lsa, product ma'lumotlarini ham olish
      // Prisma schema'da Lead model'da productId bor, lekin relation yo'q
      // Shuning uchun alohida query qilish kerak bo'lishi mumkin
    },
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc', // Eng yangi inquiry'lar birinchi
    },
  });
  
  // Agar productId bo'lsa, product ma'lumotlarini qo'shish
  const inquiriesWithProducts = await Promise.all(
    inquiries.map(async (inquiry) => {
      if (inquiry.productId) {
        const product = await prisma.product.findUnique({
          where: { id: inquiry.productId },
          select: {
            id: true,
            name_uz: true,
            name_ru: true,
            slug: true,
          },
        });
        return {
          ...inquiry,
          product,
        };
      }
      return inquiry;
    })
  );
  
  return inquiriesWithProducts;
}

/**
 * Bitta inquiry'ni ID bo'yicha olish
 * 
 * @param {string} id - Inquiry ID
 * @returns {Promise<Object|null>} Inquiry object yoki null
 */
async function getInquiryById(id) {
  // Database'dan inquiry'ni olish
  const inquiry = await prisma.lead.findUnique({
    where: { id },
  });
  
  // Agar productId bo'lsa, product ma'lumotlarini qo'shish
  if (inquiry && inquiry.productId) {
    const product = await prisma.product.findUnique({
      where: { id: inquiry.productId },
      select: {
        id: true,
        name_uz: true,
        name_ru: true,
        slug: true,
      },
    });
    return {
      ...inquiry,
      product,
    };
  }
  
  return inquiry;
}

module.exports = {
  createInquiry,
  getAllInquiries,
  getInquiryById,
};






