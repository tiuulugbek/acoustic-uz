"use strict";
/**
 * Script to check image URLs in the database
 * Shows what URLs exist and need fixing
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Load .env file from project root or apps/backend
const envPaths = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'apps', 'backend', '.env'),
];
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`✅ Loaded .env from: ${envPath}`);
        break;
    }
}
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env files');
    process.exit(1);
}
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
async function checkUrls() {
    console.log('🔍 Checking URLs in database...\n');
    // 1. Check Media URLs
    console.log('📸 Media URLs:');
    const mediaRecords = await prisma.media.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
    });
    console.log(`   Total Media records: ${await prisma.media.count()}`);
    console.log(`   Showing first ${mediaRecords.length} records:\n`);
    for (const media of mediaRecords.slice(0, 10)) {
        const needsFix = media.url.includes('localhost') ||
            media.url.includes('.acoustic.uz') ||
            media.url.includes('news.acoustic.uz') ||
            media.url.startsWith('http://');
        console.log(`   ${needsFix ? '⚠️ ' : '✅ '} ${media.id.substring(0, 8)}... ${media.url.substring(0, 80)}${media.url.length > 80 ? '...' : ''}`);
    }
    // 2. Check Product galleryUrls
    console.log('\n🖼️  Product galleryUrls:');
    const products = await prisma.product.findMany({
        where: {
            galleryUrls: {
                isEmpty: false,
            },
        },
        take: 10,
    });
    console.log(`   Products with galleryUrls: ${await prisma.product.count({ where: { galleryUrls: { isEmpty: false } } })}`);
    console.log(`   Showing first ${products.length} products:\n`);
    for (const product of products) {
        const badUrls = product.galleryUrls.filter(url => url.includes('localhost') ||
            url.includes('.acoustic.uz') ||
            url.includes('news.acoustic.uz') ||
            url.startsWith('http://'));
        if (badUrls.length > 0) {
            console.log(`   ⚠️  ${product.slug}: ${badUrls.length} bad URLs`);
            badUrls.slice(0, 2).forEach(url => {
                console.log(`      - ${url.substring(0, 70)}${url.length > 70 ? '...' : ''}`);
            });
        }
        else {
            console.log(`   ✅ ${product.slug}: All URLs OK`);
        }
    }
    // 3. Check Service content
    console.log('\n📝 Service content:');
    const services = await prisma.service.findMany({
        take: 10,
    });
    console.log(`   Total Services: ${await prisma.service.count()}`);
    for (const service of services) {
        const bodyUz = service.body_uz || '';
        const bodyRu = service.body_ru || '';
        const hasBadUrls = bodyUz.includes('localhost') ||
            bodyUz.includes('.acoustic.uz') ||
            bodyUz.includes('news.acoustic.uz') ||
            bodyRu.includes('localhost') ||
            bodyRu.includes('.acoustic.uz') ||
            bodyRu.includes('news.acoustic.uz');
        if (hasBadUrls) {
            console.log(`   ⚠️  ${service.slug}: Contains bad URLs`);
        }
    }
    // 4. Check Product content
    console.log('\n📦 Product content:');
    const productsWithContent = await prisma.product.findMany({
        where: {
            OR: [
                { description_uz: { not: null } },
                { description_ru: { not: null } },
                { tech_uz: { not: null } },
                { tech_ru: { not: null } },
            ],
        },
        take: 10,
    });
    console.log(`   Products with content: ${productsWithContent.length}`);
    for (const product of productsWithContent) {
        const content = [
            product.description_uz || '',
            product.description_ru || '',
            product.tech_uz || '',
            product.tech_ru || '',
        ].join(' ');
        const hasBadUrls = content.includes('localhost') ||
            content.includes('.acoustic.uz') ||
            content.includes('news.acoustic.uz');
        if (hasBadUrls) {
            console.log(`   ⚠️  ${product.slug}: Contains bad URLs`);
        }
    }
    // 5. Summary
    console.log('\n📊 Summary:');
    const mediaWithBadUrls = await prisma.media.count({
        where: {
            OR: [
                { url: { contains: 'localhost' } },
                { url: { contains: '.acoustic.uz' } },
                { url: { contains: 'news.acoustic.uz' } },
                { url: { startsWith: 'http://' } },
            ],
        },
    });
    console.log(`   Media with bad URLs: ${mediaWithBadUrls}`);
    console.log(`   Total Media: ${await prisma.media.count()}`);
}
checkUrls()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check-database-urls.js.map