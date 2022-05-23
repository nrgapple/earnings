/*
  Warnings:

  - You are about to drop the column `companyTicker` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fp,fy,tagId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_companyTicker_fkey";

-- DropIndex
DROP INDEX "Report_fp_fy_tag_companyTicker_key";

-- DropIndex
DROP INDEX "Report_tag_idx";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "companyTicker",
DROP COLUMN "tag",
ADD COLUMN     "tagId" TEXT;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyTicker" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_id_key" ON "Tag"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_companyTicker_key" ON "Tag"("name", "companyTicker");

-- CreateIndex
CREATE UNIQUE INDEX "Report_fp_fy_tagId_key" ON "Report"("fp", "fy", "tagId");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyTicker_fkey" FOREIGN KEY ("companyTicker") REFERENCES "Company"("ticker") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
