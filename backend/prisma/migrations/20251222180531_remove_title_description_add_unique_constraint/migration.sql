/*
  Warnings:

  - You are about to drop the column `description` on the `MoodBoard` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `MoodBoard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,year]` on the table `MoodBoard` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MoodBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoodBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MoodBoard_userId_year_key" UNIQUE ("userId", "year")
);
INSERT INTO "new_MoodBoard" ("createdAt", "id", "updatedAt", "userId", "year") SELECT "createdAt", "id", "updatedAt", "userId", "year" FROM "MoodBoard";
DROP TABLE "MoodBoard";
ALTER TABLE "new_MoodBoard" RENAME TO "MoodBoard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

