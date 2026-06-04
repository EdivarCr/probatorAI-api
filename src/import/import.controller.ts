import { Controller, Post, Body } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportNotebooklmDto } from './dto/import-notebooklm.dto';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('notebooklm')
  importNotebooklm(@Body() dto: ImportNotebooklmDto) {
    return this.importService.importFromNotebooklm(dto);
  }
}
