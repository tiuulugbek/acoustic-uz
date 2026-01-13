/**
 * Inquiries Controller
 * 
 * Bu controller inquiries (contact form submissions) bilan bog'liq business logic'ni o'z ichiga oladi.
 */

const inquiriesService = require('../services/inquiries.service');

/**
 * POST /api/inquiries
 * Yangi inquiry yaratish (public endpoint)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createInquiry(req, res, next) {
  try {
    // Request body'dan inquiry ma'lumotlarini olish
    const inquiryData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
      productId: req.body.productId || null,
      source: req.body.source || 'contact', // Form source (contact/product/etc)
    };
    
    // Validation - required field'larni tekshirish
    if (!inquiryData.name || !inquiryData.phone) {
      return res.status(400).json({
        success: false,
        message: 'Name va Phone majburiy maydonlar',
      });
    }
    
    // Email formatini tekshirish (agar email bo'lsa)
    if (inquiryData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inquiryData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Noto\'g\'ri email formati',
        });
      }
    }
    
    // Service'ni chaqirish
    const inquiry = await inquiriesService.createInquiry(inquiryData);
    
    // Success response qaytarish (201 Created)
    res.status(201).json({
      success: true,
      message: 'So\'rovingiz muvaffaqiyatli yuborildi. Tez orada sizga aloqaga chiqamiz.',
      data: {
        id: inquiry.id,
        // Xavfsizlik uchun to'liq ma'lumotlarni qaytarmaymiz
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inquiries
 * Barcha inquiry'larni olish (authenticated endpoint)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllInquiries(req, res, next) {
  try {
    // Query parametrlarni olish
    const {
      status,
      limit,
      offset,
    } = req.query;
    
    // Service'ni chaqirish
    const inquiries = await inquiriesService.getAllInquiries({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    
    // Success response qaytarish
    res.json({
      success: true,
      data: inquiries,
      meta: {
        count: inquiries.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inquiries/:id
 * Bitta inquiry'ni ID bo'yicha olish (authenticated endpoint)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getInquiryById(req, res, next) {
  try {
    const { id } = req.params;
    
    // Service'ni chaqirish
    const inquiry = await inquiriesService.getInquiryById(id);
    
    // Inquiry topilmasa
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry topilmadi',
      });
    }
    
    // Success response qaytarish
    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createInquiry,
  getAllInquiries,
  getInquiryById,
};






