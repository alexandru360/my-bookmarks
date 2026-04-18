import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async findOrCreate(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
  }): Promise<User> {
    const [user] = await this.userModel.findOrCreate({
      where: { googleId: profile.googleId },
      defaults: profile,
    });
    // Update name/avatar if changed
    await user.update({ name: profile.name, avatar: profile.avatar, email: profile.email });
    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }
}
