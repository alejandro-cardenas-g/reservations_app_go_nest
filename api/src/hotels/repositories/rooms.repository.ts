import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { RoomType } from '../types/room-type';

@Injectable()
export class RoomsRepository extends Repository<Room> {
  constructor(
    @InjectRepository(Room, DB_CONNECTIONS.MAIN)
    dataAccess: Repository<Room>,
  ) {
    super(Room, dataAccess.manager, dataAccess.queryRunner);
  }

  findByHotelId(hotelId: string, type?: RoomType): Promise<Room[]> {
    const qb = this.createQueryBuilder('r')
      .where('r.hotelId = :hotelId', { hotelId })
      .orderBy('r.room_number', 'ASC');
    if (type) {
      qb.andWhere('r.type = :type', { type });
    }
    return qb.getMany();
  }

  getById(id: string): Promise<Room | null> {
    return this.findOne({ where: { id } });
  }

  existsByHotelIdAndRoomNumber(
    hotelId: string,
    roomNumber: string,
  ): Promise<boolean> {
    return this.exists({
      where: { hotelId, roomNumber },
    });
  }
}
