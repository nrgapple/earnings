/*
  Warnings:

  - You are about to drop the column `accn` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `fp` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `fy` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "accn",
DROP COLUMN "fp",
DROP COLUMN "fy",
DROP COLUMN "updatedAt";
