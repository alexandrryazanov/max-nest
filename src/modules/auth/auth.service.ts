import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXPIRES_IN, JWT_SECRET_KEY } from '../../constants/jwt';
import { PrismaService } from '../../prisma.service';
import { TokenPayload } from '../../types/jwt';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  hashPassword(password: string, salt: string) {
    return pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
  }

  private secretKey = this.configService.get(JWT_SECRET_KEY, 'secret');

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

    return this.generateTokensPair({ sub: user.id, isAdmin: user.isAdmin });
  }

  async refresh(token: string) {
    if (!token) {
      throw new UnauthorizedException('No token in cookie');
    }

    try {
      const decoded = this.jwtService.verify(token, this.secretKey);
      return this.generateTokensPair({ sub: decoded.sub });
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }

  private generateTokensPair(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.secretKey,
      expiresIn: EXPIRES_IN.ACCESS,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.secretKey,
      expiresIn: EXPIRES_IN.REFRESH,
    });

    return { accessToken, refreshToken };
  }
}
