/*
  Warnings:

  - You are about to drop the `_MateriaToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MateriaToUser" DROP CONSTRAINT "_MateriaToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_MateriaToUser" DROP CONSTRAINT "_MateriaToUser_B_fkey";

-- DropTable
DROP TABLE "_MateriaToUser";

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
