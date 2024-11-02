/*
  Warnings:

  - Changed the type of `publishDate` on the `userNotes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "userNotes" DROP COLUMN "publishDate",
ADD COLUMN     "publishDate" TIMESTAMP(3) NOT NULL;
