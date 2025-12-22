/*
  Warnings:

  - Added the required column `year` to the `MoodBoard` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MoodBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoodBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MoodBoard" ("createdAt", "description", "id", "title", "updatedAt", "userId", "year") SELECT "createdAt", "description", "id", "title", "updatedAt", "userId", CAST(strftime('%Y', 'now') AS INTEGER) FROM "MoodBoard";
DROP TABLE "MoodBoard";
ALTER TABLE "new_MoodBoard" RENAME TO "MoodBoard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
