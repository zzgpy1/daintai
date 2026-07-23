#!/bin/bash
set -e

echo "🔍 验证项目结构..."

required_files=(
  "index.html"
  "package.json"
  "vite.config.ts"
  "tsconfig.json"
  "src/main.ts"
  "src/App.vue"
  "src/router/index.ts"
  "src/stores/language.ts"
  "src/stores/theme.ts"
  "public/favicon.svg"
)

missing_files=()
for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    missing_files+=("$file")
    echo "❌ 缺少必要文件: $file"
  else
    echo "✅ $file 存在"
  fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
  echo ""
  echo "❌ 缺少 ${#missing_files[@]} 个必要文件，请检查项目结构"
  exit 1
fi

echo ""
echo "📁 src 目录结构:"
find src -type f \( -name "*.ts" -o -name "*.vue" -o -name "*.css" \) | head -30

echo ""
echo "✅ 项目结构验证通过"
