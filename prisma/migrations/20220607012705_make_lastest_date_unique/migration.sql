/*
  Warnings:

  - A unique constraint covering the columns `[latestDate]` on the table `LatestFiling` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LatestFiling_latestDate_key" ON "LatestFiling"("latestDate");
