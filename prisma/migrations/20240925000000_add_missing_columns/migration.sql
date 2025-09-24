-- Add missing columns to existing tables

-- Add missing columns to Character table
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Character" ALTER COLUMN "appearance" SET DEFAULT 'androgynous';
ALTER TABLE "Character" ALTER COLUMN "pronouns" SET DEFAULT 'they/them';

-- Add missing columns to User table if they don't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationTokenExpiry" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeCharacterId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "characterSlots" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionPlan" TEXT DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'inactive';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionEndsAt" TIMESTAMP(3);

-- Update CharacterMemory table structure if needed
ALTER TABLE "CharacterMemory" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "CharacterMemory" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_subscriptionId_key" ON "User"("subscriptionId");
CREATE UNIQUE INDEX IF NOT EXISTS "CharacterMemory_characterId_key" ON "CharacterMemory"("characterId");

-- Add foreign key constraint for activeCharacterId
ALTER TABLE "User" ADD CONSTRAINT "User_activeCharacterId_fkey" 
FOREIGN KEY ("activeCharacterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;
