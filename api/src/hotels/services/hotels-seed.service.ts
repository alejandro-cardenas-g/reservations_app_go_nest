import { Injectable } from '@nestjs/common';
import { Hotel } from '../entities/hotel.entity';
import { HotelsRepository } from '../repositories/hotels.repository';
import { Location } from '../entities/locations.entity';
import { LocationsRepository } from '../repositories/locations.repository';

const HOTELS_COLOMBIA: Pick<Hotel, 'name'>[] = [
  { name: 'Hotel Dann Carlton Bogotá' },
  { name: 'Hotel Casa San Angel' },
  { name: 'Sofitel Legend Santa Clara' },
  { name: 'Hotel Charleston Santa Teresa' },
  { name: 'Casa del Coliseo' },
  { name: 'Hotel Movich Las Lomas' },
  { name: 'Hotel Spiwak Chipichape' },
  { name: 'Hotel Estelar Poblado' },
  { name: 'The Charlee Hotel' },
  { name: 'Hotel Dann Carlton Medellín' },
  { name: 'Hotel Casa del Alferez' },
  { name: 'Hotel Casa Platypus' },
  { name: 'Eco Hotel El Cantil' },
  { name: 'Decameron Barú' },
  { name: 'GHL Hotel Tequendama' },
  { name: 'Hotel El Convento' },
  { name: 'Hotel Casa San Antonio' },
  { name: 'Hotel el amigazo de oro' },
  { name: 'Hotel el carmen' },
  { name: 'Hotel el laurel' },
  { name: 'Hotel el mirador' },
  { name: 'Hotel el palmar' },
  { name: 'Hotel el pinar' },
  { name: 'Hotel el rey' },
  { name: 'Hotel el sol' },
  { name: 'Hotel el toro' },
];

const LOCATIONS_COLOMBIA: Pick<Location, 'name'>[] = [
  { name: 'Bogotá, Colombia' },
  { name: 'Cartagena, Colombia' },
  { name: 'Cali, Colombia' },
  { name: 'Medellín, Colombia' },
  { name: 'Villa de Leyva, Colombia' },
  { name: 'San Gil, Colombia' },
  { name: 'Nuquí, Colombia' },
  { name: 'Santa Marta, Colombia' },
  { name: 'Barranquilla, Colombia' },
  { name: 'Santa Cruz de la Sierra, Bolivia' },
  { name: 'La Paz, Bolivia' },
  { name: 'Cochabamba, Bolivia' },
  { name: 'Oruro, Bolivia' },
  { name: 'Potosí, Bolivia' },
  { name: 'Sucre, Bolivia' },
  { name: 'Tarija, Bolivia' },
  { name: 'Trinidad, Bolivia' },
  { name: 'Cobán, Guatemala' },
  { name: 'Antigua, Guatemala' },
  { name: 'Quetzaltenango, Guatemala' },
  { name: 'Xela, Guatemala' },
  { name: 'Guatemala City, Guatemala' },
  { name: 'Panamá City, Panama' },
  { name: 'David, Panama' },
  { name: 'Santiago, Chile' },
  { name: 'Valparaíso, Chile' },
  { name: 'Santiago, Chile' },
];

@Injectable()
export class HotelsSeedService {
  constructor(
    private readonly hotelsRepository: HotelsRepository,
    private readonly locationsRepository: LocationsRepository,
  ) {}

  async run(): Promise<{ created: number }> {
    const existing = await this.hotelsRepository.count();
    if (existing > 0) {
      return { created: 0 };
    }

    const locations = await this.seedLocations();
    if (locations.length === 0) {
      return { created: 0 };
    }

    const hotels = HOTELS_COLOMBIA.map((hotel) => {
      const random = Math.floor(Math.random() * 100 + 1) % locations.length;
      const location = locations[random];
      return this.hotelsRepository.create({
        name: hotel.name,
        locationId: location?.id,
      });
    });

    await this.hotelsRepository.save(hotels);
    return { created: hotels.length };
  }

  async seedLocations(): Promise<Location[]> {
    const existing = await this.locationsRepository.count();
    if (existing > 0) {
      return [];
    }
    const locations = this.locationsRepository.create(LOCATIONS_COLOMBIA);
    return this.locationsRepository.save(locations);
  }
}
