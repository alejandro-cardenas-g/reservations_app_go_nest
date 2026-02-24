import {
  IsDateString,
  IsUUID,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'CheckOutAfterCheckIn', async: false })
export class CheckOutAfterCheckInConstraint implements ValidatorConstraintInterface {
  validate(checkOut: string, args: ValidationArguments) {
    const dto = args.object as CreateReservationDto;
    if (!dto.checkIn || !checkOut) return true;
    return new Date(checkOut) > new Date(dto.checkIn);
  }

  defaultMessage() {
    return 'checkOut must be after checkIn';
  }
}

export class CreateReservationDto {
  @IsUUID()
  roomId: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  @Validate(CheckOutAfterCheckInConstraint)
  checkOut: string;
}
