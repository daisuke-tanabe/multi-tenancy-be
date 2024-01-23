import { Router } from 'express';

import { invite } from '../services'

export const inviteRouter = Router();

inviteRouter.post('/', invite);
