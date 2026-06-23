-- CreateTable
CREATE TABLE "exam_corrections" (
    "id" TEXT NOT NULL,
    "exam_version_id" TEXT NOT NULL,
    "student_name" TEXT,
    "total_questions" INTEGER NOT NULL,
    "correct_answers" INTEGER NOT NULL,
    "wrong_answers" INTEGER NOT NULL,
    "blank_answers" INTEGER NOT NULL,
    "final_grade" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" TEXT NOT NULL,
    "correction_id" TEXT NOT NULL,
    "question_position" INTEGER NOT NULL,
    "official_label" "AlternativeLabel" NOT NULL,
    "marked_label" "AlternativeLabel",
    "status" TEXT NOT NULL,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_corrections_exam_version_id_idx" ON "exam_corrections"("exam_version_id");

-- CreateIndex
CREATE INDEX "student_answers_correction_id_idx" ON "student_answers"("correction_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_correction_id_question_position_key" ON "student_answers"("correction_id", "question_position");

-- AddForeignKey
ALTER TABLE "exam_corrections" ADD CONSTRAINT "exam_corrections_exam_version_id_fkey" FOREIGN KEY ("exam_version_id") REFERENCES "exam_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_correction_id_fkey" FOREIGN KEY ("correction_id") REFERENCES "exam_corrections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
