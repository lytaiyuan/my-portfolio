// src/lib/useContent.js
import { useEffect, useState } from "react";
import { getConfigUrl } from "./configSource.js";

// 从本地 public 目录读取 hero.json 配置（保留远程 url 字段，但优先使用本地路径）
async function getHeroImages() {
  try {
    const response = await fetch(getConfigUrl('hero'), { cache: 'no-cache' });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.images)) {
        // 优先本地字段（localurl/local），其次 path（可能为远程）、最后 url
        return data.images
          .map((img) => img.localurl || img.local || img.path || img.url)
          .filter(Boolean);
      }
    }
  } catch (error) {
    console.warn("Failed to load local hero.json:", error);
  }
  // 如果无法获取配置，返回默认图片列表作为后备（本地）
  return [
    "/hero/hero.jpg",
    "/hero/hero.1756305625.bak.jpg",
    "/hero/2.jpg",
    "/hero/123.jpg",
    "/hero/234.jpg",
    "/hero/DSC09073.JPG"
  ];
}

// 保留：其他内容可能仍使用 GitHub 资源的场景
function getGitHubUrl(path) {
  if (!path) return '';
  if (path.includes('raw.githubusercontent.com')) return path;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${cleanPath}`;
}

// 随机选择hero图片的函数
function getRandomHeroImage(heroImages) {
  if (!Array.isArray(heroImages) || heroImages.length === 0) {
    return "/hero/hero.jpg"; // 默认图片
  }
  const randomIndex = Math.floor(Math.random() * heroImages.length);
  return heroImages[randomIndex];
}

export function useContent() {
  const [data, setData] = useState({ hero: "/hero/hero.jpg", photos: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    
    // 从GitHub获取数据
    Promise.all([
      getHeroImages(),
      (async () => {
        try {
          const response = await fetch(getConfigUrl('photos'));
          if (response.ok) {
            return await response.json();
          }
          return { items: [] };
        } catch (error) {
          console.warn("Failed to load photos config:", error);
          return { items: [] };
        }
      })(),
      (async () => {
        try {
          const response = await fetch(getConfigUrl('videos'));
          if (response.ok) {
            return await response.json();
          }
          return { items: [] };
        } catch (error) {
          console.warn("Failed to load videos config:", error);
          return { items: [] };
        }
      })()
    ])
      .then(([heroImages, photosData, videosData]) => {
        if (alive) {
          // 从配置文件中获取的图片列表中随机选择（本地路径为主）
          const randomHero = getRandomHeroImage(heroImages);
          setData({
            hero: randomHero,
            photos: Array.isArray(photosData.items) ? photosData.items : [],
            videos: Array.isArray(videosData.items) ? videosData.items : [],
          });
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          console.warn("Failed to load content, using default:", e);
          setData({
            hero: "/hero/hero.jpg", // 错误时使用默认图片
            photos: [],
            videos: [],
          });
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, []);

  return { ...data, loading, error };
}
