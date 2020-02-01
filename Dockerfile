FROM node:13-alpine

ADD . /usr/src/app
RUN cd /usr/src/app && npm install

ENTRYPOINT ["docker-entrypoint.sh", "node", "/usr/src/app/lutron-pro-hub-mqtt"]

