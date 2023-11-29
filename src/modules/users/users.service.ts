import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getHello(userId: number): string {
    return 'Hello USER ' + userId;
  }
}
