/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `theme` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `User` table. All the data in the column will be lost.

*/

-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VerificationToken";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT NOT NULL,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create default characters for existing users BEFORE restructuring tables
INSERT INTO "Character" ("id", "userId", "name", "description", "theme", "avatar", "isActive", "createdAt", "updatedAt")
SELECT 
    'char_' || "id" as "id",
    "id" as "userId",
    'My Character' as "name",
    'Your first character' as "description",
    COALESCE("theme", 'dark-academia') as "theme",
    "avatar" as "avatar",
    true as "isActive",
    CURRENT_TIMESTAMP as "createdAt",
    CURRENT_TIMESTAMP as "updatedAt"
FROM "User";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Update JournalEntry table
CREATE TABLE "new_JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "characterId" TEXT,
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

-- Migrate journal entries and assign them to default characters
INSERT INTO "new_JournalEntry" ("createdAt", "id", "imageUrl", "journeyType", "originalText", "outputType", "pastContext", "reimaginedText", "updatedAt", "userId", "videoUrl", "characterId") 
SELECT "createdAt", "id", "imageUrl", "journeyType", "originalText", "outputType", "pastContext", "reimaginedText", "updatedAt", "userId", "videoUrl", 'char_' || "userId" as "characterId" 
FROM "JournalEntry";

DROP TABLE "JournalEntry";
ALTER TABLE "new_JournalEntry" RENAME TO "JournalEntry";

-- Update User table
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "activeCharacterId" TEXT,
    "characterSlots" INTEGER NOT NULL DEFAULT 1,
    "subscriptionStatus" TEXT DEFAULT 'inactive',
    "subscriptionId" TEXT,
    "subscriptionPlan" TEXT DEFAULT 'free',
    "subscriptionEndsAt" DATETIME,
    CONSTRAINT "User_activeCharacterId_fkey" FOREIGN KEY ("activeCharacterId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Migrate users and set their default character as active
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "resetToken", "resetTokenExpiry", "subscriptionEndsAt", "subscriptionId", "subscriptionPlan", "subscriptionStatus", "updatedAt", "username", "activeCharacterId") 
SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "resetToken", "resetTokenExpiry", "subscriptionEndsAt", "subscriptionId", "subscriptionPlan", "subscriptionStatus", "updatedAt", "username", 'char_' || "id" as "activeCharacterId" 
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;