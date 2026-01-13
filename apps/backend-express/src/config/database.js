/**
 * Database Configuration
 * 
 * Bu fayl Prisma Client'ni configure qiladi va database connection'ni boshqaradi.
 * Prisma ORM ishlatiladi database bilan ishlash uchun.
 */

const { PrismaClient } = require('@prisma/client');
const config = require('./env');

/**
 * Prisma Client instance yaratish
 * Singleton pattern - bir marta yaratiladi va qayta ishlatiladi
 */
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL,
    },
  },
  // Logging - Development'da query'larni ko'rsatish
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Database connection'ni test qilish
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database ga muvaffaqiyatli ulandi');
  } catch (error) {
    console.error('❌ Database ga ulanishda xatolik:', error);
    process.exit(1);
  }
}

/**
 * Database connection'ni yopish
 */
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database connection yopildi');
  } catch (error) {
    console.error('❌ Database connection yopishda xatolik:', error);
  }
}

// Server yopilganda database'ni yopish
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};






