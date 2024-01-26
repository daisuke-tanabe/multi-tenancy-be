import { Router } from 'express';

import {challenge, create, forceChangePassword, signIn, mfaSetup, softwareTokenMfa, newPasswordRequired} from '../services';

export const authRouter = Router();

authRouter
  .post('/create', create)
  .post('/force-change-password', forceChangePassword)
  .post('/signin', signIn)
  .post('/mfa-setup', mfaSetup)
  .post('/software-token-mfa', softwareTokenMfa)
  .post('/new-password-required', newPasswordRequired)
  .post('/challenge', challenge)
