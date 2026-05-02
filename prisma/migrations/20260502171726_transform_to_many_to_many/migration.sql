-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_user_id_fkey";

-- CreateTable
CREATE TABLE "_MateriaToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MateriaToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MateriaToUser_B_index" ON "_MateriaToUser"("B");

-- AddForeignKey
ALTER TABLE "_MateriaToUser" ADD CONSTRAINT "_MateriaToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MateriaToUser" ADD CONSTRAINT "_MateriaToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
