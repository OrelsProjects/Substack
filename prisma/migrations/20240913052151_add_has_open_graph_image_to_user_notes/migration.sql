/*
  Warnings:

  - You are about to drop the `UserNotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserNotes" DROP CONSTRAINT "UserNotes_userId_fkey";

-- DropTable
DROP TABLE "UserNotes";

-- CreateTable
CREATE TABLE "userNotes" (
    "_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "restacks" INTEGER NOT NULL,
    "isRestack" BOOLEAN NOT NULL,
    "hasImage" BOOLEAN NOT NULL,
    "hasOpenGraphImage" BOOLEAN NOT NULL,
    "publishDate" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "userNotes_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "userNotes" ADD CONSTRAINT "userNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
