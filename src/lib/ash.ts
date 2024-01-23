import { NextFunction, Request, Response } from 'express';
import { RequestHandler } from 'express-serve-static-core';

/**
 * リクエストハンドラーをasyncでラップして非同期のエラーを拾えるようにする
 */
export function ash(handler: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req, res, next)).catch(next);
}
