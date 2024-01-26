import { VerifySoftwareTokenCommand } from '@aws-sdk/client-cognito-identity-provider';
import { Request, Response } from 'express';

import { ash, cognitoClient } from '../lib';

type RequestBody = {
  session: string;
  mfaCode: string;
};

type ResponseBody = {
  session?: string;
  nextStep?: string;
};

export const mfaVerify = ash(async (req: Request<unknown, unknown, RequestBody>, res: Response<ResponseBody>) => {
  const { mfaCode, session } = req.body;

  const verifySoftwareTokenCommand = new VerifySoftwareTokenCommand({
    Session: session,
    UserCode: mfaCode,
  });
  const verifySoftwareTokenCommandOutput = await cognitoClient.send(verifySoftwareTokenCommand);

  res.status(200).json({
    session: verifySoftwareTokenCommandOutput.Session,
    nextStep: verifySoftwareTokenCommandOutput.Status,
  });
});
