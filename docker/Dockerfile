FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# 删除锁文件并安装依赖（包括 dev）
RUN rm -f package-lock.json && npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 去掉 ./ 前缀，避免路径解析问题
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
