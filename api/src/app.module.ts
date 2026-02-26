import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigModuleSchema } from '@app/common/configuration';
import { DatabaseModule } from '@app/common/database/database.module';
import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { HealthController } from './health.controller';
import { HotelsModule } from './hotels/hotels.module';
import { ReservationsModule } from './reservations/reservations.module';
import { OutboxModule } from './outbox/outbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigModuleSchema,
      load: [],
    }),
    DatabaseModule.forRoot(DB_CONNECTIONS.MAIN, {
      models: [
        ...AuthModule.DatabaseModules(),
        ...HotelsModule.DatabaseModules(),
        ...ReservationsModule.DatabaseModules(),
        ...OutboxModule.DatabaseModules(),
      ],
    }),
    AuthModule,
    HotelsModule,
    ReservationsModule,
    OutboxModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
