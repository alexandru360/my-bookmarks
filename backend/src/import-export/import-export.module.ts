import { Module } from '@nestjs/common';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';

@Module({
  imports: [BookmarksModule],
  controllers: [ImportExportController],
  providers: [ImportExportService],
})
export class ImportExportModule {}
