/*
  Warnings:

  - Added the required column `materia_id` to the `exam_corrections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exam_corrections" ADD COLUMN     "materia_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "exam_corrections" ADD CONSTRAINT "exam_corrections_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
