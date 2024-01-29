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
    res.status(error.$metadata.httpStatusCode ?? 500).json({
      error: {
        message: error.message,
        // NOTE: Cognitoの返却するエラーレスポンスなので許可する
        // eslint-disable-next-line no-underscore-dangle
        name: error.__type,
      },
    });
  } if (error instanceof AppError) {
    res.status(error.statusCode ?? 500).json({
      error: {
        message: error.message,
        name: error.name,
      },
    });
  } else if (error instanceof Error) {
    res.status(500).json({
      error: {
        message: '予期しないエラーが発生しました',
        name: error.name,
      },
    });
  }

  next();
}
