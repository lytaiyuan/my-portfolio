// 切换资源来源："local" 使用 public 下本地文件，"remote" 使用线上 GitHub 原始地址
export const ASSET_SOURCE = "local"; // 可改为 "remote"

export function useLocal() {
  return ASSET_SOURCE === "local";
}

export function pickUrl(remoteUrl, localUrl) {
  // 本地优先
  if (useLocal()) return localUrl || remoteUrl || "";
  // 远程优先：若是绝对 URL 直接用；否则构造成 GitHub Raw
  if (remoteUrl) {
    if (/^https?:\/\//i.test(remoteUrl)) return remoteUrl;
    return buildRawAssetUrl(remoteUrl);
  }
  return localUrl || "";
}

export function getConfigUrl(name) {
  // name 如 "photos", "videos", "music", "hero"
  if (useLocal()) return `/config/${name}.json`;
  const map = {
    hero: 'hero.json',
    photos: 'config/photos.json',
    videos: 'config/videos.json',
    music: 'config/music.json',
    graphiccontent: 'config/graphiccontent.json',
    packaging: 'config/packaging.json',
    vi: 'config/vi.json',
    productphotos: 'config/productphotos.json',
  };
  const path = map[name] || name;
  return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/${path}`;
}

// 统一构造远程静态资源（图片/PDF 等）的 GitHub Raw 地址
// 当 JSON 里仅给出相对路径时，可用此方法保证在 "remote" 模式下正确取远端
export function buildRawAssetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const cleaned = String(path).replace(/^\/+/, "");
  return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/${cleaned}`;
}

