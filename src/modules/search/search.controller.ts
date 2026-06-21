import { Context } from 'hono';
import { SearchService } from './search.service.js';

interface Dependencies {
  searchService: SearchService;
}

export class SearchController {
  private searchService: SearchService;

  constructor({ searchService }: Dependencies) {
    this.searchService = searchService;
  }

  query = async (c: Context) => {
    const q = c.req.query('q') || '';
    const type = (c.req.query('type') || 'courses') as 'courses' | 'modules';
    const results = await this.searchService.search(q, type);
    return c.json({ data: results });
  };
}
