import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PostsService } from './posts.service';
import { UserId } from '../../decorators/user-id.decorator';
import { GetPostCommentsDto } from './dto/get-post-comments.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { GetAllTagsDto } from './dto/get-all-tags.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(
    @Query()
    { limit, offset, search, sort, title, description, tags }: GetAllPostsDto,
  ) {
    return this.postsService.getAlLPosts({
      limit,
      offset,
      search,
      sort,
      title,
      description,
      tags,
    });
  }

  @Get('/my')
  @UseGuards(AuthGuard)
  getMyPosts(
    @UserId() userId: number,
    @Query()
    { limit, offset, search, sort, title, description }: GetAllPostsDto,
  ) {
    return this.postsService.getAlLPosts(
      {
        limit,
        offset,
        search,
        sort,
        title,
        description,
      },
      userId,
    );
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  createPost(
    @Body() { title, description, tags }: CreatePostDto,
    @UserId() userId: number,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100000000000 })],
      }),
    )
    images: Express.Multer.File[],
  ) {
    return this.postsService.create(userId, {
      title,
      description,
      images,
      tags,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deletePostById(
    @Param('id', ParseIntPipe) postId: number,
    @UserId() userId: number,
  ) {
    return this.postsService.deletePostById(postId, userId);
  }

  @Get(':id/comments')
  getPostCommentsById(
    @Query() { limit, offset }: GetPostCommentsDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.getPostCommentsById(id, limit, offset);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  addPostComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() { text }: AddCommentDto,
    @UserId() userId: number,
  ) {
    return this.postsService.addPostComment(id, userId, text);
  }

  @Delete('/comments/:id')
  @UseGuards(AuthGuard)
  deletePostCommentById(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ) {
    return this.postsService.deletePostCommentById(id, userId);
  }

  @Get('/tags')
  getAllTags(@Query() { limit, offset }: GetAllTagsDto) {
    return this.postsService.getAllTags(limit, offset);
  }
}
