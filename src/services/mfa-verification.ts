import {AssociateSoftwareTokenCommand, VerifySoftwareTokenCommand} from "@aws-sdk/client-cognito-identity-provider";
import {ash, cognitoClient} from "../lib";
import {Request, Response} from "express";

type ChallengeName = 'MFA_SETUP' | 'SOFTWARE_TOKEN_MFA';

type RequestBody = {
  session: string;
  mfaCode: string;
  nextStep: ChallengeName;
};

type ResponseBody = {
  session?: string;
  nextStep?: string;
}

export const mfaVerification = ash(async (req: Request<unknown, unknown, RequestBody>, res: Response<ResponseBody>) => {
  const { nextStep,session, mfaCode } = req.body;

  if(nextStep === 'MFA_SETUP') {
    const verifySoftwareTokenCommand = new VerifySoftwareTokenCommand({
      Session: session,
      UserCode: mfaCode,
    });
    const verifySoftwareTokenCommandOutput = await cognitoClient.send(verifySoftwareTokenCommand);

    res
      .status(200)
      .json({
        session: verifySoftwareTokenCommandOutput.Session,
        nextStep: verifySoftwareTokenCommandOutput.Status,
      });

    return;
  }
});