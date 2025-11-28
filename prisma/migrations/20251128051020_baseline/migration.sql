-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "handler" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "link" TEXT,
    "contactLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactEmail" TEXT,
    "country" TEXT,
    "name" TEXT,
    "title" TEXT,
    "tags" TEXT[],
    "englishLevel" TEXT,
    "availability" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "yoe" INTEGER,
    "roles" TEXT[],
    "joinedServerAt" TIMESTAMP(3),
    "profileActivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "User_handler_key" ON "User"("handler");

-- CreateIndex
CREATE INDEX "User_handler_idx" ON "User"("handler");

-- CreateIndex
CREATE INDEX "User_discordId_idx" ON "User"("discordId");

