-- CreateTable
CREATE TABLE "linkedInPosts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "comments" INTEGER NOT NULL,
    "shares" INTEGER NOT NULL,
    "image" TEXT,
    "hasVideo" BOOLEAN NOT NULL,

    CONSTRAINT "linkedInPosts_pkey" PRIMARY KEY ("id")
);
