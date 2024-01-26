import {ListUserPoolClientsCommand, UserPoolClientDescription} from "@aws-sdk/client-cognito-identity-provider";
import {cognitoClient} from "./cognitoClient";
import {CognitoError} from "../types";
import {AppError} from "./AppError";

export async function fetchUserPoolClientId(userPoolId: string): Promise<string> {
  const listUserPoolClientsCommand = new ListUserPoolClientsCommand({
    UserPoolId: userPoolId,
    MaxResults: 1,
  });

  const listUserPoolClients = await cognitoClient.send(listUserPoolClientsCommand)
    .catch((error: CognitoError) => {
      // ユーザープールIDからクライントIDを特定する際にエラーが発生するとリソースネームが返却されるのでそれを防いでいる
      throw new AppError('Invalid parameter', { statusCode: error.$metadata.httpStatusCode })
    });

  const userPoolClients = listUserPoolClients.UserPoolClients;
  if (!userPoolClients) throw new AppError('User pool client does not exist', { statusCode: 503 });

  const clientId = userPoolClients[0].ClientId;
  if (!clientId) throw new AppError('User pool client does not exist', { statusCode: 500 });

  return clientId;
}