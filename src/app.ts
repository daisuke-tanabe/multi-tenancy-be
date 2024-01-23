import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { routes } from './routes';

const port = process.env.PORT || 3001;
const app = express();

app.use(
  cookieParser(),
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    preflightContinue: false,
  }),
  express.json()
);

app.use(routes);

app.listen(port, () => {
  console.info(`bff running on ${port}`);
});
