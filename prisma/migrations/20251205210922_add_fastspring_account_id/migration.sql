-- Add fastspringAccountId column to User table
-- This stores the FastSpring account ID for reliable subscription linking

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fastspringAccountId" TEXT;

-- Create unique index for fastspringAccountId to ensure one-to-one mapping
CREATE UNIQUE INDEX IF NOT EXISTS "User_fastspringAccountId_key" ON "User"("fastspringAccountId") WHERE "fastspringAccountId" IS NOT NULL;

