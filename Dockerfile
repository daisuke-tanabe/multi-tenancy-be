FROM --platform=linux/amd64 node:20 AS base

WORKDIR /app

COPY . .

RUN npm ci
RUN npm i -g pm2

RUN npm run build

EXPOSE 8080

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]