# ============================================
# 构建阶段
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json（优先复制锁文件）
COPY package*.json ./
COPY package-lock*.json ./

# 如果没有 lock 文件，使用 npm install
RUN if [ -f package-lock.json ]; then npm ci --only=production=false; else npm install; fi

# 复制源码
COPY . .

# 构建项目
RUN npm run build

# ============================================
# 生产阶段
# ============================================
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
