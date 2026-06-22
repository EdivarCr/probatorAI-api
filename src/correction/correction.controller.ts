import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CorrectionService } from './correction.service';
import { HomologarCorrecaoDto } from '../integrations/gemini/dto/approve correction.dto';
@Controller('correction')
export class CorrectionController {
  constructor(private corretionService: CorrectionService) {}

  @Post('homologar-correcao')
  @HttpCode(HttpStatus.OK)
  async homologarCorrecao(@Body() dto: HomologarCorrecaoDto) {
    const relatorio = await this.corretionService.executarFluxoCorrecao(dto);

    return relatorio;
  }
}
