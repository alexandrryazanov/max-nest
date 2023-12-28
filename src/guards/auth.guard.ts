import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { JWT_SECRET_KEY } from 'src/constants/jwt';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorizationHeader = request.headers.authorization;
    const token = authorizationHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token in headers');
    }

    try {
      const decoded = jwt.verify(token, this.configService.get(JWT_SECRET_KEY));
      // add user info to req
      request['userId'] = decoded.sub;
      request['isAdmin'] = decoded.isAdmin;

      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(e);
    }
  }
}
