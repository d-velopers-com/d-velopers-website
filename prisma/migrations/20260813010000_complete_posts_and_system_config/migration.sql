-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "embeddable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'APPROVED';

-- Existing posts were already public before moderation states existed.
-- Preserve that visibility while new posts default to pending review.
ALTER TABLE "Post"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "Post_status_createdAt_idx" ON "Post"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_createdById_status_createdAt_idx" ON "Post"("createdById", "status", "createdAt" DESC);
