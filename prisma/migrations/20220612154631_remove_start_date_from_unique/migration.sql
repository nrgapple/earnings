/*
  Warnings:

  - A unique constraint covering the columns `[end,tag,companyTicker]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Report_start_end_tag_companyTicker_key";

-- CreateIndex
CREATE UNIQUE INDEX "Report_end_tag_companyTicker_key" ON "Report"("end", "tag", "companyTicker");
