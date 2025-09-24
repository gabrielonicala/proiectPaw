/*
  Warnings:

  - Made the column `characterId` on table `JournalEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "reimaginedText" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "journeyType" TEXT NOT NULL,
    "outputType" TEXT NOT NULL,
    "pastContext" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_JournalEntry" ("characterId", "createdAt", "id", "imageUrl", "journeyType", "originalText", "outputType", "pastContext", "reimaginedText", "updatedAt", "userId", "videoUrl") SELECT "characterId", "createdAt", "id", "imageUrl", "journeyType", "originalText", "outputType", "pastContext", "reimaginedText", "updatedAt", "userId", "videoUrl" FROM "JournalEntry";
DROP TABLE "JournalEntry";
ALTER TABLE "new_JournalEntry" RENAME TO "JournalEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
