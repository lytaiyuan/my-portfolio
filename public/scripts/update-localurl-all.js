#!/usr/bin/env node

/**
 * 为所有配置 JSON 文件的项目添加本地路径字段 `localUrl`。
 * 计算规则：
 * - 基于主要媒体字段生成：
 *   - photos.json: 使用 item.url -> /photos/文件名
 *   - videos.json: 使用 item.poster -> /videos/.../文件名
 *   - music.json: 使用 item.cover -> /music/.../文件名
 *   - graphiccontent.json: 使用 item.cover -> /graphic/.../文件名
 *   - packaging.json: 使用 item.cover -> /packaging/.../文件名
 *   - vi.json: 使用 item.cover -> /vi/.../文件名
 *   - hero.json: 使用 image.path -> /hero/.../文件名
 *   - productphotos.json: 使用 item.url（已为本地相对路径）
 * - 若已有 localUrl，则覆盖为规范化结果；若存在 localURL，则保留不改动。
 */

const fs = require('fs');
const path = require('path');

const REPO_RAW_PREFIX = 'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main';

/**
 * 从一个可能是 GitHub raw URL、绝对/相对路径或仅文件名的字符串
 * 推导出以 "/" 开头的本地相对路径。
 */
function toLocalPath(input, fallbackDirIfFilenameOnly) {
  if (!input || typeof input !== 'string') return undefined;

  // 如果是 GitHub raw 完整 URL，提取 main 后的路径部分
  if (input.startsWith('http://') || input.startsWith('https://')) {
    if (input.startsWith(REPO_RAW_PREFIX)) {
      const rest = input.slice(REPO_RAW_PREFIX.length);
      return rest.startsWith('/') ? rest : `/${rest}`;
    }
    // 对于非仓库内的外链，不生成本地路径
    return undefined;
  }

  // 已是以 / 开头的相对路径
  if (input.startsWith('/')) return input;

  // 带目录的相对路径（如 photos/xxx.jpg）
  if (input.includes('/')) return `/${input}`;

  // 仅文件名，尝试用提供的目录补齐
  if (fallbackDirIfFilenameOnly) {
    return `/${fallbackDirIfFilenameOnly.replace(/^\/+/, '')}/${input}`;
  }

  return undefined;
}

function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function writeJson(jsonPath, data) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
}

function ensureDirJsonExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  文件不存在: ${filePath}`);
    return false;
  }
  return true;
}

function processPhotos(filePath) {
  const data = readJson(filePath);
  if (!Array.isArray(data.items)) return;
  data.items.forEach(item => {
    // 优先从 url 推导
    let local = toLocalPath(item.url, 'photos');
    // 如果还没有，尝试使用 filename
    if (!local && item.filename) local = toLocalPath(item.filename, 'photos');
    if (local) item.localurl = local; // 单链接：仅写 localurl（全小写）
    // 清理通用命名
    delete item.localUrl;
    delete item.localURL;
  });
  writeJson(filePath, data);
  console.log(`✅ 已更新 localUrl: ${filePath}`);
}

function processVideos(filePath) {
  const data = readJson(filePath);
  if (!Array.isArray(data.items)) return;
  data.items.forEach(item => {
    // 使用 poster 作为主要本地资源
    const posterLocal = toLocalPath(item.poster, 'videos');
    if (posterLocal) item.posterLocalUrl = posterLocal;
    const descLocal = toLocalPath(item.descriptionFile, 'videos');
    if (descLocal) item.descriptionLocalUrl = descLocal;
    // 对于外链视频 src（如 R2/CDN），不会生成本地路径
    // 清理通用命名
    delete item.localUrl;
    delete item.localURL;
  });
  writeJson(filePath, data);
  console.log(`✅ 已更新 localUrl: ${filePath}`);
}

function processMusic(filePath) {
  const data = readJson(filePath);
  if (!Array.isArray(data.items)) return;
  data.items.forEach(item => {
    const coverLocal = toLocalPath(item.cover, 'music');
    if (coverLocal) item.coverLocalUrl = coverLocal;
    const descLocal = toLocalPath(item.descriptionFile, 'music');
    if (descLocal) item.descriptionLocalUrl = descLocal;
    const scoreLocal = toLocalPath(item.scoreFolder, 'music');
    if (scoreLocal) item.scoreFolderLocalUrl = scoreLocal;
    // 清理通用命名
    delete item.localUrl;
    delete item.localURL;
  });
  writeJson(filePath, data);
  console.log(`✅ 已更新 localUrl: ${filePath}`);
}

function processGraphicLike(filePath, baseDir) {
  const data = readJson(filePath);
  if (!Array.isArray(data.items)) return;
  data.items.forEach(item => {
    const coverLocal = toLocalPath(item.cover, baseDir);
    if (coverLocal) item.coverLocalUrl = coverLocal;
    const pdfLocal = toLocalPath(item.pdf, baseDir);
    if (pdfLocal) item.pdfLocalUrl = pdfLocal;
    if (Array.isArray(item.images)) {
      const imageLocals = item.images
        .map(url => toLocalPath(url, baseDir))
        .filter(Boolean);
      if (imageLocals.length === item.images.length) {
        item.imagesLocalUrls = imageLocals;
      }
    }
    // 清理通用命名
    delete item.localUrl;
    delete item.localURL;
  });
  writeJson(filePath, data);
  console.log(`✅ 已更新 localUrl: ${filePath}`);
}

function processHero(filePath) {
  const data = readJson(filePath);
  if (!Array.isArray(data.images)) return;
  data.images.forEach(img => {
    const local = toLocalPath(img.path, 'hero');
    if (local) img.localurl = local; // 单链接：仅写 localurl（全小写）
    // 清理通用命名
    delete img.localUrl;
    delete img.localURL;
    delete img.pathLocalUrl;
  });
  writeJson(filePath, data);
  console.log(`✅ 已更新 localUrl: ${filePath}`);
}

function processProductPhotos(filePath) {
  const data = readJson(filePath);
  if (!Array.isArray(data.photos)) return;
  data.photos.forEach(item => {
    const local = toLocalPath(item.url, 'product');
    if (local) item.localurl = local; // 单链接：仅写 localurl（全小写）
    // 清理通用命名
    delete item.localUrl;
    delete item.localURL;
  });
  writeJson(filePath, data);
  console.log(`✅ 已更新 localUrl: ${filePath}`);
}

function main() {
  console.log('🚀 开始为配置 JSON 添加/规范化 localUrl 字段...');

  const targets = [
    { file: path.join(__dirname, '../config/photos.json'), handler: processPhotos },
    { file: path.join(__dirname, '../config/videos.json'), handler: processVideos },
    { file: path.join(__dirname, '../config/music.json'), handler: processMusic },
    { file: path.join(__dirname, '../config/graphiccontent.json'), handler: (fp) => processGraphicLike(fp, 'graphic') },
    { file: path.join(__dirname, '../config/packaging.json'), handler: (fp) => processGraphicLike(fp, 'packaging') },
    { file: path.join(__dirname, '../config/vi.json'), handler: (fp) => processGraphicLike(fp, 'vi') },
    { file: path.join(__dirname, '../config/hero.json'), handler: processHero },
    { file: path.join(__dirname, '../config/productphotos.json'), handler: processProductPhotos },
  ];

  let processed = 0;

  targets.forEach(t => {
    if (!ensureDirJsonExists(t.file)) return;
    try {
      t.handler(t.file);
      processed += 1;
    } catch (e) {
      console.error(`❌ 处理失败: ${t.file}`, e.message);
    }
  });

  console.log(`\n🎉 处理完成，成功更新 ${processed} 个文件的 localUrl 字段。`);
}

main();


