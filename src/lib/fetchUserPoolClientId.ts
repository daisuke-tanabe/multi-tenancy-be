import { ListUserPoolClientsCommand } from '@aws-sdk/client-cognito-identity-provider';

import { AppError } from './AppError';
import { cognitoClient } from './cognitoClient';

export async function fetchUserPoolClientId(userPoolId: string): Promise<string> {
  /**
   * API仕様
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ListUserPoolClientsCommand/
   */
  const listUserPoolClientsCommand = new ListUserPoolClientsCommand({
    UserPoolId: userPoolId,
    MaxResults: 1,
  });

  const listUserPoolClients = await cognitoClient.send(listUserPoolClientsCommand).catch(() => {
    // NOTE: ユーザープールIDからクライントIDを特定する際にエラーが発生するとリソースネームが返却されるので無効なパラメーターというエラーを返して防ぐ
    throw new AppError('Invalid parameter', { statusCode: 400, name: 'InvalidParameterException' });
  });

  const userPoolClients = listUserPoolClients.UserPoolClients;

  if (!userPoolClients) {
    // NOTE: ユーザープールクライアントのリソースが特定できない場合
    throw new AppError('Missing resource specified', { statusCode: 404, name: 'ResourceNotFoundException' });
  }

  const clientId = userPoolClients[0].ClientId;

  if (!clientId) {
    // NOTE: ユーザープールクライアントIDが特定できない場合
    throw new AppError('Missing resource specified', { statusCode: 404, name: 'ResourceNotFoundException' });
  }

  return clientId;
}
