import { Test, TestingModule } from '@nestjs/testing';
import { CorrectionService } from './correction.service';

describe('CorrectionService', () => {
  let service: CorrectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrectionService],
    }).compile();

    service = module.get<CorrectionService>(CorrectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
