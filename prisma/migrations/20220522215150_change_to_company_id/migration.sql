/*
  Warnings:

  - You are about to drop the column `companyTicker` on the `Report` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_companyTicker_fkey";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "companyTicker",
ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
