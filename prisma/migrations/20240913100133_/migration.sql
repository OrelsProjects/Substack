/*
  Warnings:

  - You are about to drop the column `recommendationsId` on the `userNotes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "userNotes" DROP CONSTRAINT "userNotes_recommendationsId_fkey";

-- AlterTable
ALTER TABLE "recommendations" ALTER COLUMN "inspiredBy" SET NOT NULL,
ALTER COLUMN "inspiredBy" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "userNotes" DROP COLUMN "recommendationsId";

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_inspiredBy_fkey" FOREIGN KEY ("inspiredBy") REFERENCES "userNotes"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
