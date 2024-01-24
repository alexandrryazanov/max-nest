import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(30)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(200)
  description?: string;
}
