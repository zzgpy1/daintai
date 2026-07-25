# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# 使用 npm install 替代 npm ci
RUN npm install --no-package-lock --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
