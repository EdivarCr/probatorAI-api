import { GoogleGenAI } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY não foi encontrada nas variáveis de ambiente.',
      );
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  private bufferToGenerativePart(buffer: Buffer, mimeType: string) {
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    };
  }

  async generateContent(
    prompt: string,
    schema?: any,
    file?: { buffer: Buffer; mimetype: string },
  ): Promise<string> {
    try {
      const contents: any[] = [prompt];

      if (file) {
        const imagePart = this.bufferToGenerativePart(
          file.buffer,
          file.mimetype,
        );
        contents.push(imagePart);
      }

      const config: any = { temperature: 0.1 };
      if (schema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = schema;
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.1,
          systemInstruction:
            'Você é um backend de extração de dados. Retorne APENAS o JSON puro. Nunca envolva a resposta em blocos de código com crases (```json).',
        },
      });

      return response.text ?? '';
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro interno na API do Gemini';
      throw new InternalServerErrorException(
        'Falha ao se comunicar com a API do Gemini',
        errorMessage,
      );
    }
  }
}
