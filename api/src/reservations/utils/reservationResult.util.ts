import { IReservation } from '../contracts/reservations.contracts';
import { Reservation } from '../entities/reservation.entity';

export class ReservationResultUtil {
  static fromEntity(reservation: Reservation): IReservation {
    return {
      id: reservation.id,
      status: reservation.status,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      expiresAt: reservation.expiresAt,
      roomNumber: reservation.room.roomNumber,
      type: reservation.room.type,
      hotelName: reservation.room.hotel.name,
      locationName: reservation.room.hotel.location.name,
    };
  }
}
