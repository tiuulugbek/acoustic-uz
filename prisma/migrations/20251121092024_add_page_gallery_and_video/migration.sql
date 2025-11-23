-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "galleryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "usefulArticleSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoUrl" TEXT;
