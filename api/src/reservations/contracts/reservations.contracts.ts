import { ReservationStatus } from '../types/reservation-status';

export interface IReservationCreated {
  id: string;
  status: ReservationStatus;
}

export interface ICheckAvailability {
  isAvailable: boolean;
}
