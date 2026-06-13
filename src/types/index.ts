export * from './context.js';
export interface SuccessResponse<T = any> {
  success: boolean;
  data: T;
}
