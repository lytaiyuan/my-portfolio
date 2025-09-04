const fs = require('fs');
const path = require('path');

// 读取photos.json文件
const photosPath = path.join(__dirname, '../config/photos.json');
const photosData = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

// 更新每个照片项目，添加localURL字段
photosData.items.forEach(item => {
  // 从GitHub URL中提取文件名
  const githubUrl = item.url;
  const fileName = githubUrl.split('/').pop();
  
  // 添加localURL字段，指向本地文件
  item.localURL = `photos/${fileName}`;
});

// 写回文件
fs.writeFileSync(photosPath, JSON.stringify(photosData, null, 2));

console.log('✅ 已为photos.json中的所有项目添加localURL字段');
console.log(`📊 共更新了 ${photosData.items.length} 个照片项目`);

// 显示前几个示例
console.log('\n📋 更新示例：');
photosData.items.slice(0, 3).forEach(item => {
  console.log(`ID ${item.id}: ${item.title}`);
  console.log(`  GitHub URL: ${item.url}`);
  console.log(`  Local URL:  ${item.localURL}`);
  console.log('');
});
