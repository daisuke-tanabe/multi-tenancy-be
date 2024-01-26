import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { Request, Response, NextFunction } from 'express';
import { jwtDecode } from 'jwt-decode';

import { ash, AppError } from '../lib';

export const jwtVerifier = ash(async (req: Request, res: Response, next: NextFunction) => {
  const idToken: string | undefined = req.cookies.session;

  if (!idToken) throw new AppError('トークンのないリクエストです', { statusCode: 401 });

  const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  // TODO 超適当
  const userPoolId = jwtPayload.iss.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
  const clientId = jwtPayload.aud;

  const verifier = CognitoJwtVerifier.create({
    userPoolId,
    tokenUse: 'id',
    clientId,
  });

  // 認証に成功すれば後続処理、失敗すれば上位でエラーをキャッチする
  await verifier.verify(idToken);

  next();
});
