import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXPIRES_IN, JWT_SECRET_KEY } from 'src/constants/jwt';
import { PrismaService } from 'src/prisma.service';
import { TokenPayload } from 'src/types/jwt';
import { randomBytes, pbkdf2Sync } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private hashPassword(password: string, salt: string) {
    return pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  }

  private secretKey = this.configService.get(JWT_SECRET_KEY, 'secret');

  async getAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, age: true, email: true },
    });
  }

  async register({ name, age, email, password }: any) {
    const existedUser = await this.prisma.user.findUnique({ where: { email } });

    if (existedUser) {
      throw new BadRequestException('User with such email already exists');
    }

    const salt = randomBytes(32).toString('hex');

    await this.prisma.user.create({
      data: {
        name,
        age,
        email,
        password: this.hashPassword(password, salt),
        salt,
      },
    });

    return true;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('No such user or password incorrect');
    }

    const hashedPassword = this.hashPassword(password, user.salt);

    if (user.password !== hashedPassword) {
      throw new BadRequestException('No such user or password incorrect');
    }

    return this.generateTokensPair({ sub: user.id });
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
