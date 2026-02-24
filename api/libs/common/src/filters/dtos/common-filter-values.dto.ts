import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';
import { EFilterOperators } from '../constants';
import { Type } from 'class-transformer';

export class CommonFilterValueDto<T, F extends string = string> {
  @IsString()
  field: F;

  @IsDefined()
  value: T;

  @IsEnum(EFilterOperators)
  @Type(() => Number)
  @IsOptional()
  operator?: EFilterOperators;
}
