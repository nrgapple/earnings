/*
  Warnings:

  - You are about to drop the column `tagId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[fy,fp,tag,companyTicker]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tag` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_companyTicker_fkey";

-- DropIndex
DROP INDEX "Report_fp_fy_tagId_key";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "tagId",
ADD COLUMN     "companyTicker" TEXT,
ADD COLUMN     "tag" TEXT NOT NULL;

-- DropTable
DROP TABLE "Tag";

-- CreateIndex
CREATE INDEX "Report_tag_idx" ON "Report"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Report_fy_fp_tag_companyTicker_key" ON "Report"("fy", "fp", "tag", "companyTicker");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyTicker_fkey" FOREIGN KEY ("companyTicker") REFERENCES "Company"("ticker") ON DELETE SET NULL ON UPDATE CASCADE;
