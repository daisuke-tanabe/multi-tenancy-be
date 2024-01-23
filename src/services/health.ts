import { Request, Response } from 'express';

type ResBody = {
  message: string;
};

export function health(req: Request, res: Response<ResBody>) {
  res.json({
    message: 'Healthy',
  });
}
