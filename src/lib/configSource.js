// 切换资源来源："local" 使用 public 下本地文件，"remote" 使用线上 GitHub 原始地址
export const ASSET_SOURCE = "local"; // 可改为 "remote"

export function useLocal() {
  return ASSET_SOURCE === "local";
}

export function pickUrl(remoteUrl, localUrl) {
  if (useLocal() && localUrl) return localUrl;
  return remoteUrl || localUrl || "";
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

