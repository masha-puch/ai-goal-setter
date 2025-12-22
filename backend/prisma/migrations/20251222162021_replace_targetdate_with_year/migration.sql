/*
  Warnings:

  - You are about to drop the column `targetDate` on the `Goal` table. All the data in the column will be lost.

*/
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
    "year" INTEGER,
    "milestones" JSONB,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "completionNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("category", "completionNote", "createdAt", "description", "id", "milestones", "priority", "status", "title", "updatedAt", "userId") SELECT "category", "completionNote", "createdAt", "description", "id", "milestones", "priority", "status", "title", "updatedAt", "userId" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
