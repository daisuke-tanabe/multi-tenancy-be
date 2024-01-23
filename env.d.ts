declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'production' | 'development';
    AWS_USER_POOL_ACCESS_KEY_ID: string;
    AWS_USER_POOL_SECRET_ACCESS_KEY: string;
  }
}
