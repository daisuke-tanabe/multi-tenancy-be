import { Request, Response } from 'express';

type ResBody = {
  message: string;
};

export function protect(req: Request, res: Response<ResBody>) {
  res.json({
    message: 'protect',
  });
}
