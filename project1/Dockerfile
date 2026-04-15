FROM node:latest

EXPOSE 80

COPY . /server

WORKDIR /server

RUN npm i

ENV PORT=80

CMD ["node", "index.js"]
