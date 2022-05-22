/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `companyId` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_companyId_fkey";

-- DropIndex
DROP INDEX "Company_ticker_key";

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("ticker");

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "companyId",
ADD COLUMN     "companyTicker" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_id_key" ON "Company"("id");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyTicker_fkey" FOREIGN KEY ("companyTicker") REFERENCES "Company"("ticker") ON DELETE SET NULL ON UPDATE CASCADE;
