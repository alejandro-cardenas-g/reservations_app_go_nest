import { Transform } from 'class-transformer';
import { isBoolean, IsBoolean, isBooleanString } from 'class-validator';
import { CommonFilterValueDto } from './common-filter-values.dto';

export class BooleanFilterValueDto<
  F extends string,
> extends CommonFilterValueDto<boolean, F> {
  @IsBoolean()
  @Transform(({ value }) => {
    if (isBooleanString(value)) return JSON.parse(value as string) as boolean;
    if (isBoolean(value)) return value;
    return undefined;
  })
  declare value: boolean;
}
