import { NextFunction, Request, Response } from 'express';
import {AppError, isObject, isResponseCognitoError} from "../lib";

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

  if (isResponseCognitoError(error)) {
    res.status(error.$metadata.httpStatusCode ?? 500).json({
      error: {
        message: error.message,
        type: error.__type,
      },
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
