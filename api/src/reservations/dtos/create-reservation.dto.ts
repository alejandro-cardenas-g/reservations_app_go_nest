import { IsDateString, IsUUID, Validate } from 'class-validator';
import { CheckOutAfterCheckInConstraint } from './checkoutAfterCheckIn.validator';
import { IsGreaterThanTodayConstraint } from './isGreaterThanToday.validator';

export class CreateReservationDto {
  @IsUUID()
  roomId: string;

  @IsDateString()
  @Validate(IsGreaterThanTodayConstraint)
  checkIn: string;

  @IsDateString()
  @Validate(CheckOutAfterCheckInConstraint)
  checkOut: string;
}
