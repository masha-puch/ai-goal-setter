/*
  Warnings:

  - You are about to drop the column `userId` on the `MoodBoardItem` table. All the data in the column will be lost.
  - Added the required column `moodBoardId` to the `MoodBoardItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MoodBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoodBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "priority" INTEGER,
    "targetDate" DATETIME,
    "milestones" JSONB,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "completionNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("category", "createdAt", "description", "id", "milestones", "priority", "status", "targetDate", "title", "updatedAt", "userId") SELECT "category", "createdAt", "description", "id", "milestones", "priority", "status", "targetDate", "title", "updatedAt", "userId" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE TABLE "new_MoodBoardItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moodBoardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" JSONB,
    "position" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MoodBoardItem_moodBoardId_fkey" FOREIGN KEY ("moodBoardId") REFERENCES "MoodBoard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MoodBoardItem" ("content", "createdAt", "id", "position", "tags", "type", "updatedAt") SELECT "content", "createdAt", "id", "position", "tags", "type", "updatedAt" FROM "MoodBoardItem";
DROP TABLE "MoodBoardItem";
ALTER TABLE "new_MoodBoardItem" RENAME TO "MoodBoardItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
