import { Controller, Get, Query } from '@nestjs/common';
import { SearchLocationsDto } from '../dtos/search-locations.dto';
import { LocationsService } from '../services/locations.service';

@Controller({
  path: 'locations',
  version: '1',
})
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async list(@Query() dto: SearchLocationsDto) {
    return this.locationsService.list(dto.search, dto.nextId);
  }
}
