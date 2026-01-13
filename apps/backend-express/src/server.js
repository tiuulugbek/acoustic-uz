/**
 * Express Server Entry Point
 * 
 * Bu fayl Express serverini ishga tushiradi va barcha middleware va routelarni ulaydi.
 */

const app = require('./app');
const config = require('./config/env');
const { connectDatabase } = require('./config/database');

// Server portini environment variabledan olish yoki default 3001
const PORT = config.PORT || 3001;

// Database'ga ulanish va server ishga tushirish
async function startServer() {
  try {
    // Database'ga ulanish
    await connectDatabase();
    
    // Serverni ishga tushirish
    app.listen(PORT, () => {
      console.log(`🚀 Express server ishga tushdi: http://localhost:${PORT}`);
      console.log(`📚 API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Server ishga tushirishda xatolik:', error);
    process.exit(1);
  }
}

// Server'ni ishga tushirish
startServer();

// Graceful shutdown - server yopilganda database connectionni yopish
const { disconnectDatabase } = require('./config/database');

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal qabul qilindi. Server yopilmoqda...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal qabul qilindi. Server yopilmoqda...');
  await disconnectDatabase();
  process.exit(0);
});

