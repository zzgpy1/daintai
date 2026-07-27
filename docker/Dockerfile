FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# 删除旧锁文件并强制安装所有依赖（包括 dev）
RUN rm -f package-lock.json && npm install --legacy-peer-deps --include=dev
COPY . .
# 使用 npx 确保 vite 命令可执行
RUN npx vite build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
