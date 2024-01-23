import { Request, Response } from 'express';

import {AdminCreateUserCommand} from '@aws-sdk/client-cognito-identity-provider';

import {ash, cognitoClient, createCognitoSecretHash} from '../lib';

type ReqBody = {
  userPoolId: string;
  email: string;
};

type ResBody = {
  name: string | undefined;
  status: string | undefined;
};

/**
 * 管理ユーザー発行
 * @param userPoolId - Cognitoのリージョンを含めたプールID
 * @param email - 管理者にするメールアドレス
 */
export const create = ash(async (req: Request<unknown, unknown, ReqBody>, res: Response<ResBody>) => {
  const { userPoolId, email } = req.body;

  const input = {
    UserPoolId: userPoolId,
    Username: email,
    UserAttributes: [
      {
        Name: "custom:tenant_id",
        Value: userPoolId.replace('ap-northeast-1_', ''),
      },
    ],
  };

  const command = new AdminCreateUserCommand(input);
  const response = await cognitoClient.send(command);

  res.status(200).json({
    name: response?.User?.Username,
    status: response?.User?.UserStatus
  });
});
