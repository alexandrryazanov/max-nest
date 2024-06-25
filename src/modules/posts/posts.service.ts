import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { StorageService } from '../storage/storage.service';
import { AVAILABLE_IMAGE_TYPES } from './posts.constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private storageService: StorageService,
  ) {}

  async getPostById(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        description: true,
        authorId: true,
        images: true,
        tags: { select: { name: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('No such post');
    }

    return { ...post, tags: post.tags.map((t) => t.name) };
  }

  async getAlLPosts(limit: number = 30, offset: number = 0, search?: string) {
    const where: Prisma.PostWhereInput = {
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const amount = await this.prisma.post.count({ where });
    const list = await this.prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        tags: { select: { name: true } },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return {
      amount,
      list: list.map((item) => ({
        ...item,
        tags: item.tags.map((t) => t.name),
      })),
    };
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

    const result = await this.prisma.post.delete({
      where: { id: postId },
    });
    await this.storageService.deleteDirectory(String(postId));

    return result;
  }

  async create(
    authorId: number,
    {
      title,
      description,
      images,
      tags,
    }: CreatePostDto & { images: Express.Multer.File[] },
  ) {
    let post = await this.prisma.post.create({
      data: {
        title,
        description,
        authorId,
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        tags: { select: { name: true } },
      },
    });

    for (const image of images) {
      if (!AVAILABLE_IMAGE_TYPES[image.mimetype]) {
        throw new BadRequestException(
          `Wrong file type of ${image.originalname}`,
        );
      }
    }

    const urls = await this.storageService.upload(String(post.id), images);

    post = await this.prisma.post.update({
      where: { id: post.id },
      data: {
        images: urls,
      },
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        tags: { select: { name: true } },
      },
    });

    return { ...post, tags: post.tags.map((t) => t.name) };
  }

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
