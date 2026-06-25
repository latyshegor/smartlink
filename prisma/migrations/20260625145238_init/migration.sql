-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartLink" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3),
    "themeConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "SmartLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformLink" (
    "id" TEXT NOT NULL,
    "dsp" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "smartLinkId" TEXT NOT NULL,

    CONSTRAINT "PlatformLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "dsp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "country" TEXT,
    "isPreSave" BOOLEAN NOT NULL DEFAULT false,
    "smartLinkId" TEXT NOT NULL,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreSave" (
    "id" TEXT NOT NULL,
    "spotifyUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "smartLinkId" TEXT NOT NULL,

    CONSTRAINT "PreSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_email_key" ON "Artist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SmartLink_slug_key" ON "SmartLink"("slug");

-- CreateIndex
CREATE INDEX "SmartLink_artistId_idx" ON "SmartLink"("artistId");

-- CreateIndex
CREATE INDEX "PlatformLink_smartLinkId_idx" ON "PlatformLink"("smartLinkId");

-- CreateIndex
CREATE INDEX "Click_smartLinkId_idx" ON "Click"("smartLinkId");

-- CreateIndex
CREATE INDEX "Click_dsp_idx" ON "Click"("dsp");

-- CreateIndex
CREATE INDEX "PreSave_smartLinkId_idx" ON "PreSave"("smartLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "PreSave_smartLinkId_spotifyUserId_key" ON "PreSave"("smartLinkId", "spotifyUserId");

-- AddForeignKey
ALTER TABLE "SmartLink" ADD CONSTRAINT "SmartLink_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformLink" ADD CONSTRAINT "PlatformLink_smartLinkId_fkey" FOREIGN KEY ("smartLinkId") REFERENCES "SmartLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_smartLinkId_fkey" FOREIGN KEY ("smartLinkId") REFERENCES "SmartLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreSave" ADD CONSTRAINT "PreSave_smartLinkId_fkey" FOREIGN KEY ("smartLinkId") REFERENCES "SmartLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
