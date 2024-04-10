import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { join } from 'path';
import { BACKEND_URL } from '../../constants/jwt';
import { ConfigService } from '@nestjs/config';

// public/images/:postId/imageId.jpg
@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}
  async upload(path: string, images: Express.Multer.File[]) {
    const basePath = join(__dirname, '..', '..', '..', 'public', 'images');
    const backendUrl = this.configService.get(
      BACKEND_URL,
      'http://localhost:8080',
    );

    const urls: string[] = [];
    for (const image of images) {
      const name = uuidv4() + '.jpg';
      await fs.promises.mkdir(basePath + '/' + path);
      await fs.promises.writeFile(
        basePath + '/' + path + '/' + name,
        image.buffer,
      );
      urls.push(`${backendUrl}/public/images/${path}/${name}`);
    }

    return urls;
  }
}
