import { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { AuthService } from './auth.service.js';

interface Dependencies {
  authService: AuthService;
}

export class AuthController {
  private authService: AuthService;

  constructor({ authService }: Dependencies) {
    this.authService = authService;
  }

  register = async (c: Context) => {
    const body = c.get('body');
    const result = await this.authService.register(body);

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return c.json({
      user: result.user,
      accessToken: result.accessToken,
    }, 201);
  };

  login = async (c: Context) => {
    const body = c.get('body');
    const result = await this.authService.login(body);

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return c.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  refresh = async (c: Context) => {
    let token = getCookie(c, 'refreshToken');
    
    if (!token) {
      // Allow fallback if not sent as cookie
      try {
        const body = await c.req.json();
        token = body?.refreshToken;
      } catch {
        // No body
      }
    }

    if (!token) {
      return c.json({ error: { message: 'Refresh token is required' } }, 401);
    }

    const result = await this.authService.refreshToken(token);

    setCookie(c, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return c.json({
      accessToken: result.accessToken,
    });
  };

  logout = async (c: Context) => {
    let token = getCookie(c, 'refreshToken');
    if (!token) {
      try {
        const body = await c.req.json();
        token = body?.refreshToken;
      } catch {
        // No body
      }
    }

    if (token) {
      await this.authService.logout(token);
    }

    deleteCookie(c, 'refreshToken');
    return c.json({ success: true });
  };
}
