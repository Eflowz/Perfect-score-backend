import { Context } from 'hono';
import { upgradeWebSocket } from '@hono/node-server';
import { IDEService } from './ide.service.js';
import { verifyJWT } from '../../middleware/auth.js';



interface Dependencies {
  ideService: IDEService;
}

export class IDEController {
  private ideService: IDEService;
  private sessionClients = new Map<string, Set<any>>();

  constructor({ ideService }: Dependencies) {
    this.ideService = ideService;
  }

  execute = async (c: Context) => {
    const body = c.get('body');
    const result = await this.ideService.executeCode(body.code, body.language);
    return c.json({ data: result });
  };

  collaborate = upgradeWebSocket((c: any) => {
    const sessionId = c.req.param('sessionId');
    const token = c.req.query('token');

    let userId = 'anonymous';

    return {
      onOpen: async (event: any, ws: any) => {
        if (token) {
          try {
            const payload = await verifyJWT(token);
            userId = payload.sub;
          } catch {
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized token' }));
            ws.close();
            return;
          }
        }

        if (!this.sessionClients.has(sessionId)) {
          this.sessionClients.set(sessionId, new Set());
        }
        this.sessionClients.get(sessionId)!.add(ws);

        const session = this.ideService.joinSession(sessionId, userId);
        ws.send(JSON.stringify({ type: 'system', message: `Joined session ${sessionId}`, currentCode: session.code }));
      },
      onMessage: async (event: any, ws: any) => {
        try {
          const data = JSON.parse(event.data.toString());
          if (data.type === 'sync_code') {
            this.ideService.updateSessionCode(sessionId, data.code);
            const clients = this.sessionClients.get(sessionId);
            if (clients) {
              for (const client of clients) {
                if (client !== ws) {
                  client.send(JSON.stringify({ type: 'sync_code', code: data.code, sender: userId }));
                }
              }
            }
          } else if (data.type === 'execute_code') {
            ws.send(JSON.stringify({ type: 'exec_status', message: 'executing...' }));
            const result = await this.ideService.executeCode(data.code, data.language || 'python');
            ws.send(JSON.stringify({ type: 'exec_result', result }));
          }
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid payload format' }));
        }
      },
      onClose: (event: any, ws: any) => {
        this.ideService.leaveSession(sessionId, userId);
        const clients = this.sessionClients.get(sessionId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            this.sessionClients.delete(sessionId);
          }
        }
      },
    };
  });
}
