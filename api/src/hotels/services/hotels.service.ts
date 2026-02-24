import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { Hotel } from '../entities/hotel.entity';
import { HotelsRepository } from '../repositories/hotels.repository';
import { IGetWholeHotelResult } from '../contracts/hotels.contracts';
import { SearchHotelsDto } from '../dtos/searchHotels.dto';
import { HotelResult } from '../utils/hotelResult';

@Injectable()
export class HotelsService {
  constructor(private readonly hotelsRepository: HotelsRepository) {}

  async list(query: SearchHotelsDto): Promise<IGetWholeHotelResult[]> {
    const { locationId, search, nextId } = query;
    return (
      await this.hotelsRepository.findAll(locationId, search, nextId)
    ).map((hotel) => HotelResult.fromEntity(hotel));
  }

  async getById(hotelId: string): Promise<TResult<Hotel>> {
    const hotel = await this.hotelsRepository.getById(hotelId);
    if (!hotel) {
      return Result.Failure('hotel not found', 'RESOURCE_NOT_FOUND');
    }
    return Result.Success(hotel);
  }

  async getWholeById(hotelId: string): Promise<TResult<IGetWholeHotelResult>> {
    const hotel = await this.hotelsRepository.getWholeById(hotelId);
    if (!hotel) {
      return Result.Failure('hotel not found', 'RESOURCE_NOT_FOUND');
    }
    return Result.Success(HotelResult.fromEntity(hotel));
  }
}
