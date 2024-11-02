/*
  Warnings:

  - Added the required column `hasCarousel` to the `linkedInPosts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "linkedInPosts" ADD COLUMN     "hasCarousel" BOOLEAN NOT NULL;
