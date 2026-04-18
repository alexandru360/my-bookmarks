import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  create(@Req() req: any, @Body() dto: CreateCategoryDto) {
    return this.svc.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  findAll(@Req() req: any) {
    return this.svc.findAll(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Body() dto: CreateCategoryDto) {
    return this.svc.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.svc.remove(id, req.user.id);
  }
}
