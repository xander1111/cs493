FROM node:latest

EXPOSE 8086

COPY . /server

WORKDIR /server

RUN npm i

ENV PORT=8086

CMD ["npm", "start"]
