import { HttpException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { join } from 'path';
import { BACKEND_URL } from '../../constants/jwt';
import { ConfigService } from '@nestjs/config';
import { AVAILABLE_IMAGE_TYPES } from '../posts/posts.constants';

// public/images/:postId/imageId.jpg
@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}

  async deleteDirectory(path: string) {
    const dirPath = join(__dirname, '..', '..', '..', 'public', 'images', path);

    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    } catch (e) {
      console.log(e);
      throw new HttpException("Couldn't remove files", 500);
    }
  }

  async upload(path: string, images: Express.Multer.File[]) {
    const basePath = join(__dirname, '..', '..', '..', 'public', 'images');
    const backendUrl = this.configService.get(
      BACKEND_URL,
      'http://localhost:8080',
    );

    const urls: string[] = [];
    for (const image of images) {
      const name = uuidv4() + '.' + AVAILABLE_IMAGE_TYPES[image.mimetype];
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
