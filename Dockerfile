FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache make gcc g++ python3

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "start"]
