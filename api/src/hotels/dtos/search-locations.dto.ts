import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class SearchLocationsDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  nextId?: number;
}
