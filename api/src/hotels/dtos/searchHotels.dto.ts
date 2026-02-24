import { Type } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class SearchHotelsDto {
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  locationId?: number;

  @IsString()
  @IsOptional()
  @MinLength(2)
  search?: string;

  @IsOptional()
  @IsUUID('7', { message: 'nextId must be a valid id' })
  nextId?: string;
}
