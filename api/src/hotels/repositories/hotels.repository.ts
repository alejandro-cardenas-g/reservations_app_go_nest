import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../entities/hotel.entity';

@Injectable()
export class HotelsRepository extends Repository<Hotel> {
  constructor(
    @InjectRepository(Hotel, DB_CONNECTIONS.MAIN)
    dataAccess: Repository<Hotel>,
  ) {
    super(Hotel, dataAccess.manager, dataAccess.queryRunner);
  }

  findAll(
    locationId?: number,
    search?: string,
    nextId?: string,
  ): Promise<Hotel[]> {
    const qb = this.createQueryBuilder('h')
      .select(['h.id', 'h.name', 'h.locationId', 'l.name', 'l.id'])
      .leftJoin('h.location', 'l');

    if (locationId) {
      qb.andWhere('h.locationId = :locationId', {
        locationId,
      });
    }
    if (search) {
      qb.andWhere('h.name ILIKE :search', { search: `%${search}%` });
    }
    if (nextId) {
      qb.andWhere('h.id > :nextId', { nextId });
    }
    return qb.orderBy('h.id', 'ASC').limit(10).getMany();
  }

  getById(id: string): Promise<Hotel | null> {
    return this.findOne({
      where: { id },
    });
  }

  getWholeById(id: string): Promise<Hotel | null> {
    return this.findOne({
      where: { id },
      relations: ['location'],
    });
  }
}
