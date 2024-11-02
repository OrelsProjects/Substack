/*
  Warnings:

  - The primary key for the `cartItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `cartItems` table. All the data in the column will be lost.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `payments` table. All the data in the column will be lost.
  - The primary key for the `recommendations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `recommendations` table. All the data in the column will be lost.
  - The primary key for the `subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `subscriptions` table. All the data in the column will be lost.
  - The primary key for the `userMetadata` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `userMetadata` table. All the data in the column will be lost.
  - The primary key for the `userNotes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `userNotes` table. All the data in the column will be lost.
  - The primary key for the `userOrders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `userOrders` table. All the data in the column will be lost.
  - The primary key for the `userSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `userSettings` table. All the data in the column will be lost.
  - The required column `id` was added to the `cartItems` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `payments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `recommendations` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `subscriptions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `userMetadataId` was added to the `userMetadata` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `userNotes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `userOrders` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `userSettingsId` was added to the `userSettings` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_inspiredBy_fkey";

-- DropForeignKey
ALTER TABLE "userOrders" DROP CONSTRAINT "userOrders_cartItemId_fkey";

-- AlterTable
ALTER TABLE "cartItems" DROP CONSTRAINT "cartItems_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "cartItems_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "userMetadata" DROP CONSTRAINT "userMetadata_pkey",
DROP COLUMN "_id",
ADD COLUMN     "userMetadataId" TEXT NOT NULL,
ADD CONSTRAINT "userMetadata_pkey" PRIMARY KEY ("userMetadataId");

-- AlterTable
ALTER TABLE "userNotes" DROP CONSTRAINT "userNotes_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "userNotes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "userOrders" DROP CONSTRAINT "userOrders_pkey",
DROP COLUMN "_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "userOrders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "userSettings" DROP CONSTRAINT "userSettings_pkey",
DROP COLUMN "_id",
ADD COLUMN     "userSettingsId" TEXT NOT NULL,
ADD CONSTRAINT "userSettings_pkey" PRIMARY KEY ("userSettingsId");

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_inspiredBy_fkey" FOREIGN KEY ("inspiredBy") REFERENCES "userNotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userOrders" ADD CONSTRAINT "userOrders_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "cartItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
