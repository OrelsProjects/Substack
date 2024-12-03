/*
  Warnings:

  - You are about to drop the column `shares` on the `linkedInPosts` table. All the data in the column will be lost.
  - Added the required column `reposts` to the `linkedInPosts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `linkedInPosts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "linkedInPosts" DROP COLUMN "shares",
ADD COLUMN     "date" TEXT,
ADD COLUMN     "reposts" INTEGER NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
