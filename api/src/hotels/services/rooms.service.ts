import { Result, TResult } from '@app/common/classes';
import { ConflictException, Injectable } from '@nestjs/common';
import { Room } from '../entities/room.entity';
import { HotelsRepository } from '../repositories/hotels.repository';
import { RoomsRepository } from '../repositories/rooms.repository';
import { RoomType } from '../types/room-type';

@Injectable()
export class RoomsService {
  constructor(
    private readonly hotelsRepository: HotelsRepository,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  async listByHotel(
    hotelId: string,
    type?: RoomType,
  ): Promise<TResult<Room[]>> {
    const hotel = await this.hotelsRepository.getById(hotelId);
    if (!hotel) {
      return Result.Failure('Hotel not found', 'RESOURCE_NOT_FOUND');
    }
    const rooms = await this.roomsRepository.findByHotelId(hotelId, type);
    return Result.Success(rooms);
  }

  async create(
    hotelId: string,
    roomNumber: string,
    type: RoomType,
  ): Promise<TResult<Room>> {
    const hotel = await this.hotelsRepository.getById(hotelId);
    if (!hotel) {
      return Result.Failure('Hotel not found', 'RESOURCE_NOT_FOUND');
    }
    const exists = await this.roomsRepository.existsByHotelIdAndRoomNumber(
      hotelId,
      roomNumber,
    );
    if (exists) {
      throw new ConflictException('Room number already exists for this hotel');
    }
    const room = this.roomsRepository.create({ hotelId, roomNumber, type });
    const saved = await this.roomsRepository.save(room);
    return Result.Success(saved);
  }
}
