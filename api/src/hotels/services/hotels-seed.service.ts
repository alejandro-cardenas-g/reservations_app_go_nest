import { Injectable } from '@nestjs/common';
import { Hotel } from '../entities/hotel.entity';
import { HotelsRepository } from '../repositories/hotels.repository';

const HOTELS_COLOMBIA: Pick<Hotel, 'name' | 'location'>[] = [
  { name: 'Hotel Dann Carlton Bogotá', location: 'Bogotá' },
  { name: 'Hotel Casa San Angel', location: 'Cartagena' },
  { name: 'Sofitel Legend Santa Clara', location: 'Cartagena' },
  { name: 'Hotel Charleston Santa Teresa', location: 'Cartagena' },
  { name: 'Casa del Coliseo', location: 'Cartagena' },
  { name: 'Hotel Movich Las Lomas', location: 'Cali' },
  { name: 'Hotel Spiwak Chipichape', location: 'Cali' },
  { name: 'Hotel Estelar Poblado', location: 'Medellín' },
  { name: 'The Charlee Hotel', location: 'Medellín' },
  { name: 'Hotel Dann Carlton Medellín', location: 'Medellín' },
  { name: 'Hotel Casa del Alferez', location: 'Villa de Leyva' },
  { name: 'Hotel Casa Platypus', location: 'San Gil' },
  { name: 'Eco Hotel El Cantil', location: 'Nuquí' },
  { name: 'Decameron Barú', location: 'Cartagena' },
  { name: 'GHL Hotel Tequendama', location: 'Bogotá' },
];

@Injectable()
export class HotelsSeedService {
  constructor(private readonly hotelsRepository: HotelsRepository) {}

  async run(): Promise<{ created: number }> {
    const existing = await this.hotelsRepository.count();
    if (existing > 0) {
      return { created: 0 };
    }
    const hotels = this.hotelsRepository.create(HOTELS_COLOMBIA);
    await this.hotelsRepository.save(hotels);
    return { created: hotels.length };
  }
}
