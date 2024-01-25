import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import logger from 'pino-http'

import { errorResponder } from './middleware';
import { routes } from './routes';

const port = 8080;
const app = express();

app.use(
  // logger(),
  cookieParser(),
  cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://multi-tenancy-phi.vercel.app' : 'http://localhost:3000',
    credentials: true,
    preflightContinue: false,
  }),
  express.json()
);
app.use(routes);

app.use(errorResponder);

app.listen(port, () => {
  console.info(`bff running on ${port}`);
});
