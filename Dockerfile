FROM node:20 AS base

WORKDIR /app

COPY . .

RUN npm ci
RUN npm i -g pm2

RUN npm run build

CMD ["pm2-runtime", "start", "./ecosystem.config.cjs" ]