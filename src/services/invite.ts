
import { AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { Request, Response } from 'express';
import { jwtDecode } from 'jwt-decode';

import { ash, cognitoClient, createCognitoSecretHash } from '../lib';

type ReqBody = {
  email: string;
};

type ResBody = {
  name: string | undefined;
  status: string | undefined;
};

/**
 * ユーザー招待
 * @param userPoolId - Cognitoのリージョンを含めたユーザーID
 * @param email - 招待したい人のメールアドレス
 */
export const invite = ash(async (req: Request<unknown, unknown, ReqBody>, res: Response<ResBody>) => {
  const idToken: string = req.cookies.session;
  const { email } = req.body;

  const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  // TODO 超適当
  const userPoolId = jwtPayload.iss.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');

  const input = {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [
      {
        Name: 'custom:tenant_id',
        Value: userPoolId.replace('ap-northeast-1_', ''),
      },
    ],
  };

  const command = new AdminCreateUserCommand(input);
  const response = await cognitoClient.send(command);

  res.status(200).json({
    name: response?.User?.Username,
    status: response?.User?.UserStatus,
  });
});
