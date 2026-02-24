import { RoomType } from 'src/hotels/types/room-type';
import { ReservationStatus } from '../types/reservation-status';

export interface IReservationCreated {
  id: string;
  status: ReservationStatus;
}

export interface ICheckAvailability {
  isAvailable: boolean;
}

export interface IReservation {
  id: string;
  status: ReservationStatus;
  checkIn: Date;
  checkOut: Date;
  expiresAt: Date;
  roomNumber: string;
  type: RoomType;
  hotelName: string;
  locationName: string;
}
