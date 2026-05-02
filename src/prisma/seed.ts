import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida para executar o seed.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const materiasGlobais = [
    { name: 'Matemática', description: 'Cálculo, Álgebra e Geometria' },
    { name: 'Física', description: 'Mecânica e Termodinâmica' },
    { name: 'Português', description: 'Gramática e Literatura' },
    { name: 'História', description: 'História Geral e do Brasil' },
    { name: 'Geografia', description: 'Geopolítica e Meio Ambiente' },
  ];

  console.log('Iniciando o seed de matérias globais...');

  for (const materia of materiasGlobais) {
    await prisma.materia.upsert({
      where: { name: materia.name },
      update: {},
      create: {
        name: materia.name,
        description: materia.description,
      },
    });
  }

  console.log(
    `Sucesso: ${materiasGlobais.length} matérias prontas para o frontend.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
