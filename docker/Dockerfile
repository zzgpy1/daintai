# docker/Dockerfile
# 多阶段构建

# 阶段1: 构建
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 阶段2: 运行
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 复制健康检查脚本
COPY docker/healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
