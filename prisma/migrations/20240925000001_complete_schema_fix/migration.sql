-- Complete schema fix: Add ALL missing columns to match the current Prisma schema

-- Add missing columns to Character table
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Character" ALTER COLUMN "appearance" SET DEFAULT 'androgynous';
ALTER TABLE "Character" ALTER COLUMN "pronouns" SET DEFAULT 'they/them';

-- Add missing columns to User table
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

-- Fix CharacterMemory table to match schema exactly
ALTER TABLE "CharacterMemory" ADD COLUMN IF NOT EXISTS "worldState" TEXT;
ALTER TABLE "CharacterMemory" ADD COLUMN IF NOT EXISTS "summaryLog" TEXT;
ALTER TABLE "CharacterMemory" ADD COLUMN IF NOT EXISTS "recentEntries" TEXT;
ALTER TABLE "CharacterMemory" ADD COLUMN IF NOT EXISTS "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "CharacterMemory" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Handle the old 'memory' field - make it nullable and migrate data if it exists
-- First check if the column exists and is NOT NULL, then make it nullable
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'CharacterMemory' 
        AND column_name = 'memory' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE "CharacterMemory" ALTER COLUMN "memory" DROP NOT NULL;
    END IF;
END $$;

-- If the old 'content' column exists, we can drop it since we're using the new structure
-- ALTER TABLE "CharacterMemory" DROP COLUMN IF EXISTS "content";

-- Add missing indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_subscriptionId_key" ON "User"("subscriptionId");
CREATE UNIQUE INDEX IF NOT EXISTS "CharacterMemory_characterId_key" ON "CharacterMemory"("characterId");

-- Add foreign key constraint for activeCharacterId
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_activeCharacterId_fkey'
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_activeCharacterId_fkey" 
        FOREIGN KEY ("activeCharacterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
