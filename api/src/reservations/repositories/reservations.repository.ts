import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../types/reservation-status';
import { Result, TResult } from '@app/common/classes';

const ACTIVE_STATUSES: ReservationStatus[] = ['PENDING', 'CONFIRMED'];

@Injectable()
export class ReservationsRepository extends Repository<Reservation> {
  constructor(
    @InjectRepository(Reservation, DB_CONNECTIONS.MAIN)
    dataAccess: Repository<Reservation>,
  ) {
    super(Reservation, dataAccess.manager, dataAccess.queryRunner);
  }

  isRoomAvailable(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<boolean> {
    const qb = this.createQueryBuilder('r')
      .where('r.roomId = :roomId', { roomId })
      .andWhere('r.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .andWhere('r.checkIn < :checkOut', { checkOut })
      .andWhere('r.checkOut > :checkIn', { checkIn });

    return qb.getExists().then((result) => !!result);
  }

  findByGuestId(guestId: string): Promise<Reservation[]> {
    return this.find({
      where: { guestId },
      order: { checkIn: 'DESC' },
      relations: ['room'],
    });
  }

  findByIdAndGuestId(id: string, guestId: string): Promise<Reservation | null> {
    return this.findOne({
      where: { id, guestId },
      relations: ['room'],
    });
  }

  async createReservation(
    roomId: string,
    guestId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<TResult<{ id: string; status: ReservationStatus }>> {
    return this.manager.transaction(async (manager) => {
      const reservationsRepository = manager.getRepository(Reservation);
      const createdAt = new Date();
      const expiresAt = new Date().setMinutes(createdAt.getMinutes() + 10);
      try {
        const reservation = await reservationsRepository.save(
          reservationsRepository.create({
            roomId,
            guestId,
            checkIn,
            checkOut,
            status: 'PENDING',
            expiresAt,
          }),
        );
        return Result.Success({
          id: reservation.id,
          status: reservation.status,
        });
      } catch (exception) {
        if (exception === '23P01') {
          // exclusion constraint violation
          return Result.Failure(
            'Room is not available for selected dates',
            'CONFLICT_ERROR',
          );
        }
        console.error(exception);
        return Result.Failure(
          'an error occurred while creating the reservation',
          'UNEXPECTED_ERROR',
        );
      }
    });
  }
}
