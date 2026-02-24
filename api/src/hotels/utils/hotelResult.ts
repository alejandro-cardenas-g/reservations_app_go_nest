import { IGetWholeHotelResult } from '../contracts/hotels.contracts';
import { Hotel } from '../entities/hotel.entity';

export class HotelResult {
  static fromEntity(hotel: Hotel): IGetWholeHotelResult {
    return {
      id: hotel.id,
      name: hotel.name,
      location: {
        id: hotel.locationId,
        name: hotel.location.name,
      },
    };
  }
}
