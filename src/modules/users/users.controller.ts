import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UserId } from '../../decorators/user-id.decorator';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO:
  // 1. expired tokens
  // 2. refreshToken
  // 3. connect DB
  // 4. user registration
  // 5. save encrypted password
  // 6. login EP (look for user with login and encrypt received pwd and check it with saved in db )

  @Get()
  @UseGuards(AuthGuard)
  getHello(@UserId() userId: number) {
    return this.usersService.getHello(userId);
  }

  @Get('/login')
  login() {
    const payload = {
      sub: 10,
      name: 'Alex',
      age: 32,
    };

    const token = jwt.sign(payload, 'hubabuba');

    return token;
  }
}
