import { Request, Response } from 'express';
import {ash, cognitoClient, fetchUserPoolClientId, fetchUserPoolClientSecret} from "../lib";
import {AdminRespondToAuthChallengeCommand} from "@aws-sdk/client-cognito-identity-provider";
import {createHmac} from "crypto";

type ReqBody = {
  tenantId: string;
  email: string;
  password: string;
  session: string;
};

type ResponseBody = {
  nextStep?: string;
  session?: string;
};

export const newPasswordRequired = ash(async (req: Request<unknown, unknown, ReqBody>, res: Response<ResponseBody>) => {
  const { tenantId, email, password, session } = req.body;
  const userPoolId = `ap-northeast-1_${tenantId}`;

  const clientId = await fetchUserPoolClientId(userPoolId);
  const clientSecret = await fetchUserPoolClientSecret(userPoolId, clientId);

  const secretHash = createHmac('sha256', clientSecret)
    .update(email + clientId)
    .digest('base64');

  const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
    UserPoolId: `ap-northeast-1_${tenantId}`,
    ClientId: clientId,
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ChallengeResponses: {
      USERNAME: email,
      NEW_PASSWORD: password,
      SECRET_HASH: secretHash,
    },
    Session: session,
  });
  const adminRespondToAuthChallengeCommandOutput = await cognitoClient.send(adminRespondToAuthChallengeCommand)

  res.status(200).json({
    nextStep: adminRespondToAuthChallengeCommandOutput.ChallengeName,
    session: adminRespondToAuthChallengeCommandOutput.Session
  });
});
