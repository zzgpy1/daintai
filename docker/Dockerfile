FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# 删除锁文件并强制安装所有依赖（包括 dev）
RUN rm -f package-lock.json && NODE_ENV=development npm install --legacy-peer-deps
COPY . .
# 使用 npm run build，自动使用本地 vite
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
