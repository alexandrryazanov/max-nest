import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UserId } from '../../decorators/user-id.decorator';
import { AdminGuard } from '../../guards/admin.guard';
import { GetAllUsersDto } from '../auth/dto/get-all.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentInfo(@UserId() userId: number) {
    return this.usersService.getUserInfo(userId);
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  getAllUsers(@Query() { limit, offset }: GetAllUsersDto) {
    return this.usersService.getAllUsers(limit, offset);
  }

  @Get(':id')
  @UseGuards(AuthGuard, AdminGuard)
  getUserInfo(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserInfo(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  deleteUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUserById(id);
  }
}
