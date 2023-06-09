FROM node:20.2.0-alpine3.18 as BUILD

RUN mkdir /opt/todo
WORKDIR /opt/todo

COPY . .

RUN npm install
RUN npm run build

FROM nginx:alpine3.17-slim

COPY --from=BUILD /opt/todo/dist/ /usr/share/nginx/html/
COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]