FROM node:11

WORKDIR /user/src/app/carsec-challenges-backend

COPY package*.json ./

RUN yarn install

COPY . .

CMD ["yarn", "start"]
