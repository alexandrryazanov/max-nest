import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAllPostsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Max(30)
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  offset?: number;
}
