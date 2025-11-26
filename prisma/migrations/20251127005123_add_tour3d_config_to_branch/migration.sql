-- AlterTable: Add tour3d_config to Branch
ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "tour3d_config" JSONB;
