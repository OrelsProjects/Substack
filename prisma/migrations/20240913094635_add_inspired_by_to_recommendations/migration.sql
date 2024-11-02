/*
  Warnings:

  - Added the required column `inspiredBy` to the `recommendations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recommendations" ADD COLUMN     "inspiredBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_inspiredBy_fkey" FOREIGN KEY ("inspiredBy") REFERENCES "userNotes"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
