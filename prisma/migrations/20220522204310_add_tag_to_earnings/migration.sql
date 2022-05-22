/*
  Warnings:

  - A unique constraint covering the columns `[fp,fy,tag]` on the table `Earning` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tag` to the `Earning` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Earning_fp_fy_key";

-- AlterTable
ALTER TABLE "Earning" ADD COLUMN     "tag" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Earning_tag_idx" ON "Earning"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Earning_fp_fy_tag_key" ON "Earning"("fp", "fy", "tag");
