-- Force fix the memory field constraint issue
-- This migration directly addresses the NOT NULL constraint on the memory field

-- First, let's see what we're dealing with and fix it directly
ALTER TABLE "CharacterMemory" ALTER COLUMN "memory" DROP NOT NULL;

-- If that doesn't work, we'll try a more aggressive approach
-- Update any existing NULL memory fields to have a default value
UPDATE "CharacterMemory" SET "memory" = '{}' WHERE "memory" IS NULL;

-- Make sure the column is definitely nullable now
ALTER TABLE "CharacterMemory" ALTER COLUMN "memory" DROP NOT NULL;
