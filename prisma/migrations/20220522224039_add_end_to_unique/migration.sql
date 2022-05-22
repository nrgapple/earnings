/*
  Warnings:

  - A unique constraint covering the columns `[fp,fy,tag,end]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Report_fp_fy_tag_key";

-- CreateIndex
CREATE UNIQUE INDEX "Report_fp_fy_tag_end_key" ON "Report"("fp", "fy", "tag", "end");
