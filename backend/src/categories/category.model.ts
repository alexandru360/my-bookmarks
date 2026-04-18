import { Column, Model, Table, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table({ tableName: 'categories' })
export class Category extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: '#7c3aed' })
  color: string;

  @Column({ type: DataType.STRING, allowNull: true })
  icon: string;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt createdAt: Date;
  @UpdatedAt updatedAt: Date;
}
