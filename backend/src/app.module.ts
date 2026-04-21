import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WinstonModule } from 'nest-winston';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { CategoriesModule } from './categories/categories.module';
import { ImportExportModule } from './import-export/import-export.module';
import { User } from './users/user.model';
import { Bookmark } from './bookmarks/bookmark.model';
import { Category } from './categories/category.model';
import { buildWinstonConfig } from './logger';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';

const dbPath = process.env.DB_PATH || './storage/data/bookmarks.db';
const publicPath = join(__dirname, '..', 'public');

@Module({
  imports: [
    AppConfigModule,
    WinstonModule.forRootAsync({ imports: [AppConfigModule], inject: [AppConfigService], useFactory: buildWinstonConfig }),
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: dbPath,
      models: [User, Category, Bookmark],
      autoLoadModels: false,
      sync: { force: false },
      logging: false,
    }),
    ...(existsSync(publicPath)
      ? [ServeStaticModule.forRoot({
          rootPath: publicPath,
          exclude: ['/bookmarks/*rest', '/categories/*rest', '/auth/google/*rest', '/auth/me', '/import-export/*rest', '/api/*rest'],
        })]
      : []),
    AuthModule,
    UsersModule,
    BookmarksModule,
    CategoriesModule,
    ImportExportModule,
  ],
})
export class AppModule {}
