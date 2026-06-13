import { Context } from 'hono';
import { Container } from '../container/index.js';

export interface GraphQLContext {
  container: Container;
  user?: {
    id: string;
    role: 'SUPER_ADMIN' | 'USER';
  };
}

export function createGraphQLContext(honoContext: Context): GraphQLContext {
  return {
    container: honoContext.get('container'),
    user: honoContext.get('user'),
  };
}
