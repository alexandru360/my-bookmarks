import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Op } from 'sequelize';
import { Bookmark } from './bookmark.model';
import { Category } from '../categories/category.model';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark) private bookmarkModel: typeof Bookmark,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(userId: number, dto: CreateBookmarkDto): Promise<Bookmark> {
    this.logger.info('Creating bookmark', { userId, url: dto.url });
    const bookmark = await this.bookmarkModel.create({ ...dto, userId } as any);
    return this.findOne(bookmark.id, userId);
  }

  findAll(userId: number, search?: string, categoryId?: number): Promise<Bookmark[]> {
    const where: any = { userId };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where[Op.or as any] = [
        { title: { [Op.like]: `%${search}%` } },
        { url: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } },
      ];
    }
    return this.bookmarkModel.findAll({
      where,
      include: [{ model: Category, required: false }],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number, userId: number): Promise<Bookmark> {
    const bookmark = await this.bookmarkModel.findOne({
      where: { id, userId },
      include: [{ model: Category, required: false }],
    });
    if (!bookmark) throw new NotFoundException(`Bookmark #${id} not found`);
    return bookmark;
  }

  async update(id: number, userId: number, dto: UpdateBookmarkDto): Promise<Bookmark> {
    const bookmark = await this.findOne(id, userId);
    await bookmark.update(dto);
    this.logger.info('Bookmark updated', { id, userId });
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const bookmark = await this.findOne(id, userId);
    await bookmark.destroy();
    this.logger.info('Bookmark deleted', { id, userId });
  }

  findAllForUser(userId: number): Promise<Bookmark[]> {
    return this.bookmarkModel.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  }

  async bulkCreate(userId: number, bookmarks: Partial<Bookmark>[]): Promise<number> {
    const records = bookmarks.map(b => ({ ...b, userId }));
    await this.bookmarkModel.bulkCreate(records as any[], { ignoreDuplicates: true });
    return records.length;
  }
}
