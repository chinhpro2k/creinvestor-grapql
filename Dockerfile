FROM node:14.17.0-alpine3.13 AS development

WORKDIR /usr/src/app

COPY package.json .

RUN npm install glob rimraf

RUN npm install

COPY . .

RUN npm run build

ENTRYPOINT [ "npm", "run", "start" ]
