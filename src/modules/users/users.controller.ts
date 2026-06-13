import { Context } from 'hono';
import { UsersService } from './users.service.js';

interface Dependencies {
  usersService: UsersService;
}

export class UsersController {
  private usersService: UsersService;

  constructor({ usersService }: Dependencies) {
    this.usersService = usersService;
  }

  getMe = async (c: Context) => {
    const user = c.get('user');
    const profile = await this.usersService.getProfile(user!.id);
    return c.json({ data: profile });
  };

  updateMe = async (c: Context) => {
    const user = c.get('user');
    const body = c.get('body');
    const profile = await this.usersService.updateProfile(user!.id, body);
    return c.json({ data: profile });
  };

  getUser = async (c: Context) => {
    const userId = c.req.param('id')!;
    const profile = await this.usersService.getProfile(userId);
    return c.json({ data: profile });
  };

  listAll = async (c: Context) => {
    const users = await this.usersService.listAllUsers();
    return c.json({ data: users });
  };
}
