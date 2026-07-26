FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# 删除锁文件（避免版本冲突），然后安装所有依赖（包括 devDependencies）
RUN rm -f package-lock.json && npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
