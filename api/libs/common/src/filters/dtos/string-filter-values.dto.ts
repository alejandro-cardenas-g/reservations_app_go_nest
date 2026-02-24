import { IsString } from 'class-validator';
import { CommonFilterValueDto } from './common-filter-values.dto';

export class StringFilterValueDto<
  F extends string,
> extends CommonFilterValueDto<string, F> {
  @IsString()
  declare value: string;
}
