/*
  Warnings:

  - You are about to drop the column `materia_id` on the `exam_corrections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "exam_corrections" DROP CONSTRAINT "exam_corrections_materia_id_fkey";

-- AlterTable
ALTER TABLE "exam_corrections" DROP COLUMN "materia_id";
