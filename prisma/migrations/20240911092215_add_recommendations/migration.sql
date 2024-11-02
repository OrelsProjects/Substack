-- CreateTable
CREATE TABLE "Recommendations" (
    "_id" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Recommendations_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "Recommendations" ADD CONSTRAINT "Recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
