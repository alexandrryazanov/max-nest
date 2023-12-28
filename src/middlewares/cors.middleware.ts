import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const envUrls = ['localhost'];

    if (
      envUrls.some((urlPart) => String(req.headers.origin).includes(urlPart))
    ) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
    }
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, ngrok-skip-browser-warning',
    );
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).send();
    } else {
      next();
    }
  }
}
