import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Req, UseGuards,
  ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@ApiTags('bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiOperation({ summary: 'Save a new bookmark' })
  create(@Req() req: any, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: number,
  ) {
    return this.bookmarksService.findAll(req.user.id, search, categoryId ? Number(categoryId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bookmark by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.bookmarksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bookmark' })
  update(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() dto: UpdateBookmarkDto) {
    return this.bookmarksService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bookmark' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.bookmarksService.remove(id, req.user.id);
  }
}
