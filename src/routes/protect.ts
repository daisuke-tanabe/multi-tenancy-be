import { Router } from 'express';

import { protect } from '../services'

export const protectRouter = Router();

protectRouter.get('/', protect);
