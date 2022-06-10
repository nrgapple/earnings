/*
  Warnings:

  - A unique constraint covering the columns `[start,end,tag,companyTicker]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Report_fy_fp_tag_companyTicker_key";

-- CreateIndex
CREATE UNIQUE INDEX "Report_start_end_tag_companyTicker_key" ON "Report"("start", "end", "tag", "companyTicker");
