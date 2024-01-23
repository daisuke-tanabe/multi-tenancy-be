import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Request, Response, NextFunction } from 'express';

import { ash } from '../lib';
import {CognitoIdTokenPayload} from "aws-jwt-verify/jwt-model";
import {jwtDecode} from "jwt-decode";

export const jwtVerifier = ash(async (req: Request, res: Response, next: NextFunction) => {
  const idToken: string | undefined = req.cookies['session'];

  if (!idToken) throw new Error('Invalid Token');

  const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  // TODO 超適当
  const userPoolId = jwtPayload.iss.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
  const clientId = jwtPayload.aud;

  const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: 'id',
    clientId: clientId,
  });

  // 認証に成功すれば後続処理、失敗すれば上位でエラーをキャッチする
  await verifier.verify(idToken);

  next();
});
