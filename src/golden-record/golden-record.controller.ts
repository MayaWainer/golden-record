import { Controller, Get } from '@nestjs/common'
import { GoldenRecordService } from './golden-record.service'
import { GoldenRecord } from '../models/golden-record'

@Controller('golden-record')
export class GoldenRecordController {
  constructor(private readonly goldenRecordService: GoldenRecordService) {}

  @Get()
  async getGoldenRecord(): Promise<GoldenRecord> {
    return this.goldenRecordService.buildGoldenRecordForSeed()
  }
}
