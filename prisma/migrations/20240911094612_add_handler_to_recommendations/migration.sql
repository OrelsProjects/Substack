/*
  Warnings:

  - Added the required column `handler` to the `recommendations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recommendations" ADD COLUMN     "handler" TEXT NOT NULL;
