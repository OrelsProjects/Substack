/*
  Warnings:

  - Added the required column `structure` to the `recommendations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `recommendations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recommendations" ADD COLUMN     "structure" TEXT NOT NULL,
ADD COLUMN     "topic" TEXT NOT NULL;
