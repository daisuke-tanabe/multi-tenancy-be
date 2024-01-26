import { Request, Response } from 'express';
import qrcode from "qrcode-terminal";

import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthRequest, AdminRespondToAuthChallengeCommand, AssociateSoftwareTokenCommand,
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
  DescribeUserPoolCommand,
  ListUserPoolClientsCommand, VerifySoftwareTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import {AppError, ash, cognitoClient, createCognitoSecretHash} from '../lib';
import {jwtDecode} from "jwt-decode";
import {CognitoIdTokenPayload} from "aws-jwt-verify/jwt-model";
import {ChallengeNameType} from "@aws-sdk/client-cognito-identity-provider/dist-types/models/models_0";

type RequestBody = {
  tenantId: string;
  email: string;
  password: string;
};

type ResponseBody = {
  // challengeName: string;
  // qrCodeUrl?: string;
  nextStep?: string;
  session?: string;
};

/**
 * ユーザーサインイン
 */
export const _signIn = ash(async (req: Request<unknown, unknown, RequestBody>, res: Response<ResponseBody>) => {
  const { tenantId, email, password } = req.body;
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

  res.status(200)
    .json({
      nextStep: clientResponse.ChallengeName,
      session: clientResponse.Session
    });

  // /**
  //  * 多要素認証のセットアップを開始する
  //  */
  // if (nextStep === 'MFA_SETUP') {
  //   console.log('多要素認証のセットアップを開始する');
  //   // ワンタイムトークンの検証
  //   const verifySoftwareTokenCommand = new VerifySoftwareTokenCommand({
  //     Session: session,
  //     UserCode: mfaCode
  //   });
  //   // TODO: ここでQRコードが古いと永久に通らない可能性がある
  //   const verifySoftwareTokenCommandOutput = await cognitoClient.send(verifySoftwareTokenCommand).catch(error => {
  //     throw new AppError(error.__type, { statusCode: error.$metadata.httpStatusCode})
  //   });
  //   if (verifySoftwareTokenCommandOutput.Status !== 'SUCCESS') {
  //     console.log('何かしらの理由で成功しない')
  //     return;
  //   }
  //   // TODO 成功したらどうするか問題
  //   // console.log(verifySoftwareTokenCommandOutput);
  //   // res
  //   //   .status(200)
  //   //   .json({
  //   //     message: 'ここでnyuuryokusuru'
  //   //   })
  //   return;
  // }
  //
  // /**
  //  * 多要素認証のセットアップを開始する
  //  */
  // if (nextStep === 'SOFTWARE_TOKEN_MFA') {
  //   const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
  //     UserPoolId: userPoolId,
  //     ClientId: clientId,
  //     Session: clientResponse.Session,
  //     ChallengeName: "SOFTWARE_TOKEN_MFA",
  //     ChallengeResponses: {
  //       SOFTWARE_TOKEN_MFA_CODE: mfaCode ?? '',
  //       USERNAME: email,
  //       SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
  //     }
  //   });
  //   const adminRespondToAuthChallengeCommandOutput = await cognitoClient.send(adminRespondToAuthChallengeCommand)
  //
  //   const idToken = adminRespondToAuthChallengeCommandOutput.AuthenticationResult?.IdToken;
  //   if (!idToken) throw new AppError('IdTokenNotExist', { statusCode: 500 });
  //
  //   /**
  //    * subをidとして返却する
  //    */
  //   const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  //   res
  //     .status(200)
  //     .cookie('session', idToken,{
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: 'lax'
  //     })
  //     .json({
  //       id: jwtPayload.sub,
  //     });
  //   return;
  // }
  //
  // /**
  //  * 状態が多要素認証のセットアップ = MFA_SETUP
  //  */
  // if (clientResponse.ChallengeName === 'MFA_SETUP') {
  //   console.log('状態が多要素認証のセットアップ = MFA_SETUP')
  //   const associateSoftwareTokenCommand = new AssociateSoftwareTokenCommand({
  //     Session: clientResponse.Session
  //   });
  //   const associateSoftwareTokenCommandOutput = await cognitoClient.send(associateSoftwareTokenCommand);
  //   console.log('associateSoftwareTokenCommandOutput =>', associateSoftwareTokenCommandOutput);
  //   res
  //     .status(200)
  //     .json({
  //       challengeName: clientResponse.ChallengeName,
  //       qrCodeUrl: `otpauth://totp/${clientResponse.ChallengeParameters?.USER_ID_FOR_SRP}?secret=${associateSoftwareTokenCommandOutput.SecretCode}`,
  //       session: associateSoftwareTokenCommandOutput.Session,
  //     })
  //   return;
  // }
  //
  // /**
  //  * アプリでのワンタイムトークンに成功している = SOFTWARE_TOKEN_MFA
  //  */
  // if (clientResponse.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
  //   console.log('アプリでのワンタイムトークンに成功している = SOFTWARE_TOKEN_MFA');
  //   res
  //     .status(200)
  //     .json({
  //       challengeName: clientResponse.ChallengeName,
  //     })
  //   return;
  // }
  //
  // // if (mfaCode) {
  // //   console.log('mfaCodeがある場合');
  // //   // ワンタイムトークンの検証
  // //   const verifySoftwareTokenCommand = new VerifySoftwareTokenCommand({
  // //     Session: session,
  // //     UserCode: mfaCode
  // //   });
  // //   const verifySoftwareTokenCommandOutput = await cognitoClient.send(verifySoftwareTokenCommand);
  // //   console.log('ワンタイムトークンの検証結果 =>', verifySoftwareTokenCommandOutput);
  // //   const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
  // //     UserPoolId: userPoolId,
  // //     ClientId: clientId,
  // //     Session: verifySoftwareTokenCommandOutput.Session,
  // //     ChallengeName: "SOFTWARE_TOKEN_MFA",
  // //     ChallengeResponses: {
  // //       SOFTWARE_TOKEN_MFA_CODE: mfaCode,
  // //       USERNAME: email,
  // //     }
  // //   });
  // //   try {
  // //     const result = await cognitoClient.send(adminRespondToAuthChallengeCommand);
  // //     console.log(result);
  // //   } catch (error) {
  // //     console.log('mfa 失敗');
  // //     console.log(error);
  // //   }
  // //   return;
  // // }
  //
  // // /**
  // //  * TOTPソフトウェアトークン検証が有効なら
  // //  */
  // // if (clientResponse.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
  // //   const adminRespondToAuthChallengeCommand = new AdminRespondToAuthChallengeCommand({
  // //     UserPoolId: userPoolId,
  // //     ClientId: clientId,
  // //     Session: clientResponse.Session,
  // //     ChallengeName: "SOFTWARE_TOKEN_MFA",
  // //     ChallengeResponses: {
  // //       SOFTWARE_TOKEN_MFA_CODE: '293490',
  // //       USERNAME: email,
  // //       SECRET_HASH: createCognitoSecretHash({ email, clientId, clientSecret}),
  // //     }
  // //   });
  // //
  // //   const adminRespondToAuthChallengeCommandOutput = await cognitoClient.send(adminRespondToAuthChallengeCommand)
  // //
  // //   const idToken = adminRespondToAuthChallengeCommandOutput.AuthenticationResult?.IdToken;
  // //   if (!idToken) throw new Error('トークンが返却されませんでした');
  // //
  // //   /**
  // //    * subをidとして返却する
  // //    */
  // //   const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  // //   res
  // //     .status(200)
  // //     .cookie('session', idToken,{
  // //       httpOnly: true,
  // //       secure: true,
  // //       sameSite: 'lax'
  // //     })
  // //     .json({
  // //       id: jwtPayload.sub,
  // //     });
  // //   return;
  // // }
  //
  // const idToken = clientResponse.AuthenticationResult?.IdToken;
  // if (!idToken) throw new Error('トークンが返却されませんでした');
  //
  // /**
  //  * subをidとして返却する
  //  */
  // const jwtPayload: CognitoIdTokenPayload = jwtDecode(idToken);
  // res
  //   .status(200)
  //   .cookie('session', idToken,{
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'lax'
  //   })
  //   .json({
  //     id: jwtPayload.sub,
  //   });
});
