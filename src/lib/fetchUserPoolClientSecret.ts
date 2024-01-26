import {
  DescribeUserPoolClientCommand,
  ListUserPoolClientsCommand,
  UserPoolClientDescription
} from "@aws-sdk/client-cognito-identity-provider";
import {cognitoClient} from "./cognitoClient";
import {CognitoError} from "../types";
import {AppError} from "./AppError";

export async function fetchUserPoolClientSecret(userPoolId: string, clientId: string): Promise<string> {
  const describeUserPoolClientCommand = new DescribeUserPoolClientCommand({
    UserPoolId: userPoolId,
    ClientId: clientId
  });
  const serviceOutputTypes = await cognitoClient.send(describeUserPoolClientCommand);

  const clientSecret = serviceOutputTypes.UserPoolClient?.ClientSecret;
  if (!clientSecret) throw new Error('User pool client does not exist');

  return clientSecret;
}