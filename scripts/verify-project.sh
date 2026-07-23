#!/bin/bash
# 验证项目结构完整性

set -e

echo "🔍 验证项目结构..."

# 检查必要文件
required_files=(
  "index.html"
  "package.json"
  "vite.config.ts"
  "src/main.ts"
  "src/App.vue"
  "src/router/index.ts"
  "src/stores/language.ts"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ 缺少必要文件: $file"
    echo "当前目录内容:"
    ls -la
    exit 1
  else
    echo "✅ $file 存在"
  fi
done

# 检查 src 目录结构
echo "📁 src 目录结构:"
find src -type f -name "*.ts" -o -name "*.vue" | head -20

echo "✅ 项目结构验证通过"
