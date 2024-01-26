import { Router } from 'express';

import {
  challenge,
  create,
  forceChangePassword,
  signIn,
  mfaSetup,
  softwareTokenMfa,
  newPasswordRequired,
  mfaVerify
} from '../services';

export const authRouter = Router();

authRouter
  .post('/create', create)
  .post('/force-change-password', forceChangePassword)
  .post('/signin', signIn)
  .post('/mfa-setup', mfaSetup)
  .post('/mfa-verify', mfaVerify)
  .post('/software-token-mfa', softwareTokenMfa)
  .post('/new-password-required', newPasswordRequired)
  .post('/challenge', challenge)
