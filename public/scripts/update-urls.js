#!/usr/bin/env node

/**
 * 更新配置文件中的URL路径
 * 将本地路径改为GitHub完整URL
 */

const fs = require('fs');
const path = require('path');

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main';

// 需要更新的配置文件
const configFiles = [
  'config/photos.json',
  'config/music.json',
  'config/videos.json',
  'config/graphiccontent.json',
  'hero.json',
  'packaging.json',
  'vi.json',
  'productphotos.json'
];

/**
 * 更新文件中的URL路径
 */
function updateFileUrls(filePath) {
  console.log(`正在更新: ${filePath}`);
  
  try {
    // 读取文件
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // 更新照片URL
    if (filePath.includes('photos.json')) {
      const newContent = content.replace(
        /"url": "\/photos\//g,
        `"url": "${GITHUB_BASE_URL}/photos/`
      );
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        updated = true;
      }
    }
    
    // 更新音乐URL
    if (filePath.includes('music.json')) {
      let newContent = content.replace(
        /"cover": "\/music\//g,
        `"cover": "${GITHUB_BASE_URL}/music/`
      );
      newContent = newContent.replace(
        /"descriptionFile": "\/music\//g,
        `"descriptionFile": "${GITHUB_BASE_URL}/music/`
      );
      newContent = newContent.replace(
        /"scoreFolder": "\/music\//g,
        `"scoreFolder": "${GITHUB_BASE_URL}/music/`
      );
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        updated = true;
      }
    }
    
    // 更新视频URL
    if (filePath.includes('videos.json')) {
      let newContent = content.replace(
        /"poster": "\/videos\//g,
        `"poster": "${GITHUB_BASE_URL}/videos/`
      );
      newContent = newContent.replace(
        /"descriptionFile": "\/videos\//g,
        `"descriptionFile": "${GITHUB_BASE_URL}/videos/`
      );
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        updated = true;
      }
    }
    
    // 更新平面设计URL
    if (filePath.includes('graphiccontent.json')) {
      let newContent = content.replace(
        /"cover": "\/graphic\//g,
        `"cover": "${GITHUB_BASE_URL}/graphic/`
      );
      newContent = newContent.replace(
        /"images": \["\/graphic\//g,
        `"images": ["${GITHUB_BASE_URL}/graphic/`
      );
      newContent = newContent.replace(
        /"pdf": "\/graphic\//g,
        `"pdf": "${GITHUB_BASE_URL}/graphic/`
      );
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        updated = true;
      }
    }
    
    // 更新包装设计URL
    if (filePath.includes('packaging.json')) {
      let newContent = content.replace(
        /"cover": "\/packaging\//g,
        `"cover": "${GITHUB_BASE_URL}/packaging/`
      );
      newContent = newContent.replace(
        /"images": \["\/packaging\//g,
        `"images": ["${GITHUB_BASE_URL}/packaging/`
      );
      newContent = newContent.replace(
        /"pdf": "\/packaging\//g,
        `"pdf": "${GITHUB_BASE_URL}/packaging/`
      );
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        updated = true;
      }
    }
    
    // 更新VI设计URL
    if (filePath.includes('vi.json')) {
      let newContent = content.replace(
        /"cover": "\/vi\//g,
        `"cover": "${GITHUB_BASE_URL}/vi/`
      );
      newContent = newContent.replace(
        /"images": \["\/vi\//g,
        `"images": ["${GITHUB_BASE_URL}/vi/`
      );
      newContent = newContent.replace(
        /"pdf": "\/vi\//g,
        `"pdf": "${GITHUB_BASE_URL}/vi/`
      );
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        updated = true;
      }
    }
    
    // 更新hero.json中的path字段
    if (filePath.includes('hero.json')) {
      let newContent = content.replace(
        /"path": "\/hero\//g,
        `"path": "${GITHUB_BASE_URL}/hero/`
      );
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        updated = true;
      }
    }
    
    if (updated) {
      console.log(`✅ ${filePath} 更新完成`);
    } else {
      console.log(`⚠️  ${filePath} 无需更新`);
    }
    
  } catch (error) {
    console.error(`❌ 更新 ${filePath} 失败:`, error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始更新配置文件中的URL路径...\n');
  console.log(`GitHub基础URL: ${GITHUB_BASE_URL}\n`);
  
  // 更新所有配置文件
  configFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      updateFileUrls(filePath);
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  });
  
  console.log('\n🎉 URL更新完成！');
  console.log('现在所有配置文件中的路径都指向GitHub了');
  console.log('\n⚠️  注意：前端代码中还有硬编码的路径需要手动更新：');
  console.log('   - HomeDesign.jsx 中的 /home/design/cover.jpg');
  console.log('   - Home.jsx 中的 /about.jpg');
}

// 运行脚本
main();
