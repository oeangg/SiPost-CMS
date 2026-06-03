-- CreateEnum
CREATE TYPE "kategoriContent" AS ENUM ('TRAVELLING_LAUT', 'TRAVELLING_GUNUNG', 'SOFT_SELLING', 'HARD_SELLING', 'STORYTELLING', 'PERSIB', 'LAINNYA');

-- CreateEnum
CREATE TYPE "kategoriPlatform" AS ENUM ('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'X', 'THREADS', 'WEBSITE', 'LAINNYA');

-- CreateEnum
CREATE TYPE "kategoriAfiliate" AS ENUM ('SHOPEE', 'LAZADA', 'TOKOPEDIA', 'TIKTOK_SHOP', 'LAINNYA');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SUPERVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPost" (
    "id" TEXT NOT NULL,
    "body" TEXT,
    "hook" TEXT,
    "affiliateUrl" TEXT,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contentType" "kategoriContent" NOT NULL,
    "platform" "kategoriPlatform" NOT NULL,
    "affiliateType" "kategoriAfiliate",
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostMetric" (
    "id" TEXT NOT NULL,
    "contentPostId" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AfiliateDailySumary" (
    "id" TEXT NOT NULL,
    "summaryDate" TIMESTAMP(3) NOT NULL,
    "affiliateType" "kategoriAfiliate" NOT NULL DEFAULT 'SHOPEE',
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AfiliateDailySumary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PostMetric_contentPostId_metricDate_key" ON "PostMetric"("contentPostId", "metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "AfiliateDailySumary_summaryDate_key" ON "AfiliateDailySumary"("summaryDate");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMetric" ADD CONSTRAINT "PostMetric_contentPostId_fkey" FOREIGN KEY ("contentPostId") REFERENCES "ContentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
