import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(@Query() { limit, offset }: GetAllPostsDto) {
    return this.postsService.getAlLPosts(limit, offset);
  }

  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images'))
  createPost(
    @Body() { title, description }: CreatePostDto,
    @UserId() userId: number,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ) {
    return this.postsService.create(userId, { title, description, images });
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
}

//TODO:
// X GET /posts?limit=10&offset=0
// X GET /posts/2
// GET /posts/2/comments?limit=100&offset=0
