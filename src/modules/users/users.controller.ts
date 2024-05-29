import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UserId } from '../../decorators/user-id.decorator';
import { AdminGuard } from '../../guards/admin.guard';
import { GetAllUsersDto } from './dto/get-all.dto';
import { EmailChangeDto } from './dto/email-change.dto';
import { EmailConfirmDto } from './dto/email-confirm.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { getMeResponse } from './dto/get-me.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse(getMeResponse)
  @ApiBearerAuth('accessToken')
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

  @Post('me/email/change')
  @UseGuards(AuthGuard)
  async emailChange(@Body() body: EmailChangeDto) {
    await this.usersService.changeUserEmail(body.email);
    return;
  }

  @Post('me/email/confirm')
  @UseGuards(AuthGuard)
  async emailConfirm(@Body() body: EmailConfirmDto, @UserId() userId: number) {
    return await this.usersService.confirmUserEmail(body.magicToken, userId);
  }
}
