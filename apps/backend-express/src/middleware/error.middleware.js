/**
 * Error Handling Middleware
 * 
 * Bu middleware barcha xatolarni catch qiladi va user-friendly response qaytaradi.
 * Express'da error middleware 4 ta parametrga ega bo'lishi kerak (err, req, res, next).
 */

/**
 * Error handling middleware function
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorMiddleware(err, req, res, next) {
  // Log error - Production'da faqat error, development'da full stack trace
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }
  
  // Prisma error'larni handle qilish
  if (err.code === 'P2002') {
    // Unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'Bu ma\'lumot allaqachon mavjud.',
      error: 'DUPLICATE_ENTRY',
    });
  }
  
  if (err.code === 'P2025') {
    // Record not found
    return res.status(404).json({
      success: false,
      message: 'Ma\'lumot topilmadi.',
      error: 'NOT_FOUND',
    });
  }
  
  // Validation error - zod yoki boshqa validation library'dan
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation xatolik',
      errors: err.errors || err.issues,
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Noto\'g\'ri token.',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token muddati o\'tgan.',
    });
  }
  
  // Custom error - agar error object'da status va message bo'lsa
  if (err.status && err.message) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
  
  // Default error - boshqa barcha xatolar uchun
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server xatolik yuz berdi.',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.toString(),
    }),
  });
}

module.exports = errorMiddleware;






