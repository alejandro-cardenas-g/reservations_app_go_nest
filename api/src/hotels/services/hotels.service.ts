import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { Hotel } from '../entities/hotel.entity';
import { HotelsRepository } from '../repositories/hotels.repository';

@Injectable()
export class HotelsService {
  constructor(private readonly hotelsRepository: HotelsRepository) {}

  async list(location?: string): Promise<Hotel[]> {
    return this.hotelsRepository.findAll(location);
  }

  async getById(hotelId: string): Promise<TResult<Hotel>> {
    const hotel = await this.hotelsRepository.getById(hotelId);
    if (!hotel) {
      return Result.Failure('hotel not found', 'RESOURCE_NOT_FOUND');
    }
    return Result.Success(hotel);
  }
}
