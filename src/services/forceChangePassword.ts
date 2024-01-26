import { Request, Response } from 'express';
import {ash, cognitoClient, createCognitoSecretHash, fetchUserPoolClientId, fetchUserPoolClientSecret} from "../lib";
import {AdminInitiateAuthCommand} from "@aws-sdk/client-cognito-identity-provider";

type ReqBody = {
  tenantId: string;
  email: string;
  password: string;
};

type ResponseBody = {
  nextStep?: string;
  session?: string;
};

export const forceChangePassword = ash(async (req: Request<unknown, unknown, ReqBody>, res: Response<ResponseBody>) => {
  const { tenantId, email, password } = req.body;
  const userPoolId = `ap-northeast-1_${tenantId}`;

  const clientId = await fetchUserPoolClientId(userPoolId);
  const clientSecret = await fetchUserPoolClientSecret(userPoolId, clientId);

  const adminInitiateAuthCommand = new AdminInitiateAuthCommand({
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
    },
  });
  const adminInitiateAuthCommandOutput = await cognitoClient.send(adminInitiateAuthCommand)

  res
    .status(200)
    .json({
      nextStep: adminInitiateAuthCommandOutput.ChallengeName,
      session: adminInitiateAuthCommandOutput.Session,
    })
});
