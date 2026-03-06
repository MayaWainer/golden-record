import { Module } from '@nestjs/common'
import { GoldenRecordService } from './golden-record.service'
import { GoldenRecordController } from './golden-record.controller'
import { SourceAAdapter } from '../ingestion/adapters/source-a.adapter'
import { SourceBAdapter } from '../ingestion/adapters/source-b.adapter'
import { SourceCAdapter } from '../ingestion/adapters/source-c.adapter'
import { Matcher } from '../matching/matcher'
import { Merger } from '../merge/merger'
import { ConfidenceService } from '../merge/confidence'

@Module({
  controllers: [GoldenRecordController],
  providers: [
    GoldenRecordService,
    ConfidenceService,
    Merger,
    Matcher,
    SourceAAdapter,
    SourceBAdapter,
    SourceCAdapter,
  ],
  exports: [GoldenRecordService],
})
export class GoldenRecordModule {}
