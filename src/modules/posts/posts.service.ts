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
import { GetAllPostsDto } from './dto/get-all-posts.dto';

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
        author: true,
        images: true,
        tags: { select: { name: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('No such post');
    }

    return { ...post, tags: post.tags.map((t) => t.name) };
  }

  // sort=+id sort=-title
  async getAlLPosts(
    { limit, offset, search, sort, title, description, tags }: GetAllPostsDto,
    userId?: number,
  ) {
    const order = sort?.substring(0, 1) === '-' ? 'desc' : 'asc';
    const field = sort?.substring(0, 1) === '-' ? sort.slice(1) : sort;

    const whereSearch: Prisma.PostWhereInput = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
      ...(tags?.length && {
        AND: tags.map((tag) => ({ tags: { some: { name: tag } } })),
      }),
    };

    const whereTitleOrDesc: Prisma.PostWhereInput = {
      title: { contains: title, mode: 'insensitive' },
      description: { contains: description, mode: 'insensitive' },
      ...(tags?.length && {
        AND: tags.map((tag) => ({ tags: { some: { name: tag } } })),
      }),
    };

    const where = {
      authorId: userId,
      ...(search ? whereSearch : whereTitleOrDesc),
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
        author: { select: { name: true, email: true, id: true } },
      },
      take: limit,
      skip: offset,
      orderBy: !sort ? { createdAt: 'desc' } : { [field]: order },
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

    const amount = await this.prisma.comment.count({
      where: { postId },
    });

    const list = await this.prisma.comment.findMany({
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

    return { amount, list };
  }

  async getAllTags(limit: number = 30, offset: number = 0) {
    const amount = await this.prisma.tag.count();
    const list = await this.prisma.tag.findMany({
      select: {
        name: true,
        id: true,
      },
      take: limit,
      skip: offset,
    });

    return {
      amount,
      list,
    };
  }

  async addPostComment(postId: number, userId: number, text: string) {
    return this.prisma.comment.create({
      data: {
        authorId: userId,
        postId,
        text,
      },
    });
  }

  async deletePostCommentById(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('No such comment');

    const user = await this.userService.getUserInfo(userId);

    if (userId !== comment.authorId && !user.isAdmin) {
      throw new ForbiddenException('This is not your comment');
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
