import { Request, Response } from 'express';

import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthRequest,
  AdminRespondToAuthChallengeCommand,
  AdminRespondToAuthChallengeRequest,
  CognitoIdentityProviderClient, DescribeUserPoolClientCommand,
  ListUserPoolClientsCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import {ash, cognitoClient, createCognitoSecretHash} from '../lib';
import {jwtDecode} from "jwt-decode";
import {createHmac} from "crypto";
import {CognitoIdTokenPayload} from "aws-jwt-verify/jwt-model";

type ReqBody = {
  tenantId: string;
  email: string;
  currentPassword: string;
  newPassword: string;
};

type ResBody = {
  id: string;
};

function initiateAuthRequest(
    client: CognitoIdentityProviderClient,
    { userPoolId, clientId, clientSecret, email, currentPassword }: Pick<ReqBody, 'email' | 'currentPassword'> & {userPoolId: string; clientId: string, clientSecret: string},
) {
  const input: AdminInitiateAuthRequest = {
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: currentPassword,
      SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
    },
  };
  const command = new AdminInitiateAuthCommand(input);
  return client.send(command);
}

function authChallengeRequest(
  client: CognitoIdentityProviderClient,
  { tenantId, clientId, clientSecret, email, newPassword, session }: Pick<ReqBody, 'tenantId' | 'email' | 'newPassword'> & { session?: string, clientId: string, clientSecret: string },
) {
  const secretHash = createHmac('sha256', clientSecret)
    .update(email + clientId)
    .digest('base64');
  const input: AdminRespondToAuthChallengeRequest = {
    UserPoolId: `ap-northeast-1_${tenantId}`,
    ClientId: clientId,
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ChallengeResponses: {
      USERNAME: email,
      NEW_PASSWORD: newPassword,
      SECRET_HASH: secretHash,
    },
    Session: session,
  };
  const command = new AdminRespondToAuthChallengeCommand(input);
  return client.send(command);
}

/**
 * ユーザーサインアップ
 */
export const signUp = ash(async (req: Request<unknown, unknown, ReqBody>, res: Response<ResBody>) => {
  const { tenantId, email, currentPassword, newPassword } = req.body;
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

  /**
   * 仮パスワードでログインしてセッションを取得
   */
  const initiateAuthRequestResponse = await initiateAuthRequest(cognitoClient, { userPoolId, clientId, clientSecret, email, currentPassword });
  const session = initiateAuthRequestResponse.Session;

  /**
   * セッションを使って新しいパスワードを登録
   */
  const authChallengeRequestResponse = await authChallengeRequest(cognitoClient, { tenantId, clientId, clientSecret, email, newPassword, session });
  if (!authChallengeRequestResponse.AuthenticationResult?.IdToken) throw new Error('トークンが返却されませんでした');

  /**
   * subをidとして返却する
   */
  const { IdToken } = authChallengeRequestResponse.AuthenticationResult;
  const jwtPayload: CognitoIdTokenPayload = jwtDecode(IdToken);
  res.json({
    id: jwtPayload.sub,
  });
});
