import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateConverter } from '../utils/dateConverter.util';

@ValidatorConstraint({ name: 'IsGreaterThanToday', async: false })
export class IsGreaterThanTodayConstraint implements ValidatorConstraintInterface {
  validate(_: string, args: ValidationArguments) {
    const input = args.value as unknown as string;
    if (!input) return true;
    const checkInDate = DateConverter.FromISO8601(input);
    return new Date() <= checkInDate;
  }

  defaultMessage() {
    return 'value must not in the past';
  }
}
