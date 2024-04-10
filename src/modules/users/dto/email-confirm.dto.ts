import {
  IsEmail,
  IsInt,
  IsJWT,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EmailConfirmDto {
  @IsJWT()
  magicToken: string;
}
