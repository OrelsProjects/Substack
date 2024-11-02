/*
  Warnings:

  - The `inspiredBy` column on the `recommendations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_inspiredBy_fkey";

-- AlterTable
ALTER TABLE "recommendations" DROP COLUMN "inspiredBy",
ADD COLUMN     "inspiredBy" TEXT[];

-- AlterTable
ALTER TABLE "userNotes" ADD COLUMN     "recommendationsId" TEXT;

-- AddForeignKey
ALTER TABLE "userNotes" ADD CONSTRAINT "userNotes_recommendationsId_fkey" FOREIGN KEY ("recommendationsId") REFERENCES "recommendations"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
