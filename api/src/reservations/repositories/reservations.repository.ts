import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ReservationStatus } from '../types/reservation-status';
import { Result, TResult } from '@app/common/classes';
import {
  EqualFilter,
  GreaterThanFilter,
  LowerThanFilter,
} from '@app/common/filters';
import { FilterQueryBuilder } from '@app/common/database/utils/filterQueryBuilder.util';
import { GetReservationsDto } from '../dtos/get-reservations.dto';
import { AbstractFilter } from '@app/common/filters/abstract.filter';

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

  findByGuestId(
    guestId: string,
    dto: GetReservationsDto,
  ): Promise<Reservation[]> {
    const guestIdFilter = new EqualFilter('r.guestId', guestId);

    const filters: AbstractFilter<Record<string, unknown>, unknown>[] = [
      guestIdFilter,
    ];

    if (dto.checkIn) {
      const checkInFilter = new GreaterThanFilter('r.checkIn', dto.checkIn);
      filters.push(checkInFilter);
    }

    if (dto.status) {
      const statusFilter = new EqualFilter('r.status', dto.status);
      filters.push(statusFilter);
    }

    if (dto.nextId) {
      const nextIdFilter = new LowerThanFilter('r.id', dto.nextId, false);
      filters.push(nextIdFilter);
    }

    const query = new FilterQueryBuilder<Reservation>(
      this.createQueryBuilder('r')
        .select([
          'r.id',
          'r.status',
          'r.checkIn',
          'r.checkOut',
          'r.expiresAt',
          'ro.roomNumber',
          'ro.type',
          'ho.name',
          'lo.name',
        ])
        .innerJoin('r.room', 'ro')
        .innerJoin('ro.hotel', 'ho')
        .innerJoin('ho.location', 'lo'),
    );

    return query.withQuery(filters).orderBy('r.id', 'DESC').getMany();
  }

  findByIdAndGuestId(id: string, guestId: string): Promise<Reservation | null> {
    const guestIdFilter = new EqualFilter('r.guestId', guestId);

    const filters: AbstractFilter<Record<string, unknown>, unknown>[] = [
      guestIdFilter,
      new EqualFilter('r.id', id),
    ];

    const query = new FilterQueryBuilder<Reservation>(
      this.createQueryBuilder('r')
        .select([
          'r.id',
          'r.status',
          'r.checkIn',
          'r.checkOut',
          'r.expiresAt',
          'ro.roomNumber',
          'ro.type',
          'ho.name',
          'lo.name',
        ])
        .innerJoin('r.room', 'ro')
        .innerJoin('ro.hotel', 'ho')
        .innerJoin('ho.location', 'lo'),
    );

    return query.withQuery(filters).getOne();
  }

  async createReservation(
    roomId: string,
    guestId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<TResult<{ id: string; status: ReservationStatus }>> {
    const MAX_RETRY = 3;

    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      try {
        return await this.manager.transaction(async (manager) => {
          const repo = manager.getRepository(Reservation);

          const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

          const reservation = await repo.save(
            repo.create({
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
        });
      } catch (exception) {
        if (exception instanceof QueryFailedError) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const errorCode = exception.driverError.code as string;

          if (errorCode === '40P01') {
            continue; // must retry the entire transaction because of concurrent reservation
          }

          if (errorCode === '23P01') {
            return Result.Failure(
              'room is not available for selected dates',
              'CONFLICT_ERROR',
            );
          }
        }

        console.error(exception);
        return Result.Failure(
          'an error occurred while creating the reservation',
          'UNEXPECTED_ERROR',
        );
      }
    }

    return Result.Failure(
      'an error occurred while creating the reservation',
      'UNEXPECTED_ERROR',
    );
  }
}
