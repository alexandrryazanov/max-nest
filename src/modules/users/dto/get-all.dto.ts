import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAllUsersDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Max(100)
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  offset?: number;
}
