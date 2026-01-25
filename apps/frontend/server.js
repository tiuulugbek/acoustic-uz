// Custom Next.js server - Port 3000'ni majburiy qilish
// Bu server faqat acoustic.uz proekti uchun port 3000'da ishlaydi
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Majburiy sozlamalar - port 3000 (hardcode)
const dev = process.env.NODE_ENV !== 'production';
const hostname = '127.0.0.1';
const port = 3000; // Majburiy port 3000 - hardcode, boshqa port ishlatib bo'lmaydi

// Port 3000'ni majburiy qilish
if (process.env.PORT && parseInt(process.env.PORT) !== 3000) {
  console.error('❌ Xatolik: Frontend faqat port 3000\'da ishlaydi!');
  console.error(`   Berilgan port: ${process.env.PORT}`);
  process.exit(1);
}

const app = next({ 
  dev, 
  hostname, 
  port
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} allaqachon ishlatilmoqda`);
      process.exit(1);
    } else if (err.code === 'EPERM') {
      console.error(`Port ${port} ga ruxsat yoq (EPERM)`);
      console.error('Bu muammo server konfiguratsiyasi bilan bogliq');
      process.exit(1);
    } else {
      console.error('Server xatosi:', err);
      process.exit(1);
    }
  });

  server.listen(port, hostname, () => {
    console.log(`> Acoustic.uz Frontend ready on http://${hostname}:${port}`);
    console.log(`> Port ${port} faqat bu proekt uchun`);
  });
}).catch((err) => {
  console.error('Next.js tayyorlashda xatolik:', err);
  process.exit(1);
});
