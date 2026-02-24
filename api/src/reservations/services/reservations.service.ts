import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../../hotels/repositories/rooms.repository';
import { Reservation } from '../entities/reservation.entity';
import { ReservationsRepository } from '../repositories/reservations.repository';
import {
  ICheckAvailability,
  IReservationCreated,
} from '../contracts/reservations.contracts';

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

  async getById(id: string, guestId: string): Promise<TResult<Reservation>> {
    const reservation = await this.reservationsRepository.findByIdAndGuestId(
      id,
      guestId,
    );
    if (!reservation) {
      return Result.Failure('Reservation not found', 'RESOURCE_NOT_FOUND');
    }
    return Result.Success(reservation);
  }

  async listByGuest(guestId: string): Promise<Reservation[]> {
    return this.reservationsRepository.findByGuestId(guestId);
  }
}
