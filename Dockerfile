FROM node:11

WORKDIR /user/src/app

COPY package*.json ./

RUN yarn install

COPY . .

CMD ["yarn", "start"]
