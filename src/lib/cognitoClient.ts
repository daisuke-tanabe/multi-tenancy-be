import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import {createHmac} from "node:crypto";

export const cognitoClient = new CognitoIdentityProviderClient({
  credentials: {
    accessKeyId: process.env.AWS_USER_POOL_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_USER_POOL_SECRET_ACCESS_KEY,
  },
  region: 'ap-northeast-1',
});

export const createCognitoSecretHash = ({
  email,
  clientId,
  clientSecret,
}: {
  email: string;
  clientId: string;
  clientSecret: string;
}) => {
  return createHmac('sha256', clientSecret)
    .update(email + clientId)
    .digest('base64');
};
