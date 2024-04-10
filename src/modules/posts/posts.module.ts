import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PostsService } from './posts.service';
import { PostsController } from './posts.conroller';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [UsersModule, StorageModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
})
export class PostsModule {}
