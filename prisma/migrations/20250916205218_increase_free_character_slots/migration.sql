-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "characterSlots" INTEGER NOT NULL DEFAULT 2,
    "subscriptionStatus" TEXT DEFAULT 'inactive',
    "subscriptionId" TEXT,
    "subscriptionPlan" TEXT DEFAULT 'free',
    "subscriptionEndsAt" DATETIME,
    CONSTRAINT "User_activeCharacterId_fkey" FOREIGN KEY ("activeCharacterId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("activeCharacterId", "characterSlots", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "resetToken", "resetTokenExpiry", "subscriptionEndsAt", "subscriptionId", "subscriptionPlan", "subscriptionStatus", "updatedAt", "username") SELECT "activeCharacterId", "characterSlots", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "resetToken", "resetTokenExpiry", "subscriptionEndsAt", "subscriptionId", "subscriptionPlan", "subscriptionStatus", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
