import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  RESERVATION_STATUSES,
  ReservationStatus,
} from '../types/reservation-status';

export class GetReservationsDto {
  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @IsIn(RESERVATION_STATUSES)
  @IsOptional()
  status?: ReservationStatus;

  @IsUUID('7', { message: 'nextId must be a valid id' })
  @IsOptional()
  nextId?: string;
}
