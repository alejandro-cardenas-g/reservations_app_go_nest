import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../../hotels/repositories/rooms.repository';
import {
  ICheckAvailability,
  IReservation,
  IReservationCreated,
} from '../contracts/reservations.contracts';
import { GetReservationsDto } from '../dtos/get-reservations.dto';
import { ReservationsRepository } from '../repositories/reservations.repository';
import { ReservationResultUtil } from '../utils/reservationResult.util';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async checkAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<TResult<ICheckAvailability>> {
    const room = await this.roomsRepository.getById(roomId);
    if (!room) {
      return Result.Failure('Room not found', 'RESOURCE_NOT_FOUND');
    }
    const isAvailable = await this.reservationsRepository.isRoomAvailable(
      roomId,
      checkIn,
      checkOut,
    );
    return Result.Success({ isAvailable });
  }

  async create(
    guestId: string,
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<TResult<IReservationCreated>> {
    const room = await this.roomsRepository.getById(roomId);
    if (!room) {
      return Result.Failure('Room not found', 'RESOURCE_NOT_FOUND');
    }
    const result = await this.reservationsRepository.createReservation(
      roomId,
      guestId,
      checkIn,
      checkOut,
    );
    if (!result.isSuccess) {
      return result;
    }
    return Result.Success(result.value);
  }

  async getById(id: string, guestId: string): Promise<TResult<IReservation>> {
    const reservation = await this.reservationsRepository.findByIdAndGuestId(
      id,
      guestId,
    );
    if (!reservation) {
      return Result.Failure('Reservation not found', 'RESOURCE_NOT_FOUND');
    }
    return Result.Success(ReservationResultUtil.fromEntity(reservation));
  }

  async listByGuest(
    guestId: string,
    dto: GetReservationsDto,
  ): Promise<IReservation[]> {
    const reservations = await this.reservationsRepository.findByGuestId(
      guestId,
      dto,
    );
    return reservations.map((reservation) =>
      ReservationResultUtil.fromEntity(reservation),
    );
  }

  async cancel(id: string, guestId: string): Promise<TResult<boolean>> {
    const result = await this.reservationsRepository.cancelReservation(
      id,
      guestId,
    );
    return result;
  }
}
