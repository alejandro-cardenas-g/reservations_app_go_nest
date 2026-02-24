import { Module } from '@nestjs/common';
import { OutboxEvent } from './entities/outbox.entity';
import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { DatabaseModule } from '@app/common/database/database.module';

@Module({
  imports: [
    DatabaseModule.forFeature(
      DB_CONNECTIONS.MAIN,
      OutboxModule.DatabaseModules(),
    ),
  ],
  providers: [],
  exports: [],
})
export class OutboxModule {
  static DatabaseModules() {
    return [OutboxEvent];
  }
}
