-- Add usageStats field to Character table
-- This field stores cumulative analytics statistics as JSON
-- It's nullable, so existing characters will have NULL until their first entry is created

ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "usageStats" TEXT;

