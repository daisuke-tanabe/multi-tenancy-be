import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthRequest, AdminRespondToAuthChallengeCommand,
  AssociateSoftwareTokenCommand,
  DescribeUserPoolClientCommand,
  ListUserPoolClientsCommand, VerifySoftwareTokenCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {AppError, ash, cognitoClient, createCognitoSecretHash} from "../lib";
import {Request, Response} from "express";
import {CognitoIdTokenPayload} from "aws-jwt-verify/jwt-model";
import {jwtDecode} from "jwt-decode";

type ChallengeName = 'MFA_SETUP' | 'SOFTWARE_TOKEN_MFA' | 'COMPLETE';

type RequestBody = {
  tenantId: string;
  email: string;
  password: string;
  mfaCode: string;
  session: string;
  nextStep: ChallengeName
};

type ResponseBody = {
  nextStep: ChallengeName;
}

export const challenge = ash(async (req: Request<unknown, unknown, RequestBody>, res: Response<ResponseBody>) => {
  // const { tenantId, email, password, mfaCode } = req.body;
  // const userPoolId = `ap-northeast-1_${tenantId}`;
  //
  // /**
  //  * ユーザープールIDからクライアントIDを取得する
  //  */
  // const listUserPoolClientsCommand = new ListUserPoolClientsCommand({
  //   UserPoolId: userPoolId,
  //   MaxResults: 1,
  // });
  // const listUserPoolClientsCommandOutput = await cognitoClient.send(listUserPoolClientsCommand)
  // const userPoolClients = listUserPoolClientsCommandOutput.UserPoolClients;
  // if (!userPoolClients) throw new Error('User pool client does not exist');
  // const clientId = userPoolClients[0].ClientId;
  // if (!clientId) throw new Error('clientId does not exist');
  //
  // /**
  //  * ユーザープールIDとクライアントIDを使ってクライアントシークレットを取得する
  //  */
  // const describeUserPoolClientCommand = new DescribeUserPoolClientCommand({
  //   UserPoolId: userPoolId,
  //   ClientId: clientId
  // });
  // const describeUserPoolClientCommandOutput = await cognitoClient.send(describeUserPoolClientCommand);
  // const clientSecret = describeUserPoolClientCommandOutput.UserPoolClient?.ClientSecret;
  // if (!clientSecret) throw new Error('User pool client does not exist');
  //
  // /**
  //  * ユーザーネーム(メールアドレス)とパスワードを使った認証の開始
  //  */
  // const input: AdminInitiateAuthRequest = {
  //   UserPoolId: userPoolId,
  //   ClientId: clientId,
  //   AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
  //   AuthParameters: {
  //     USERNAME: email,
  //     PASSWORD: password,
  //     SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
  //   },
  // };
  // const command = new AdminInitiateAuthCommand(input);
  // const clientResponse = await cognitoClient.send(command);
  //
  // /**
  //  * 認証チャレンジ
  //  */
  // const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
  //   UserPoolId: userPoolId,
  //   ClientId: clientId,
  //   Session: clientResponse.Session,
  //   ChallengeName: "SOFTWARE_TOKEN_MFA",
  //   ChallengeResponses: {
  //     SOFTWARE_TOKEN_MFA_CODE: mfaCode,
  //     USERNAME: email,
  //     SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
  //   }
  // });
  // const adminRespondToAuthChallengeCommandOutput = await cognitoClient.send(adminRespondToAuthChallengeCommand)
  //
  // const idToken = adminRespondToAuthChallengeCommandOutput.AuthenticationResult?.IdToken;
  // if (!idToken) throw new AppError('IdTokenNotExist', { statusCode: 500 });
  // const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  // res
  //   .status(200)
  //   .cookie('session', idToken,{
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'lax'
  //   })
  //   .json({
  //     nextStep: 'COMPLETE'
  //   });




  // const { tenantId, email, password, mfaCode, session } = req.body;
  // const userPoolId = `ap-northeast-1_${tenantId}`;
  //
  // /**
  //  * ユーザープールIDからクライアントIDを取得する
  //  */
  // const listUserPoolClientsCommand = new ListUserPoolClientsCommand({
  //   UserPoolId: userPoolId,
  //   MaxResults: 1,
  // });
  // const listUserPoolClientsCommandOutput = await cognitoClient.send(listUserPoolClientsCommand)
  // const userPoolClients = listUserPoolClientsCommandOutput.UserPoolClients;
  // if (!userPoolClients) throw new Error('User pool client does not exist');
  // const clientId = userPoolClients[0].ClientId;
  // if (!clientId) throw new Error('clientId does not exist');
  //
  // /**
  //  * ユーザープールIDとクライアントIDを使ってクライアントシークレットを取得する
  //  */
  // const describeUserPoolClientCommand = new DescribeUserPoolClientCommand({
  //   UserPoolId: userPoolId,
  //   ClientId: clientId
  // });
  // const describeUserPoolClientCommandOutput = await cognitoClient.send(describeUserPoolClientCommand);
  // const clientSecret = describeUserPoolClientCommandOutput.UserPoolClient?.ClientSecret;
  // if (!clientSecret) throw new Error('User pool client does not exist');
  //
  // /**
  //  * ユーザーネーム(メールアドレス)とパスワードを使った認証の開始
  //  */
  // const input: AdminInitiateAuthRequest = {
  //   UserPoolId: userPoolId,
  //   ClientId: clientId,
  //   AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
  //   AuthParameters: {
  //     USERNAME: email,
  //     PASSWORD: password,
  //     SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
  //   },
  // };
  // const command = new AdminInitiateAuthCommand(input);
  // const clientResponse = await cognitoClient.send(command);
  //
  //
  // // ワンタイムトークンの検証
  // const verifySoftwareTokenCommand = new VerifySoftwareTokenCommand({
  //   Session: clientResponse.Session,
  //   UserCode: mfaCode
  // });
  // const verifySoftwareTokenCommandOutput = await cognitoClient.send(verifySoftwareTokenCommand);
  //
  // const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
  //   UserPoolId: userPoolId,
  //   ClientId: clientId,
  //   Session: verifySoftwareTokenCommandOutput.Session,
  //   ChallengeName: "SOFTWARE_TOKEN_MFA",
  //   ChallengeResponses: {
  //     SOFTWARE_TOKEN_MFA_CODE: mfaCode,
  //     USERNAME: email,
  //   }
  // });
  // const adminRespondToAuthChallengeCommandOutput = await cognitoClient.send(adminRespondToAuthChallengeCommand);
  //
  // const idToken = adminRespondToAuthChallengeCommandOutput.AuthenticationResult?.IdToken;
  // if (!idToken) throw new AppError('IdTokenNotExist', { statusCode: 500 });
  // res
  //   .status(200)
  //   .cookie('session', idToken,{
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'lax'
  //   })
  //   .json({
  //     nextStep: 'COMPLETE'
  //   });




  const { tenantId, email, password, mfaCode, session, nextStep } = req.body;
  const userPoolId = `ap-northeast-1_${tenantId}`;

  /**
   * ユーザープールIDからクライアントIDを取得する
   */
  const listUserPoolClientsCommand = new ListUserPoolClientsCommand({
    UserPoolId: userPoolId,
    MaxResults: 1,
  });
  const listUserPoolClientsCommandOutput = await cognitoClient.send(listUserPoolClientsCommand)
  const userPoolClients = listUserPoolClientsCommandOutput.UserPoolClients;
  if (!userPoolClients) throw new Error('User pool client does not exist');
  const clientId = userPoolClients[0].ClientId;
  if (!clientId) throw new Error('clientId does not exist');

  /**
   * ユーザープールIDとクライアントIDを使ってクライアントシークレットを取得する
   */
  const describeUserPoolClientCommand = new DescribeUserPoolClientCommand({
    UserPoolId: userPoolId,
    ClientId: clientId
  });
  const describeUserPoolClientCommandOutput = await cognitoClient.send(describeUserPoolClientCommand);
  const clientSecret = describeUserPoolClientCommandOutput.UserPoolClient?.ClientSecret;
  if (!clientSecret) throw new Error('User pool client does not exist');

  /**
   * ユーザーネーム(メールアドレス)とパスワードを使った認証の開始
   */
  const input: AdminInitiateAuthRequest = {
    UserPoolId: userPoolId,
    ClientId: clientId,
    AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
    },
  };
  const command = new AdminInitiateAuthCommand(input);
  const clientResponse = await cognitoClient.send(command);

  /**
   * 多要素認証のセットアップを開始する
   */
  if (nextStep === 'SOFTWARE_TOKEN_MFA') {
    const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
      UserPoolId: userPoolId,
      ClientId: clientId,
      Session: clientResponse.Session,
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      ChallengeResponses: {
        SOFTWARE_TOKEN_MFA_CODE: mfaCode ?? '',
        USERNAME: email,
        SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
      }
    });
    const adminRespondToAuthChallengeCommandOutput = await cognitoClient.send(adminRespondToAuthChallengeCommand);
    const idToken = adminRespondToAuthChallengeCommandOutput.AuthenticationResult?.IdToken;
    if (!idToken) throw new AppError('IdTokenNotExist', { statusCode: 500 });

    res
      .status(200)
      .cookie('session', idToken,{
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      })
      .json({
        nextStep: 'COMPLETE'
      });
    return;
  }
});