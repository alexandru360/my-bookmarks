import { Module } from '@nestjs/common';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { CategoriesModule } from '../categories/categories.module';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';

@Module({
  imports: [BookmarksModule, CategoriesModule],
  controllers: [ImportExportController],
  providers: [ImportExportService],
})
export class ImportExportModule {}
