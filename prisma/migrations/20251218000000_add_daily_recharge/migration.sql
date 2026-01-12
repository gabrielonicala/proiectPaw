-- AlterTable: Add lastDailyRecharge to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastDailyRecharge" TIMESTAMP(3);

