import { config } from 'dotenv';
config(); // carrega .env antes de qualquer leitura de process.env

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Conexão ─────────────────────────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌  DATABASE_URL não está definida.');
  console.error('    Local : defina no .env');
  console.error('    Prod  : DATABASE_URL="<neon-url>" npm run seed:prod');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── Tipos dos arquivos JSON ──────────────────────────────────────────────────

type AlternativeJson = {
  label: string;
  text: string;
  explanation?: string;
  isCorrect: boolean;
  selectedByUser?: boolean;
};

type QuestionJson = {
  index: number;
  question: string;
  alternatives: AlternativeJson[];
};

type SeedFile = {
  subject: string;
  level: 'facil' | 'medio' | 'dificil';
  questions: QuestionJson[];
  capturedAt?: string;
  source?: string;
  url?: string;
};

// ─── Mapeamento subject → matéria ────────────────────────────────────────────

const MATERIA_MAP: Record<string, { name: string; description: string }> = {
  historia: { name: 'História', description: 'História Geral e do Brasil' },
  ciencias: { name: 'Ciências', description: 'Ciências Naturais e Biologia' },
  geografia: { name: 'Geografia', description: 'Geopolítica e Meio Ambiente' },
  matematica: { name: 'Matemática', description: 'Cálculo, Álgebra e Geometria' },
  fisica: { name: 'Física', description: 'Mecânica e Termodinâmica' },
  portugues: { name: 'Português', description: 'Gramática e Literatura' },
  computacao: { name: 'Computação', description: 'Algoritmos e Estruturas de Dados' },
  biologia: { name: 'Biologia', description: 'Biologia Celular e Ecologia' },
  quimica: { name: 'Química', description: 'Química Geral e Orgânica' },
};

function resolveMateria(subject: string): { name: string; description: string } {
  // Normaliza: minúsculas + remove acentos para fazer o lookup
  const key = subject
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  if (MATERIA_MAP[key]) return MATERIA_MAP[key];
  // Fallback: capitaliza o subject como veio
  return {
    name: subject.charAt(0).toUpperCase() + subject.slice(1),
    description: subject.charAt(0).toUpperCase() + subject.slice(1),
  };
}

const VALID_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;
type ValidLabel = (typeof VALID_LABELS)[number];

function parseLabel(label: string): ValidLabel {
  const upper = label.toUpperCase() as ValidLabel;
  if (!VALID_LABELS.includes(upper)) {
    throw new Error(`Label inválido: "${label}". Use A–E.`);
  }
  return upper;
}

// ─── Seed principal ───────────────────────────────────────────────────────────

async function main() {
  const seedsDir = join(__dirname, '..', '..', 'Out');

  if (!existsSync(seedsDir)) {
    console.error(`❌  Diretório Out/ não encontrado em: ${seedsDir}`);
    console.error('    Certifique-se de que os arquivos .json estão em probatorAI-api/Out/');
    process.exit(1);
  }

  const files = readdirSync(seedsDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.warn('⚠️  Nenhum arquivo .json encontrado em Out/');
    return;
  }

  console.log(`\n🔍 ${files.length} arquivo(s) encontrado(s) em Out/\n`);

  let totalQCreated = 0;
  let totalQSkipped = 0;
  // cache matérias já processadas nesta execução: name → id
  const materiasCache = new Map<string, string>();

  for (const filename of files) {
    const filePath = join(seedsDir, filename);
    let data: SeedFile;

    try {
      data = JSON.parse(readFileSync(filePath, 'utf-8')) as SeedFile;
    } catch {
      console.warn(`  ⚠️  ${filename}: JSON inválido, ignorando.`);
      continue;
    }

    if (!data.subject || !data.level || !Array.isArray(data.questions)) {
      console.warn(
        `  ⚠️  ${filename}: campos obrigatórios ausentes (subject / level / questions).`,
      );
      continue;
    }

    const materiaInfo = resolveMateria(data.subject);

    // Upsert matéria (idempotente pelo campo unique name)
    let materiaId = materiasCache.get(materiaInfo.name);
    if (!materiaId) {
      const materia = await prisma.materia.upsert({
        where: { name: materiaInfo.name },
        update: {},
        create: { name: materiaInfo.name, description: materiaInfo.description },
      });
      materiaId = materia.id;
      materiasCache.set(materiaInfo.name, materiaId);
    }

    console.log(
      `📄 ${filename}\n   matéria: "${materiaInfo.name}"  |  nível: ${data.level}  |  ${data.questions.length} questão(ões)`,
    );

    let created = 0;
    let skipped = 0;

    for (const q of data.questions) {
      const statement = q.question?.trim();
      if (!statement || !Array.isArray(q.alternatives) || q.alternatives.length === 0) {
        skipped++;
        continue;
      }

      // Checa duplicata pela constraint única (materiaId, statement)
      const exists = await prisma.question.findFirst({
        where: { materiaId, statement },
        select: { id: true },
      });

      if (exists) {
        skipped++;
        continue;
      }

      try {
        await prisma.question.create({
          data: {
            materiaId,
            statement,
            level: data.level,

      // Checa duplicata pela constraint única (materiaId, statement)
      const exists = await prisma.question.findFirst({
        where: { materiaId, statement: q.question },
        select: { id: true },
      });

      if (exists) {
        skipped++;
        continue;
      }

      try {
        await prisma.question.create({
          data: {
            materiaId,
            statement: q.question,
            level: data.level,
            importedFrom: data.source ?? null,
            sourceUrl: data.url ?? null,
            sourceIndex: q.index,
            sourceCapturedAt: data.capturedAt ? new Date(data.capturedAt) : null,
            alternatives: {
              create: q.alternatives.map((alt) => ({
                originalLabel: parseLabel(alt.label),
                text: alt.text,
                explanation: alt.explanation ?? null,
                isCorrect: alt.isCorrect,
              })),
            },
          },
        });
        created++;
      } catch (err) {
        console.warn(
          `    ⚠️  Questão índice ${q.index} ignorada: ${err instanceof Error ? err.message : String(err)}`,
        );
        skipped++;
      }
    }

    console.log(
      `   ✅ ${created} criada(s)  ·  ⏭️  ${skipped} duplicata(s)/inválida(s) ignorada(s)\n`,
    );
    totalQCreated += created;
    totalQSkipped += skipped;
  }

  const separator = '─'.repeat(50);
  console.log(separator);
  console.log('🎉 Seed concluído!');
  console.log(`   Matérias upsert : ${materiasCache.size}`);
  console.log(`   Questões criadas: ${totalQCreated}`);
  console.log(`   Ignoradas (dup) : ${totalQSkipped}`);
  console.log(separator);
}

main()
  .catch((e) => {
    console.error('\n❌  Erro durante o seed:', e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
