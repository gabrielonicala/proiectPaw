-- AlterTable: Add credits and hasPurchasedStarterKit to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "credits" INTEGER NOT NULL DEFAULT 150;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasPurchasedStarterKit" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: CreditPurchase
CREATE TABLE IF NOT EXISTS "CreditPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "inkVials" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "transactionId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CreditPurchase_transactionId_key" ON "CreditPurchase"("transactionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CreditPurchase_userId_idx" ON "CreditPurchase"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CreditPurchase_transactionId_idx" ON "CreditPurchase"("transactionId");

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;





