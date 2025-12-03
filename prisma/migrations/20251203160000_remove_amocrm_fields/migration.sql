-- Remove AmoCRM fields from Setting table
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmDomain";
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmClientId";
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmClientSecret";
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmAccessToken";
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmRefreshToken";
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmTokenExpiresAt";
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmPipelineId";
ALTER TABLE "Setting" DROP COLUMN IF EXISTS "amocrmStatusId";

