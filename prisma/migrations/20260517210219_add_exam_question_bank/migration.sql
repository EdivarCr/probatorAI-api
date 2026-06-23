-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('facil', 'medio', 'dificil');

-- CreateEnum
CREATE TYPE "AlternativeLabel" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('draft', 'generated', 'archived');

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "materia_id" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "level" "DifficultyLevel" NOT NULL,
    "imported_from" TEXT,
    "source_url" TEXT,
    "source_index" INTEGER,
    "source_captured_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternatives" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "original_label" "AlternativeLabel" NOT NULL,
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "is_correct" BOOLEAN NOT NULL,

    CONSTRAINT "alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "materia_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ExamStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_versions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "version_label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_version_questions" (
    "id" TEXT NOT NULL,
    "exam_version_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "question_position" INTEGER NOT NULL,

    CONSTRAINT "exam_version_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_version_alternatives" (
    "id" TEXT NOT NULL,
    "exam_version_question_id" TEXT NOT NULL,
    "alternative_id" TEXT NOT NULL,
    "alternative_position" INTEGER NOT NULL,

    CONSTRAINT "exam_version_alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_keys" (
    "id" TEXT NOT NULL,
    "exam_version_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "question_position" INTEGER NOT NULL,
    "original_label" "AlternativeLabel" NOT NULL,
    "shuffled_label" "AlternativeLabel" NOT NULL,

    CONSTRAINT "answer_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_materia_id_idx" ON "questions"("materia_id");

-- CreateIndex
CREATE INDEX "questions_materia_id_level_idx" ON "questions"("materia_id", "level");

-- CreateIndex
CREATE INDEX "questions_materia_id_archived_at_idx" ON "questions"("materia_id", "archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "questions_materia_id_statement_key" ON "questions"("materia_id", "statement");

-- CreateIndex
CREATE INDEX "alternatives_question_id_idx" ON "alternatives"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "alternatives_question_id_original_label_key" ON "alternatives"("question_id", "original_label");

-- CreateIndex
CREATE INDEX "exams_materia_id_idx" ON "exams"("materia_id");

-- CreateIndex
CREATE INDEX "exams_status_idx" ON "exams"("status");

-- CreateIndex
CREATE INDEX "exam_versions_exam_id_idx" ON "exam_versions"("exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_versions_exam_id_version_label_key" ON "exam_versions"("exam_id", "version_label");

-- CreateIndex
CREATE INDEX "exam_version_questions_exam_version_id_idx" ON "exam_version_questions"("exam_version_id");

-- CreateIndex
CREATE INDEX "exam_version_questions_question_id_idx" ON "exam_version_questions"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_version_questions_exam_version_id_question_position_key" ON "exam_version_questions"("exam_version_id", "question_position");

-- CreateIndex
CREATE UNIQUE INDEX "exam_version_questions_exam_version_id_question_id_key" ON "exam_version_questions"("exam_version_id", "question_id");

-- CreateIndex
CREATE INDEX "exam_version_alternatives_exam_version_question_id_idx" ON "exam_version_alternatives"("exam_version_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_evalt_question_position" ON "exam_version_alternatives"("exam_version_question_id", "alternative_position");

-- CreateIndex
CREATE UNIQUE INDEX "uq_evalt_question_alternative" ON "exam_version_alternatives"("exam_version_question_id", "alternative_id");

-- CreateIndex
CREATE INDEX "answer_keys_exam_version_id_idx" ON "answer_keys"("exam_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "answer_keys_exam_version_id_question_position_key" ON "answer_keys"("exam_version_id", "question_position");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternatives" ADD CONSTRAINT "alternatives_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_versions" ADD CONSTRAINT "exam_versions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_version_questions" ADD CONSTRAINT "exam_version_questions_exam_version_id_fkey" FOREIGN KEY ("exam_version_id") REFERENCES "exam_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_version_questions" ADD CONSTRAINT "exam_version_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_version_alternatives" ADD CONSTRAINT "exam_version_alternatives_exam_version_question_id_fkey" FOREIGN KEY ("exam_version_question_id") REFERENCES "exam_version_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_version_alternatives" ADD CONSTRAINT "exam_version_alternatives_alternative_id_fkey" FOREIGN KEY ("alternative_id") REFERENCES "alternatives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_keys" ADD CONSTRAINT "answer_keys_exam_version_id_fkey" FOREIGN KEY ("exam_version_id") REFERENCES "exam_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_keys" ADD CONSTRAINT "answer_keys_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
