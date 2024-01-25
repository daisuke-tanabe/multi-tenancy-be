import {AssociateSoftwareTokenCommand} from "@aws-sdk/client-cognito-identity-provider";
import {ash, cognitoClient} from "../lib";
import {Request, Response} from "express";

type RequestBody = {
  session: string;
};

type ResponseBody = {
  session?: string;
  secretCode?: string;
}

export const mfa = ash(async (req: Request<unknown, unknown, RequestBody>, res: Response<ResponseBody>) => {
  const { session } = req.body;

  const associateSoftwareTokenCommand = new AssociateSoftwareTokenCommand({
    Session: session
  });
  const associateSoftwareTokenCommandOutput = await cognitoClient.send(associateSoftwareTokenCommand);

  res
    .status(200)
    .json({
      session: associateSoftwareTokenCommandOutput.Session,
      secretCode: associateSoftwareTokenCommandOutput.SecretCode
    })
});