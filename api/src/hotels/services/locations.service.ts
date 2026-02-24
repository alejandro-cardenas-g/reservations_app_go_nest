import { Injectable } from '@nestjs/common';
import { LocationsRepository } from '../repositories/locations.repository';
import { Location } from '../entities/locations.entity';

@Injectable()
export class LocationsService {
  constructor(private readonly locationsRepository: LocationsRepository) {}

  async list(search?: string, nextId?: number): Promise<Location[]> {
    return this.locationsRepository.search(nextId, search);
  }
}
