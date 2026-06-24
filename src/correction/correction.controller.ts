import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CorrectionService } from './correction.service';
import { HomologarCorrecaoDto } from '../integrations/gemini/dto/approve correction.dto';
@Controller('correction')
export class CorrectionController {
  constructor(private corretionService: CorrectionService) { }

  @Post('homologar-correcao')
  @HttpCode(HttpStatus.OK)
  async homologarCorrecao(@Body() dto: HomologarCorrecaoDto) {
    const relatorio = await this.corretionService.executarFluxoCorrecao(dto);

    return relatorio;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() request) {
    const LoggedUserId = request.user.sub;
    const correcao =
      await this.corretionService.getAllCorrections(LoggedUserId);
    return correcao;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Req() request, @Param('id') id: string) {
    const LoggedUserId = request.user.sub;
    const correcao = await this.corretionService.getOneCorrection(
      id,
      LoggedUserId,
    );
    return correcao;
  }
}
