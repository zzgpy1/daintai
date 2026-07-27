FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN rm -f package-lock.json && npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 直接使用文件名，不要加 ./ 前缀
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
