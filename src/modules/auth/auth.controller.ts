import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';
import { COOKIE_OPTIONS } from '../../constants/cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: AuthService) {}

  //TODO:
  // X 1. expired tokens
  // X 2. refreshToken
  // X 3. connect DB
  // X 4. user registration
  // X 5. save encrypted password
  // X 6. login EP (look for user with login and encrypt received pwd and check it with saved in db )
  // X 7. config service
  // X 8. admin user who can get all users
  // X 9. get my user info
  // X 10. validate DTO
  //  11. pagination

  @Post('register')
  async register(
    @Body()
    dto: RegisterUserDto,
  ) {
    return this.usersService.register(dto);
  }

  @Post('login')
  async login(
    @Body() body: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.usersService.login(
      body.email,
      body.password,
    );
    response.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const { accessToken, refreshToken } = await this.usersService.refresh(
      request.cookies['refreshToken'],
    );
    response.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    return { accessToken };
  }
}
