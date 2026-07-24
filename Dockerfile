# ============================================
# 全球电台 - Dockerfile
# 多阶段构建，优化镜像大小
# ============================================

# ---------- 构建阶段 ----------
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖（使用国内镜像加速）
RUN npm install --no-audit --no-fund

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# ---------- 运行阶段 ----------
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
