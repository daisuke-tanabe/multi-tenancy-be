import { Router } from 'express';

import { challenge, create, signIn, signUp, mfa, mfaVerification } from '../services';

export const authRouter = Router();

authRouter
  .post('/create', create)
  .post('/signup', signUp)
  .post('/signin', signIn)
  .post('/mfa', mfa)
  .post('/mfa-verification', mfaVerification)
  .post('/challenge', challenge)
