/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" DATETIME;
ALTER TABLE "User" ADD COLUMN "subscriptionEndsAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "subscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionPlan" TEXT DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" TEXT DEFAULT 'inactive';
ALTER TABLE "User" ADD COLUMN "theme" TEXT DEFAULT 'dark-academia';
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");
