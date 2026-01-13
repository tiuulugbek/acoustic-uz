/**
 * Products Routes
 * 
 * Bu fayl products bilan bog'liq barcha API endpoint'larini o'z ichiga oladi:
 * - GET /api/products - Barcha product'larni olish (multilingual)
 * - GET /api/products/:id - Bitta product'ni olish (multilingual)
 * - POST /api/products - Yangi product yaratish (authenticated)
 * - PUT /api/products/:id - Product'ni yangilash (authenticated)
 * - DELETE /api/products/:id - Product'ni o'chirish (authenticated)
 */

const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/products.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * GET /api/products
 * Barcha product'larni olish (public endpoint)
 * Query parameters:
 * - lang: til kodi (uz/ru/en) - default: req.lang
 * - status: filter by status (published/draft) - default: published
 * - categoryId: filter by category
 * - brandId: filter by brand
 * - limit: limit results
 * - offset: pagination offset
 */
router.get('/', productsController.getAllProducts);

/**
 * GET /api/products/:id
 * Bitta product'ni ID bo'yicha olish (public endpoint)
 * Query parameters:
 * - lang: til kodi (uz/ru/en) - default: req.lang
 */
router.get('/:id', productsController.getProductById);

/**
 * POST /api/products
 * Yangi product yaratish (authenticated endpoint)
 * Body: Product ma'lumotlari (name_uz, name_ru, description_uz, etc.)
 */
router.post('/', authMiddleware, productsController.createProduct);

/**
 * PUT /api/products/:id
 * Product'ni yangilash (authenticated endpoint)
 * Body: Yangilanish kerak bo'lgan field'lar
 */
router.put('/:id', authMiddleware, productsController.updateProduct);

/**
 * DELETE /api/products/:id
 * Product'ni o'chirish (authenticated endpoint)
 */
router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;






