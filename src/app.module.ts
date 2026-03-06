import { Module } from '@nestjs/common'
import { GoldenRecordModule } from './golden-record/golden-record.module'

@Module({
  imports: [GoldenRecordModule],
})
export class AppModule {}
