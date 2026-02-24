import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'CheckOutAfterCheckIn', async: false })
export class CheckOutAfterCheckInConstraint implements ValidatorConstraintInterface {
  validate(checkOut: string, args: ValidationArguments) {
    const dto = args.object as unknown as { checkIn: string; checkOut: string };
    if (!dto.checkIn || !checkOut) return true;
    const checkInDate = new Date(dto.checkIn);
    return new Date(checkOut) > checkInDate;
  }

  defaultMessage() {
    return 'checkOut must be after checkIn';
  }
}
