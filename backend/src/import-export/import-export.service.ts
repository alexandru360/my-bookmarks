import { Injectable } from '@nestjs/common';
import { BookmarksService } from '../bookmarks/bookmarks.service';

interface ParsedBookmark {
  url: string;
  title: string;
  tags?: string;
  favicon?: string;
}

@Injectable()
export class ImportExportService {
  constructor(private bookmarksService: BookmarksService) {}

  // Parse Chrome/Firefox Netscape bookmark HTML format
  parseNetscapeHtml(html: string): ParsedBookmark[] {
    const bookmarks: ParsedBookmark[] = [];
    const anchorRegex = /<A\s+([^>]+)>(.*?)<\/A>/gi;
    let match: RegExpExecArray | null;

    while ((match = anchorRegex.exec(html)) !== null) {
      const attrs = match[1];
      const title = match[2].replace(/<[^>]+>/g, '').trim();
      const hrefMatch = attrs.match(/HREF="([^"]+)"/i);
      const iconMatch = attrs.match(/ICON="([^"]+)"/i);
      const tagsMatch = attrs.match(/TAGS="([^"]+)"/i);

      if (hrefMatch && title) {
        bookmarks.push({
          url: hrefMatch[1],
          title,
          favicon: iconMatch?.[1],
          tags: tagsMatch?.[1],
        });
      }
    }
    return bookmarks;
  }

  async import(userId: number, fileContent: string, mimeType: string): Promise<number> {
    let parsed: ParsedBookmark[] = [];

    if (mimeType === 'application/json' || fileContent.trim().startsWith('[')) {
      try {
        parsed = JSON.parse(fileContent);
      } catch {
        parsed = [];
      }
    } else {
      parsed = this.parseNetscapeHtml(fileContent);
    }

    return this.bookmarksService.bulkCreate(userId, parsed);
  }

  async exportNetscape(userId: number): Promise<string> {
    const bookmarks = await this.bookmarksService.findAllForUser(userId);
    const items = bookmarks
      .map(b => {
        const icon = b.favicon ? ` ICON="${b.favicon}"` : '';
        const tags = b.tags ? ` TAGS="${b.tags}"` : '';
        const ts = Math.floor(new Date(b.createdAt).getTime() / 1000);
        return `        <DT><A HREF="${b.url}" ADD_DATE="${ts}"${icon}${tags}>${b.title}</A>`;
      })
      .join('\n');

    return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${items}
</DL><p>`;
  }

  async exportJson(userId: number): Promise<object[]> {
    const bookmarks = await this.bookmarksService.findAllForUser(userId);
    return bookmarks.map(b => ({
      url: b.url,
      title: b.title,
      description: b.description,
      tags: b.tags,
      favicon: b.favicon,
      createdAt: b.createdAt,
    }));
  }
}
