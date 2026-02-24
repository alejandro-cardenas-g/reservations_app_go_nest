import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/locations.entity';

@Injectable()
export class LocationsRepository extends Repository<Location> {
  constructor(
    @InjectRepository(Location, DB_CONNECTIONS.MAIN)
    dataAccess: Repository<Location>,
  ) {
    super(Location, dataAccess.manager, dataAccess.queryRunner);
  }

  search(nextId?: number, search?: string): Promise<Location[]> {
    const qb = this.createQueryBuilder('l').orderBy('l.name', 'ASC');
    if (search) {
      qb.andWhere('l.name ILIKE :search', { search: `%${search}%` });
    }
    if (nextId) {
      qb.andWhere('l.id > :nextId', { nextId });
    }
    return qb.orderBy('l.id', 'ASC').limit(10).getMany();
  }
}
