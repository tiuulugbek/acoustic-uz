/**
 * Inquiries Routes
 * 
 * Bu fayl inquiries (contact form submissions) bilan bog'liq API endpoint'larini o'z ichiga oladi:
 * - POST /api/inquiries - Yangi inquiry yaratish (public endpoint)
 * - GET /api/inquiries - Barcha inquiry'larni olish (authenticated endpoint)
 * - GET /api/inquiries/:id - Bitta inquiry'ni olish (authenticated endpoint)
 */

const express = require('express');
const router = express.Router();
const inquiriesController = require('../../controllers/inquiries.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * POST /api/inquiries
 * Yangi inquiry yaratish (public endpoint - har kim to'ldirishi mumkin)
 * Body: name, email, phone, message, productId (optional)
 */
router.post('/', inquiriesController.createInquiry);

/**
 * GET /api/inquiries
 * Barcha inquiry'larni olish (authenticated endpoint - faqat admin)
 * Query parameters:
 * - status: filter by status (new/contacted/converted/archived)
 * - limit: limit results
 * - offset: pagination offset
 */
router.get('/', authMiddleware, inquiriesController.getAllInquiries);

/**
 * GET /api/inquiries/:id
 * Bitta inquiry'ni ID bo'yicha olish (authenticated endpoint - faqat admin)
 */
router.get('/:id', authMiddleware, inquiriesController.getInquiryById);

module.exports = router;






