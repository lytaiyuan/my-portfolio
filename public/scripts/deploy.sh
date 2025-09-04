#!/bin/bash

# My Portfolio Data 部署脚本
# 用于将数据文件上传到GitHub仓库

set -e

echo "🚀 开始部署 My Portfolio Data..."

# 检查Git状态
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 工作目录是干净的，没有未提交的更改"
else
    echo "📝 检测到未提交的更改，正在添加文件..."
    git add .
    
    echo "💬 请输入提交信息:"
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update portfolio data $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    git commit -m "$commit_message"
    echo "✅ 文件已提交"
fi

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin main

echo "✅ 部署完成！"
echo "🌐 数据现在可以通过以下URL访问:"
echo "   https://raw.githubusercontent.com/your-username/my-portfolio-data/main/"
echo ""
echo "📋 配置文件URL:"
echo "   - 照片: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/photos.json"
echo "   - 音乐: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/music.json"
echo "   - 视频: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/videos.json"
echo "   - 平面设计: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/graphiccontent.json"
echo "   - 包装设计: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/packaging.json"
echo "   - VI设计: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/vi.json"
echo "   - 产品照片: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/productphotos.json"
echo "   - 主页配置: https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/hero.json"
