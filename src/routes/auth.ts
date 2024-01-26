import { Router } from 'express';

import { challenge, create, forceChangePassword, signIn, mfa, mfaSetup, newPasswordRequired } from '../services';

export const authRouter = Router();

authRouter
  .post('/create', create)
  .post('/force-change-password', forceChangePassword)
  .post('/signin', signIn)
  .post('/mfa', mfa)
  .post('/mfa-setup', mfaSetup)
  .post('/new-password-required', newPasswordRequired)
  .post('/challenge', challenge)
