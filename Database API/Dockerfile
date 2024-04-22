
FROM node:10-alpine 

LABEL org.containers.image.title="Node.js basic client / server container"

RUN mkdir -p /usr/src/app

COPY . usr/src

WORKDIR /usr/src/app 

RUN npm install 

ENTRYPOINT ["node", "server.js"]