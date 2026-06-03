/*
  Warnings:

  - You are about to drop the column `clicks` on the `PostMetric` table. All the data in the column will be lost.
  - You are about to drop the column `saves` on the `PostMetric` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostMetric" DROP COLUMN "clicks",
DROP COLUMN "saves",
ADD COLUMN     "repost" INTEGER NOT NULL DEFAULT 0;
