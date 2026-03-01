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
import { OutboxRepositoryCreator } from 'src/outbox/repositories/outbox.repository';
import { ReservationEvents } from '../types/reservation-events';

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
          const outboxRepo = OutboxRepositoryCreator.Create(manager);

          const result = await repo
            .createQueryBuilder()
            .insert()
            .into(Reservation)
            .values({
              guestId: guestId,
              roomId: roomId,
              checkIn: checkIn,
              checkOut: checkOut,
              status: 'PENDING',
              expiresAt: () => "now() + interval '10 minutes'",
            })
            .returning('*')
            .execute();

          const reservation = result.generatedMaps[0] as Reservation;

          await outboxRepo.publish({
            aggregateType: 'reservation',
            aggregateId: reservation.id,
            eventType: 'reservation_created' satisfies ReservationEvents,
            payload: {
              reservationId: reservation.id,
              roomId: reservation.roomId,
              guestId: reservation.guestId,
              checkIn: reservation.checkIn,
              checkOut: reservation.checkOut,
              expiresAt: reservation.expiresAt,
              status: reservation.status,
            },
          });

          return Result.Success({
            id: reservation.id,
            status: 'PENDING',
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

  async cancelReservation(
    id: string,
    guestId: string,
  ): Promise<TResult<boolean>> {
    try {
      return await this.manager.transaction(async (manager) => {
        const repo = manager.getRepository(Reservation);
        const outboxRepo = OutboxRepositoryCreator.Create(manager);

        const result = await repo.update(
          { id, guestId },
          { status: 'CANCELLED' },
        );

        if (result.affected === 0) {
          return Result.Failure('reservation not found', 'RESOURCE_NOT_FOUND');
        }

        await outboxRepo.publish({
          aggregateType: 'reservation',
          aggregateId: id,
          eventType: 'reservation_cancelled' satisfies ReservationEvents,
          payload: {
            reservationId: id,
            guestId: guestId,
          },
        });

        return Result.Success(true);
      });
    } catch {
      return Result.Failure(
        'an error occurred while creating the reservation',
        'UNEXPECTED_ERROR',
      );
    }
  }
}
