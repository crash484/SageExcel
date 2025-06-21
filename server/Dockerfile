From node:23.5.0

WORKDIR /usr/src/app

COPY package*.json /.

RUN pnpm install

COPY . .

EXPOSE 7860

CMD ["npm","run","start"]