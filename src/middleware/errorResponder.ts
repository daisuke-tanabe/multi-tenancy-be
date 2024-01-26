import { NextFunction, Request, Response } from 'express';

import { AppError, logger, isResponseCognitoError } from '../lib';

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
  logger.error(error);

  res.header({
    'content-type': 'application/problem+json',
  });

  if (isResponseCognitoError(error)) {
    return res.status(error.$metadata.httpStatusCode ?? 500).json({
      error: {
        message: error.message,
        name: error.__type,
      },
    });
  } if (error instanceof AppError) {
    return res.status(error.statusCode ?? 500).json({
      error: {
        message: error.message,
        name: error.name,
      },
    });
  }

  res.status(503).json({
    error: {
      message: 'Exception error',
      name: 'ExceptionError',
    },
  });

  next();
}
