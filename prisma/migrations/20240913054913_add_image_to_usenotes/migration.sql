/*
  Warnings:

  - You are about to drop the column `hasImage` on the `userNotes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "userNotes" DROP COLUMN "hasImage",
ADD COLUMN     "image" TEXT;
