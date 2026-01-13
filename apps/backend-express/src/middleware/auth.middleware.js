/**
 * Authentication Middleware
 * 
 * Bu middleware JWT token'ni validate qiladi va user'ni authenticate qiladi.
 * Faqat authenticated user'lar protected route'larga kirishlari mumkin.
 * 
 * Token quyidagi usullar bilan yuborilishi mumkin:
 * 1. Authorization header: Bearer <token>
 * 2. Cookie: access_token=<token>
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { prisma } = require('../config/database');

/**
 * Authentication middleware function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function authMiddleware(req, res, next) {
  try {
    // 1. Token'ni Authorization header'dan olish
    let token = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // "Bearer " dan keyingi qismini olish
    }
    
    // 2. Agar header'da bo'lmasa, cookie'dan olish
    if (!token) {
      token = req.cookies?.access_token;
    }
    
    // 3. Token topilmasa, unauthorized error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication kerak. Token topilmadi.',
      });
    }
    
    // 4. Token'ni verify qilish
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Noto\'g\'ri yoki muddati o\'tgan token.',
      });
    }
    
    // 5. User'ni database'dan olish va tekshirish
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User topilmadi yoki faol emas.',
      });
    }
    
    // 6. User ma'lumotlarini request object'ga qo'shish
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      permissions: user.role.permissions,
    };
    
    // Keyingi middleware'ga o'tish
    next();
  } catch (error) {
    console.error('Auth middleware xatolik:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication jarayonida xatolik yuz berdi.',
    });
  }
}

module.exports = authMiddleware;






