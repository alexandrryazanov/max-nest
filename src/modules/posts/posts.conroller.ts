import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PostsService } from './posts.service';
import { UserId } from '../../decorators/user-id.decorator';

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

  @Delete(':id')
  @UseGuards(AuthGuard)
  deletePostById(
    @Param('id', ParseIntPipe) postId: number,
    @UserId() userId: number,
  ) {
    return this.postsService.deletePostById(postId, userId);
  }
}

//TODO:
// Х GET /posts?limit=10&offset=0
// Х GET /posts/1
// О GET /posts/1/comments?limit=100&offset=0
