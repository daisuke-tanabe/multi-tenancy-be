import { Router } from 'express';

import { health } from '../services'

export const healthRouter = Router();

healthRouter.get('/', health);
