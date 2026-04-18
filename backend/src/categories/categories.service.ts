import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './category.model';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private categoryModel: typeof Category) {}

  create(userId: number, dto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create({ ...dto, userId } as any);
  }

  findAll(userId: number): Promise<Category[]> {
    return this.categoryModel.findAll({ where: { userId }, order: [['name', 'ASC']] });
  }

  async findOne(id: number, userId: number): Promise<Category> {
    const cat = await this.categoryModel.findByPk(id);
    if (!cat) throw new NotFoundException(`Category #${id} not found`);
    if (cat.userId !== userId) throw new ForbiddenException();
    return cat;
  }

  async update(id: number, userId: number, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const cat = await this.findOne(id, userId);
    await cat.update(dto);
    return cat;
  }

  async remove(id: number, userId: number): Promise<void> {
    const cat = await this.findOne(id, userId);
    await cat.destroy();
  }
}
