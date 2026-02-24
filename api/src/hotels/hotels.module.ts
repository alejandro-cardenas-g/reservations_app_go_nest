import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common/database/database.module';
import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Hotel } from './entities/hotel.entity';
import { Room } from './entities/room.entity';
import { HotelsRepository } from './repositories/hotels.repository';
import { RoomsRepository } from './repositories/rooms.repository';
import { HotelsService } from './services/hotels.service';
import { HotelsSeedService } from './services/hotels-seed.service';
import { RoomsService } from './services/rooms.service';
import { RoomsSeedService } from './services/rooms-seed.service';
import { HotelsController } from './controllers/hotels.controller';

@Module({
  imports: [DatabaseModule.forFeature(DB_CONNECTIONS.MAIN, [Hotel, Room])],
  controllers: [HotelsController],
  providers: [
    HotelsRepository,
    RoomsRepository,
    HotelsService,
    HotelsSeedService,
    RoomsService,
    RoomsSeedService,
  ],
  exports: [RoomsRepository],
})
export class HotelsModule {
  static DatabaseModules() {
    return [Hotel, Room];
  }
}
