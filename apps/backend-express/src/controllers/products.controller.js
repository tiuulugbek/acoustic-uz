/**
 * Products Controller
 * 
 * Bu controller products bilan bog'liq barcha business logic'ni o'z ichiga oladi.
 * Controller'lar request'larni qabul qiladi, service'larni chaqiradi va response qaytaradi.
 */

const productsService = require('../services/products.service');

/**
 * GET /api/products
 * Barcha product'larni olish
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllProducts(req, res, next) {
  try {
    // Query parametrlarni olish
    const {
      lang = req.lang, // Language middleware'dan kelgan til
      status = 'published', // Default: faqat published product'lar
      categoryId,
      brandId,
      limit,
      offset,
    } = req.query;
    
    // Service'ni chaqirish
    const products = await productsService.getAllProducts({
      lang,
      status,
      categoryId,
      brandId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    
    // Success response qaytarish
    res.json({
      success: true,
      data: products,
      meta: {
        count: products.length,
        lang,
      },
    });
  } catch (error) {
    // Error'ni keyingi middleware'ga yuborish (error middleware handle qiladi)
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Bitta product'ni ID bo'yicha olish
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const { lang = req.lang } = req.query;
    
    // Service'ni chaqirish
    const product = await productsService.getProductById(id, lang);
    
    // Product topilmasa
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product topilmadi',
      });
    }
    
    // Success response qaytarish
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products
 * Yangi product yaratish
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createProduct(req, res, next) {
  try {
    // Request body'dan product ma'lumotlarini olish
    const productData = req.body;
    
    // Service'ni chaqirish
    const product = await productsService.createProduct(productData);
    
    // Success response qaytarish (201 Created)
    res.status(201).json({
      success: true,
      message: 'Product muvaffaqiyatli yaratildi',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id
 * Product'ni yangilash
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Service'ni chaqirish
    const product = await productsService.updateProduct(id, updateData);
    
    // Product topilmasa
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product topilmadi',
      });
    }
    
    // Success response qaytarish
    res.json({
      success: true,
      message: 'Product muvaffaqiyatli yangilandi',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Product'ni o'chirish
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    
    // Service'ni chaqirish
    const deleted = await productsService.deleteProduct(id);
    
    // Product topilmasa
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product topilmadi',
      });
    }
    
    // Success response qaytarish
    res.json({
      success: true,
      message: 'Product muvaffaqiyatli o\'chirildi',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};






