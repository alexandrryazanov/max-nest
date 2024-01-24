import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PostsService } from './posts.service';
import { PostsController } from './posts.conroller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
})
export class PostsModule {}
