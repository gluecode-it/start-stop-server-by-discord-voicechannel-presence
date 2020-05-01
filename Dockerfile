FROM node:lts-slim
ADD . /app
WORKDIR /app
RUN npm install
CMD node index.js