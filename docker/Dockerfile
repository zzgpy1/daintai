FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# 删除锁文件并安装所有依赖（包括 dev）
RUN rm -f package-lock.json && npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 确保 nginx.conf 在项目根目录，且未被 .dockerignore 忽略
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
