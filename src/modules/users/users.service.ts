import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        isAdmin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('No such user');
    }

    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        isAdmin: true,
      },
    });
  }

  async deleteUserById(id: number) {
    const existedUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existedUser) {
      throw new NotFoundException('No such user');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return true;
  }
}
