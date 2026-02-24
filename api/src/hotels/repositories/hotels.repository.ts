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

  findAll(location?: string): Promise<Hotel[]> {
    const qb = this.createQueryBuilder('h').orderBy('h.name', 'ASC');
    if (location?.trim()) {
      qb.andWhere('h.location = :location', {
        location: location.trim().toLowerCase(),
      });
    }
    return qb.getMany();
  }

  getById(id: string): Promise<Hotel | null> {
    return this.findOne({
      where: { id },
    });
  }
}
