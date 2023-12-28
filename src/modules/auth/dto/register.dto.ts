import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(10)
  @Max(100)
  age: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
