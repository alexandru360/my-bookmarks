import { Injectable } from '@nestjs/common';
import { BookmarksService } from '../bookmarks/bookmarks.service';
import { CategoriesService } from '../categories/categories.service';

interface ParsedBookmark {
  url: string;
  title: string;
  tags?: string;
  favicon?: string;
  folderName?: string;
}

@Injectable()
export class ImportExportService {
  constructor(
    private bookmarksService: BookmarksService,
    private categoriesService: CategoriesService,
  ) {}

  // Parse Chrome/Firefox Netscape bookmark HTML format preserving folder hierarchy
  parseNetscapeHtml(html: string): ParsedBookmark[] {
    const bookmarks: ParsedBookmark[] = [];
    const folderStack: string[] = [];
    const lines = html.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      const h3Match = trimmed.match(/<H3[^>]*>(.*?)<\/H3>/i);
      if (h3Match) {
        folderStack.push(h3Match[1].trim());
        continue;
      }

      if (/^<\/DL>/i.test(trimmed)) {
        folderStack.pop();
        continue;
      }

      const aMatch = trimmed.match(/<A\s+([^>]+)>(.*?)<\/A>/i);
      if (aMatch) {
        const attrs = aMatch[1];
        const title = aMatch[2].replace(/<[^>]+>/g, '').trim();
        const hrefMatch = attrs.match(/HREF="([^"]+)"/i);
        const iconMatch = attrs.match(/ICON="([^"]+)"/i);
        const tagsMatch = attrs.match(/TAGS="([^"]+)"/i);

        if (hrefMatch && title) {
          bookmarks.push({
            url: hrefMatch[1],
            title,
            favicon: iconMatch?.[1],
            tags: tagsMatch?.[1],
            folderName: folderStack.length > 0 ? folderStack[folderStack.length - 1] : undefined,
          });
        }
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

    // Create categories for unique folder names and build a name→id map
    const folderCategoryMap = new Map<string, number>();
    const uniqueFolders = [...new Set(parsed.map(b => b.folderName).filter(Boolean))] as string[];

    const existingCategories = await this.categoriesService.findAll(userId);
    for (const cat of existingCategories) {
      folderCategoryMap.set(cat.name, cat.id);
    }

    for (const folder of uniqueFolders) {
      if (!folderCategoryMap.has(folder)) {
        const created = await this.categoriesService.create(userId, { name: folder, color: '#7c3aed' });
        folderCategoryMap.set(folder, created.id);
      }
    }

    const records = parsed.map(b => ({
      url: b.url,
      title: b.title,
      favicon: b.favicon,
      tags: b.tags,
      categoryId: b.folderName ? folderCategoryMap.get(b.folderName) : undefined,
    }));

    return this.bookmarksService.bulkCreate(userId, records);
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
