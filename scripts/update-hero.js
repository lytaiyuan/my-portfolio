#!/usr/bin/env node

// 更新hero配置的简单脚本
import fs from 'fs';
import path from 'path';

const heroDir = 'public/hero';
const configFile = 'public/hero.json';

try {
  // 读取hero文件夹中的所有jpg/JPG文件
  const files = fs.readdirSync(heroDir)
    .filter(file => /\.(jpg|jpeg)$/i.test(file))
    .sort();
  
  if (files.length === 0) {
    console.log('❌ 在hero文件夹中没有找到jpg图片文件');
    process.exit(1);
  }
  
  // 创建配置对象
  const config = {
    version: `2025.09.01-${Date.now()}`,
    images: files.map((filename, index) => ({
      id: index + 1,
      filename: filename,
      path: `/hero/${filename}`,
      alt: `Hero图片${index + 1}`
    }))
  };
  
  // 写入配置文件
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  
  console.log('✅ Hero配置已更新！');
  console.log(`📁 找到 ${files.length} 张图片:`);
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log(`\n📝 配置文件已保存到: ${configFile}`);
  
} catch (error) {
  console.error('❌ 更新配置文件时出错:', error.message);
  process.exit(1);
}
