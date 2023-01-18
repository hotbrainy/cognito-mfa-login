FROM nginx:1.21.4-alpine

WORKDIR /app

COPY ./.nginx/default.conf /etc/nginx/conf.d/default.conf
COPY  . /usr/share/nginx/html
