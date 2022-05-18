# Build step
FROM node:16-alpine as build-step

RUN mkdir /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app
RUN npm run build


# Serving step
FROM nginx:stable-alpine

COPY --from=build-step /app/dist /usr/share/nginx/html