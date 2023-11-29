import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class AuthGuard implements CanActivate {
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
      const decoded = jwt.verify(token, 'hubabuba');
      // add userId to req
      request['userId'] = decoded.sub;

      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
