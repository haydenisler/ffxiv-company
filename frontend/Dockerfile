FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./

RUN pnpm i

CMD ["pnpm", "run", "dev"]