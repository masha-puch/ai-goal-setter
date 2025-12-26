-- Rename Reflection table to Achievement
-- SQLite doesn't support ALTER TABLE RENAME, so we need to:
-- 1. Create new table
-- 2. Copy data
-- 3. Drop old table

PRAGMA foreign_keys=off;

-- Drop Achievement table if it exists (from previous failed migration)
DROP TABLE IF EXISTS "Achievement";

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from Reflection to Achievement
INSERT INTO "Achievement" ("id", "userId", "year", "text", "createdAt", "updatedAt")
SELECT "id", "userId", "year", "text", "createdAt", "updatedAt"
FROM "Reflection";

-- DropTable
DROP TABLE "Reflection";

PRAGMA foreign_keys=on;

-- RedefineIndex
DROP INDEX IF EXISTS "sqlite_autoindex_MoodBoard_2";
CREATE UNIQUE INDEX IF NOT EXISTS "MoodBoard_userId_year_key" ON "MoodBoard"("userId", "year");
