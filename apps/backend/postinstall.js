// Postinstall script to generate Prisma client
// This runs after pnpm install

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
const prismaPath = path.resolve(__dirname, '../../node_modules/.pnpm/prisma@5.22.0/node_modules/prisma/build/index.js');

console.log('Generating Prisma Client...');

try {
  // Check if Prisma is available
  if (fs.existsSync(prismaPath)) {
    execSync(`node "${prismaPath}" generate --schema="${schemaPath}"`, {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        PRISMA_GENERATE_SKIP_AUTOINSTALL: '1',
      },
    });
    console.log('✅ Prisma Client generated successfully!');
  } else {
    console.log('⚠️  Prisma not found, skipping generation. Run: pnpm db:generate');
  }
} catch (error) {
  console.log('⚠️  Prisma generation failed. Run manually: pnpm db:generate');
  console.log('Error:', error.message);
}

