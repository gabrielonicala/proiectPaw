-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT NOT NULL,
    "avatar" TEXT,
    "appearance" TEXT NOT NULL DEFAULT 'androgynous',
    "pronouns" TEXT NOT NULL DEFAULT 'they/them',
    "customPronouns" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Character" ("avatar", "createdAt", "description", "id", "isActive", "name", "theme", "updatedAt", "userId") SELECT "avatar", "createdAt", "description", "id", "isActive", "name", "theme", "updatedAt", "userId" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
