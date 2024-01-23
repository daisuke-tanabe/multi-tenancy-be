import { Router } from 'express';

import { create, signIn, signUp } from '../services';

export const authRouter = Router();

authRouter
  .post('/create', create)
  .post('/signup', signUp)
  .post('/signin', signIn);
