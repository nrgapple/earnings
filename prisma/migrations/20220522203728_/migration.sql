/*
  Warnings:

  - A unique constraint covering the columns `[fp,fy]` on the table `Earning` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Earning_fp_fy_key" ON "Earning"("fp", "fy");
