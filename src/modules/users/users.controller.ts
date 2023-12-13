import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UsersService } from './users.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UserId } from '../../decorators/user-id.decorator';
import { get } from 'http';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO:
  // 1. expired tokens
  // 2. refreshToken
  // X 3. connect DB
  // 4. user registration
  // 5. save encrypted password
  // 6. login EP (look for user with login and encrypt received pwd and check it with saved in db )
  // 7. congig service

  @Get('/verify')
  @UseGuards(AuthGuard)
  verify(@UserId() userId: number) {
    return 'True';
  }

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Post('/login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.usersService.login(body.email, body.password);
    response.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    return tokens.accessToken;
  }

  @Post('/refresh')
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const tokens = await this.usersService.refresh(
      request.cookies['refreshToken'],
    );
    response.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    return tokens.accessToken;
  }
}
