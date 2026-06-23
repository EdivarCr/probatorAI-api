import { Type } from '@google/genai';

export const GabaritoResponseSchema = {
  type: Type.OBJECT,
  properties: {
    versao_prova: {
      type: Type.STRING,
      description:
        'A versão, cor ou tipo da prova identificado no topo do gabarito (Ex: Prova Azul, Tipo 1, Versão A). Se não encontrar, retorne null.',
      nullable: true,
    },
    questoes: {
      type: Type.ARRAY,
      description: 'Lista de questões identificadas no gabarito',
      items: {
        type: Type.OBJECT,
        properties: {
          numero_questao: {
            type: Type.INTEGER,
            description: 'O número da questão no gabarito',
          },
          alternativa_marcada: {
            type: Type.STRING,
            description:
              'A letra da alternativa preenchida (A-E) ou null se estiver em branco.',
            nullable: true,
          },
        },
        required: ['numero_questao', 'alternativa_marcada'],
      },
    },
  },
  required: ['versao_prova', 'questoes'],
};

export interface QuestaoMarcada {
  numero_questao: number;
  alternativa_marcada: string | null;
}

export interface GabaritoResponse {
  versao_prova: string | null;
  questoes: QuestaoMarcada[];
}
