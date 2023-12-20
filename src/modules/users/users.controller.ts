import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UserId } from '../../decorators/user-id.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO:
  // X 1. expired tokens
  // X 2. refreshToken
  // X 3. connect DB
  // X 4. user registration
  // X 5. save encrypted password
  // X 6. login EP (look for user with login and encrypt received pwd and check it with saved in db )
  // X 7. congig service
  // 8. admin user who can get all users
  // 9. get my user info
  // 10. validate DTO

  @Get('/verify')
  @UseGuards(AuthGuard)
  verify(@UserId() userId: number) {
    return 'True';
  }

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Post('register')
  async register(
    @Body()
    dto: {
      name: string;
      age: number;
      email: string;
      password: string;
    },
  ) {
    return this.usersService.register(dto);
  }

  @Post('/login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.usersService.login(
      body.email,
      body.password,
    );
    response.cookie('refreshToken', refreshToken, { httpOnly: true });
    return { accessToken };
  }

  @Post('/refresh')
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const { accessToken, refreshToken } = await this.usersService.refresh(
      request.cookies['refreshToken'],
    );
    response.cookie('refreshToken', refreshToken, { httpOnly: true });
    return { accessToken };
  }
}
