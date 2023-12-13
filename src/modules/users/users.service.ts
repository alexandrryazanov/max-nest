import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXPIRES_IN, JWT_SECRET_KEY } from 'src/constants/jwt';
import { PrismaService } from 'src/prisma.service';
import { TokenPayload } from 'src/types/jwt';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private secretKey = this.configService.get(JWT_SECRET_KEY, 'secret');

  async getAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, age: true, email: true },
    });
  }

  async login(email: string, password: string) {
    return this.generateTokensPair({ sub: 10 });
  }

  async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      return this.generateTokensPair({ sub: decoded.sub });
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }

  private generateTokensPair(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.secretKey, {
      expiresIn: EXPIRES_IN.ACCESS,
    });
    const refreshToken = jwt.sign(payload, this.secretKey, {
      expiresIn: EXPIRES_IN.REFRESH,
    });

    return { accessToken, refreshToken };
  }
}
