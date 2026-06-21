import { Context } from 'hono';
import { BookmarksService } from './bookmarks.service.js';

interface Dependencies {
  bookmarksService: BookmarksService;
}

export class BookmarksController {
  private bookmarksService: BookmarksService;

  constructor({ bookmarksService }: Dependencies) {
    this.bookmarksService = bookmarksService;
  }

  add = async (c: Context) => {
    const user = c.get('user')!;
    const courseId = c.req.param('courseId')!;
    const bookmark = await this.bookmarksService.bookmarkCourse(user.id, courseId);
    return c.json({ data: bookmark }, 201);
  };

  delete = async (c: Context) => {
    const user = c.get('user')!;
    const courseId = c.req.param('courseId')!;
    await this.bookmarksService.unbookmarkCourse(user.id, courseId);
    return c.json({ success: true });
  };

  list = async (c: Context) => {
    const user = c.get('user')!;
    const bookmarks = await this.bookmarksService.getBookmarks(user.id);
    return c.json({ data: bookmarks });
  };
}
