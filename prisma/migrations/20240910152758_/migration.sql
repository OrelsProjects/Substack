/*
  Warnings:

  - You are about to drop the `UserMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserMetadata" DROP CONSTRAINT "UserMetadata_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- DropTable
DROP TABLE "UserMetadata";

-- DropTable
DROP TABLE "UserSettings";

-- CreateTable
CREATE TABLE "userMetadata" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "paidStatus" TEXT,
    "pushToken" TEXT,
    "pushTokenMobile" TEXT,

    CONSTRAINT "userMetadata_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "userSettings" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showNotifications" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "userSettings_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userMetadata_userId_key" ON "userMetadata"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "userSettings_userId_key" ON "userSettings"("userId");

-- AddForeignKey
ALTER TABLE "userMetadata" ADD CONSTRAINT "userMetadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
