import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  
  async generateExamPdf(examData: any): Promise<Buffer> {
    const examTemplatePath = path.join(process.cwd(), 'src/exams/templates/prova-layout.hbs');
    const examTemplateHtml = fs.readFileSync(examTemplatePath, 'utf8');

    const gabaritoTemplatePath = path.join(process.cwd(), 'src/exams/templates/gabarito.hbs');
    const gabaritoTemplateHtml = fs.readFileSync(gabaritoTemplatePath, 'utf8');

   
    const examTemplate = handlebars.compile(examTemplateHtml);
    const examHtml = examTemplate({
      logoBase64: examData.logoData,
      schoolName: examData.schoolName,
      versionLabel: examData.versionLabel,
      questions: examData.questions
    });

    
    const gabaritoTemplate = handlebars.compile(gabaritoTemplateHtml);
    const gabaritoHtml = gabaritoTemplate({
      logoBase64: examData.logoData,
      schoolName: examData.schoolName,
      versionLabel: examData.versionLabel,
      questions: examData.questions
    });

   
    const extractBody = (html: string) => {
      const match = html.match(/<body>([\s\S]*?)<\/body>/i);
      return match ? match[1] : html;
    };

    const extractStyles = (html: string) => {
      const match = html.match(/<style>([\s\S]*?)<\/style>/i);
      return match ? match[1] : '';
    };

    
    const htmlComDados = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <style>
              ${extractStyles(examHtml)}
              ${extractStyles(gabaritoHtml)}
              .page-break { page-break-before: always; }
          </style>
      </head>
      <body>
          <div class="exam-content">
              ${extractBody(examHtml)}
          </div>
          <div class="page-break"></div>
          <div class="gabarito-content">
              ${extractBody(gabaritoHtml)}
          </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(htmlComDados, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      displayHeaderFooter: true,
      footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
      headerTemplate: '<div></div>',
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  async generateAnswerSheetPdf(examData: any): Promise<Buffer> {
    const templatePath = path.join(process.cwd(), 'src/exams/templates/gabarito.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    const template = handlebars.compile(templateHtml);
    const htmlComDados = template({
      logoBase64: examData.logoData,
      schoolName: examData.schoolName,
      versionLabel: examData.versionLabel,
      questions: examData.questions
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(htmlComDados, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      displayHeaderFooter: true,
      footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
      headerTemplate: '<div></div>',
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  }
}