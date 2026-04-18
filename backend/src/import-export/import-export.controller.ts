import {
  Controller, Post, Get, Query, Req, Res, UseGuards,
  UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImportExportService } from './import-export.service';

@ApiTags('import-export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import-export')
export class ImportExportController {
  constructor(private svc: ImportExportService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import bookmarks from Chrome/Firefox HTML or JSON file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async import(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    const content = file.buffer.toString('utf-8');
    const count = await this.svc.import(req.user.id, content, file.mimetype);
    return { imported: count };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export bookmarks. ?format=chrome|firefox|json' })
  async export(@Query('format') format = 'chrome', @Req() req: any, @Res() res: any) {
    if (format === 'json') {
      const data = await this.svc.exportJson(req.user.id);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.json"');
      return res.send(JSON.stringify(data, null, 2));
    }

    const html = await this.svc.exportNetscape(req.user.id);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.html"');
    return res.send(html);
  }
}
