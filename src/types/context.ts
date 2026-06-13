import { AwilixContainer } from 'awilix';

export interface UserContext {
  id: string;
  role: 'SUPER_ADMIN' | 'USER';
}

declare module 'hono' {
  interface ContextVariableMap {
    user?: UserContext;
    body?: any;
    query?: any;
    params?: any;
    container: AwilixContainer;
  }
}
