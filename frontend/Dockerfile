FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

ARG VITE_BACKEND_API_URL

RUN VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]