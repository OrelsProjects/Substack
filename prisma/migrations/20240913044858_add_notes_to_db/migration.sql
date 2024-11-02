-- CreateTable
CREATE TABLE "UserNotes" (
    "_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "restacks" INTEGER NOT NULL,
    "isRestack" BOOLEAN NOT NULL,
    "hasImage" BOOLEAN NOT NULL,
    "publishDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserNotes_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "UserNotes" ADD CONSTRAINT "UserNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
