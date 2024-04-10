import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}

  async getPostById(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        description: true,
        authorId: true,
      },
    });

    if (!post) {
      throw new NotFoundException('No such post');
    }

    return post;
  }

  async getAlLPosts(limit: number = 30, offset: number = 0) {
    const amount = await this.prisma.post.count();
    const list = await this.prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return { amount, list };
  }

  async deletePostById(postId: number, userId: number) {
    const post = await this.getPostById(postId);
    const user = await this.userService.getUserInfo(userId);

    if (!post || !user) {
      throw new NotFoundException('Not found post or user');
    }

    if (!user.isAdmin && userId !== post.authorId) {
      throw new ForbiddenException('No permission');
    }

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }

  // async create({ title, description }: CreatePostDto) {}

  async getPostCommentsById(
    postId: number,
    limit: number = 30,
    offset: number = 0,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('No such post');
    }

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      select: {
        id: true,
        text: true,
        authorId: true,
        createdAt: true,
      },
      take: limit,
      skip: offset,
    });

    if (!comments.length) {
      throw new NotFoundException(`No comments for post ${postId}`);
    }

    return comments;
  }
}
