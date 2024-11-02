-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_inspiredBy_fkey";

-- AlterTable
ALTER TABLE "recommendations" ALTER COLUMN "inspiredBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_inspiredBy_fkey" FOREIGN KEY ("inspiredBy") REFERENCES "userNotes"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
