-- Create PendingCheckout table for tracking users who started checkout
-- This allows webhooks to match account IDs to users on first checkout

CREATE TABLE IF NOT EXISTS "PendingCheckout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingCheckout_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId (one pending checkout per user)
CREATE UNIQUE INDEX IF NOT EXISTS "PendingCheckout_userId_key" ON "PendingCheckout"("userId");

-- Create index on createdAt for efficient cleanup queries
CREATE INDEX IF NOT EXISTS "PendingCheckout_createdAt_idx" ON "PendingCheckout"("createdAt");

-- Add foreign key constraint
ALTER TABLE "PendingCheckout" ADD CONSTRAINT "PendingCheckout_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

