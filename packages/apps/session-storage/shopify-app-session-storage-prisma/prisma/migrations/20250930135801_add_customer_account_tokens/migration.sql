-- AlterTable
ALTER TABLE "MySession" ADD COLUMN "idToken" TEXT;
ALTER TABLE "MySession" ADD COLUMN "refreshToken" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "idToken" TEXT;
ALTER TABLE "Session" ADD COLUMN "refreshToken" TEXT;
