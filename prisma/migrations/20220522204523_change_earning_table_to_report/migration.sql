/*
  Warnings:

  - You are about to drop the `Earning` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Earning" DROP CONSTRAINT "Earning_companyTicker_fkey";

-- DropTable
DROP TABLE "Earning";

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "val" INTEGER,
    "end" TIMESTAMP(3) NOT NULL,
    "start" TIMESTAMP(3),
    "fp" TEXT NOT NULL,
    "fy" INTEGER NOT NULL,
    "companyTicker" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_tag_idx" ON "Report"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Report_fp_fy_tag_key" ON "Report"("fp", "fy", "tag");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyTicker_fkey" FOREIGN KEY ("companyTicker") REFERENCES "Company"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;
