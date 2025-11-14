import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateServicesToHomepage() {
  try {
    console.log('🔄 Fetching regular services...');
    
    // Get all published regular services
    const regularServices = await prisma.service.findMany({
      where: { status: 'published' },
      include: { cover: true },
      orderBy: { order: 'asc' },
    });

    console.log(`📋 Found ${regularServices.length} regular services`);

    // Check if homepage services already exist
    const existingHomepageServices = await (prisma as any).homepageService.count();
    
    if (existingHomepageServices > 0) {
      console.log(`⚠️  Warning: ${existingHomepageServices} homepage services already exist.`);
      console.log('   Skipping migration to avoid duplicates.');
      console.log('   If you want to re-migrate, delete existing homepage services first.');
      return;
    }

    // Create homepage services from regular services
    console.log('📝 Creating homepage services...');
    
    const homepageServices = regularServices.map((service) => ({
      title_uz: service.title_uz,
      title_ru: service.title_ru,
      excerpt_uz: service.excerpt_uz ?? undefined,
      excerpt_ru: service.excerpt_ru ?? undefined,
      slug: service.slug,
      imageId: service.coverId ?? undefined,
      order: service.order,
      status: service.status as 'published' | 'draft' | 'archived',
    }));

    await (prisma as any).homepageService.createMany({
      data: homepageServices,
    });

    console.log(`✅ Successfully migrated ${homepageServices.length} services to homepage services!`);
    console.log('   You can now manage them in Admin Panel → Homepage → Bosh sahifa xizmatlari');
  } catch (error) {
    console.error('❌ Error migrating services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateServicesToHomepage();

