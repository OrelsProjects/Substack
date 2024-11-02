/*
  Warnings:

  - You are about to drop the `Recommendations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recommendations" DROP CONSTRAINT "Recommendations_userId_fkey";

-- DropTable
DROP TABLE "Recommendations";

-- CreateTable
CREATE TABLE "recommendations" (
    "_id" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
