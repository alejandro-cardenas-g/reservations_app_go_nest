import { IsNumber } from 'class-validator';
import { CommonFilterValueDto } from './common-filter-values.dto';
import { Type } from 'class-transformer';

export class NumberFilterValueDto<
  F extends string,
> extends CommonFilterValueDto<number, F> {
  @IsNumber()
  @Type(() => Number)
  declare value: number;
}
