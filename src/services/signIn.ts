import { Request, Response } from 'express';

import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthRequest,
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  DescribeUserPoolCommand,
  ListUserPoolClientsCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import {ash, cognitoClient, createCognitoSecretHash} from '../lib';
import {jwtDecode} from "jwt-decode";
import {CognitoIdTokenPayload} from "aws-jwt-verify/jwt-model";

type ReqBody = {
  tenantId: string;
  email: string;
  password: string;
};

type ResBody = {
  id: string;
};

/**
 * ユーザーサインイン
 */
export const signIn = ash(async (req: Request<unknown, unknown, ReqBody>, res: Response<ResBody>) => {
  const { tenantId, email, password } = req.body;
  const userPoolId = `ap-northeast-1_${tenantId}`;

  /**
   * ユーザープールIDからクライアントIDを取得する
   */
  const listUserPoolClientsCommand = new ListUserPoolClientsCommand({
    UserPoolId: userPoolId,
    MaxResults: 1,
  });
  const listUserPoolClientsCommandOutput = await cognitoClient.send(listUserPoolClientsCommand)
  const userPoolClients = listUserPoolClientsCommandOutput.UserPoolClients;
  if (!userPoolClients) throw new Error('User pool client does not exist');
  const clientId = userPoolClients[0].ClientId;
  if (!clientId) throw new Error('clientId does not exist');

  /**
   * ユーザープールIDとクライアントIDを使ってクライアントシークレットを取得する
   */
  const describeUserPoolClientCommand = new DescribeUserPoolClientCommand({
    UserPoolId: userPoolId,
    ClientId: clientId
  });
  const serviceOutputTypes = await cognitoClient.send(describeUserPoolClientCommand);
  const clientSecret = serviceOutputTypes.UserPoolClient?.ClientSecret;
  if (!clientSecret) throw new Error('User pool client does not exist');

  const input: AdminInitiateAuthRequest = {
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
    },
  };
  const command = new AdminInitiateAuthCommand(input);
  const clientResponse = await cognitoClient.send(command);
  const idToken = clientResponse.AuthenticationResult?.IdToken;
  if (!idToken) throw new Error('トークンが返却されませんでした');

  /**
   * subをidとして返却する
   */
  const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  res
    .status(200)
    .cookie('session', idToken,{
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    })
    .json({
      id: jwtPayload.sub,
    });
});
