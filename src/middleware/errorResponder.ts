import { NextFunction, Request, Response } from 'express';
import {AppError} from "../lib";

/**
 * errorResponder
 *
 * エラーに応じたレスポンスを返却するミドルウェア
 *
 * @param {unknown} error
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function errorResponder(error: unknown, req: Request, res: Response, next: NextFunction) {
  res.header({
    'content-type': 'application/problem+json'
  });

  if (error instanceof Error && '$metadata' in error) {
    res.status(401).json({
      error: { message: 'Unauthorized' },
    });
  } else if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { message: error.message },
    });
  } else {
    res.status(503).json({
      error: { message: 'InternalServerError' },
    });
  }

  next();
}
