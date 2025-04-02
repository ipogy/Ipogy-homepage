FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG BACKEND_PORT

ENV NODE_ENV production
ENV PORT ${BACKEND_PORT}

EXPOSE ${PORT}

CMD ["npm", "start"]