import { Column, Model, Table, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Category } from '../categories/category.model';

@Table({ tableName: 'bookmarks' })
export class Bookmark extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  categoryId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  url: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  tags: string;

  @Column({ type: DataType.STRING, allowNull: true })
  favicon: string;

  @BelongsTo(() => Category)
  category: Category;

  @CreatedAt createdAt: Date;
  @UpdatedAt updatedAt: Date;
}
