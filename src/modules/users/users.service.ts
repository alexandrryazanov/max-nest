import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EXPIRES_IN, JWT_SECRET_KEY } from '../../constants/jwt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private secretKey = this.configService.get(JWT_SECRET_KEY, 'secret');

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

  async getAllUsers(limit: number = 10, offset: number = 0) {
    const amount = await this.prisma.user.count();
    const list = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        isAdmin: true,
      },
      take: limit,
      skip: offset,
      orderBy: { id: 'asc' },
    });

    return { amount, list };
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

  async changeUserEmail(email: string) {
    const magicToken = this.jwtService.sign(
      { email },
      {
        secret: this.secretKey,
        expiresIn: EXPIRES_IN.MAGIC_TOKEN,
      },
    );
    const magicLink =
      'http://localhost:3000/profile/changemail?magicToken=' + magicToken;
    console.log(magicLink);
  }

  async confirmUserEmail(magicToken: string, userId: number) {
    try {
      const { email } = this.jwtService.verify(magicToken, {
        secret: this.secretKey,
      });
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          email,
        },
      });
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(e);
    }
  }
}
