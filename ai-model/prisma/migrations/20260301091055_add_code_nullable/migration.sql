/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Language` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");
