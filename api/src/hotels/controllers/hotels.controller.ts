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
import { HotelsService } from '../services/hotels.service';
import { HotelsSeedService } from '../services/hotels-seed.service';
import { RoomsService } from '../services/rooms.service';
import { RoomsSeedService } from '../services/rooms-seed.service';
import { ApiKeyGuard } from '@app/common/auth/guards';
import { CreateRoomDto } from '../dtos/create-room.dto';
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

  @Get()
  list(@Query('location') location?: string) {
    return this.hotelsService.list(location);
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

  @Post(':hotelId/rooms')
  async createRoom(
    @Param('hotelId') hotelId: string,
    @Body() dto: CreateRoomDto,
  ) {
    const result = await this.roomsService.create(
      hotelId,
      dto.roomNumber,
      dto.type,
    );
    if (!result.isSuccess) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }

  @Get(':hotelId')
  async getById(@Param('hotelId') hotelId: string) {
    const resultGetById = await this.hotelsService.getById(hotelId);
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
