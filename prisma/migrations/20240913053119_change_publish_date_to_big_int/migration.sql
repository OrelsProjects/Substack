/*
  Warnings:

  - Made the column `publishDate` on table `userNotes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "userNotes" ALTER COLUMN "publishDate" SET NOT NULL,
ALTER COLUMN "publishDate" SET DATA TYPE BIGINT;
