FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm i --force
RUN npm run build

EXPOSE 1112

CMD ["npm", "run", "start"]
