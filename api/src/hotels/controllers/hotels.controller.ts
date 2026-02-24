import { ApiKeyGuard, JwtAuthGuard } from '@app/common/auth/guards';
import { ParseUUIDCustomPipe } from '@app/common/pipes/parseUUIDCustom.pipe';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SearchHotelsDto } from '../dtos/searchHotels.dto';
import { HotelsSeedService } from '../services/hotels-seed.service';
import { HotelsService } from '../services/hotels.service';
import { RoomsSeedService } from '../services/rooms-seed.service';
import { RoomsService } from '../services/rooms.service';
import { RoomType } from '../types/room-type';

@Controller({
  path: 'hotels',
  version: '1',
})
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly hotelsSeedService: HotelsSeedService,
    private readonly roomsService: RoomsService,
    private readonly roomsSeedService: RoomsSeedService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Query() query: SearchHotelsDto) {
    return this.hotelsService.list(query);
  }

  @UseGuards(ApiKeyGuard)
  @Post('rooms/seed')
  async seedRooms() {
    return this.roomsSeedService.run();
  }

  @Get(':hotelId/rooms')
  async listRooms(
    @Param('hotelId') hotelId: string,
    @Query('type') type?: RoomType,
  ) {
    const result = await this.roomsService.listByHotel(hotelId, type);
    if (!result.isSuccess) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }

  @Get(':hotelId')
  async getById(
    @Param('hotelId', new ParseUUIDCustomPipe('hotel id is invalid'))
    hotelId: string,
  ) {
    const resultGetById = await this.hotelsService.getWholeById(hotelId);
    if (!resultGetById.isSuccess) {
      throw new NotFoundException(resultGetById.error);
    }
    return resultGetById.value;
  }

  @UseGuards(ApiKeyGuard)
  @Post('seed')
  async seed() {
    return this.hotelsSeedService.run();
  }
}
