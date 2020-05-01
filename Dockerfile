FROM node:lts-slim
ADD . /app
WORKDIR /app
RUN npm install && npx tsc
CMD node index.js