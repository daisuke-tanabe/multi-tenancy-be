import {
  AdminRespondToAuthChallengeCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {
  AppError,
  ash,
  cognitoClient,
  createCognitoSecretHash,
  fetchUserPoolClientId,
  fetchUserPoolClientSecret
} from "../lib";
import {Request, Response} from "express";

type RequestBody = {
  session: string;
  tenantId: string;
  email: string;
  password: string;
  mfaCode: string;
};

type ResponseBody = {
  nextStep?: string;
}

export const softwareTokenMfa = ash(async (req: Request<unknown, unknown, RequestBody>, res: Response<ResponseBody>) => {
  const { tenantId, email, password, mfaCode, session } = req.body;
  const userPoolId = `ap-northeast-1_${tenantId}`;

  const clientId = await fetchUserPoolClientId(userPoolId);
  const clientSecret = await fetchUserPoolClientSecret(userPoolId, clientId);

  const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
    UserPoolId: userPoolId,
    ClientId: clientId,
    Session: session,
    ChallengeName: "SOFTWARE_TOKEN_MFA",
    ChallengeResponses: {
      SOFTWARE_TOKEN_MFA_CODE: mfaCode,
      USERNAME: email,
      SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
    }
  });
  const adminRespondToAuthChallengeCommandOutput = await cognitoClient.send(adminRespondToAuthChallengeCommand);

  const idToken = adminRespondToAuthChallengeCommandOutput.AuthenticationResult?.IdToken;
  const expires = adminRespondToAuthChallengeCommandOutput.AuthenticationResult?.ExpiresIn;

  if (idToken && expires) {
    res
      .status(200)
      .cookie('session', idToken,{
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      })
      .json({
        nextStep: 'SUCCESS',
      });
    return;
  }

  res
    .status(500)
    .json({
      nextStep: 'ERROR',
    });
});