-- Add encrypted fields to JournalEntry table
ALTER TABLE "JournalEntry" ADD COLUMN "encryptedOriginalText" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN "encryptedReimaginedText" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN "isEncrypted" BOOLEAN NOT NULL DEFAULT false;
