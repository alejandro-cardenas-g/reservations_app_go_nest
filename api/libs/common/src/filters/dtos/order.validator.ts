import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ESortType } from '../constants';

export class OrderValidator {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsEnum(ESortType)
  @IsString()
  @IsNotEmpty()
  type: ESortType;
}
