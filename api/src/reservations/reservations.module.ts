import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { DatabaseModule } from '@app/common/database/database.module';
import { Module } from '@nestjs/common';
import { HotelsModule } from '../hotels/hotels.module';
import { Reservation } from './entities/reservation.entity';
import { ReservationsRepository } from './repositories/reservations.repository';
import { ReservationsService } from './services/reservations.service';
import { ReservationsController } from './controllers/reservations.controller';
import { OutboxModule } from 'src/outbox/outbox.module';

@Module({
  imports: [
    DatabaseModule.forFeature(DB_CONNECTIONS.MAIN, [Reservation]),
    HotelsModule,
    OutboxModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsRepository, ReservationsService],
})
export class ReservationsModule {
  static DatabaseModules() {
    return [Reservation];
  }
}
