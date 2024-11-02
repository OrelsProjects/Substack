/*
  Warnings:

  - The `publishDate` column on the `UserNotes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserNotes" DROP COLUMN "publishDate",
ADD COLUMN     "publishDate" INTEGER;
