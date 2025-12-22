/*
  Warnings:

  - Made the column `year` on table `Goal` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "priority" INTEGER,
    "year" INTEGER NOT NULL,
    "milestones" JSONB,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "completionNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("category", "completionNote", "createdAt", "description", "id", "milestones", "priority", "status", "updatedAt", "userId", "year") SELECT "category", "completionNote", "createdAt", "description", "id", "milestones", "priority", "status", "updatedAt", "userId", "year" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
