// src/lib/useContent.js
import { useEffect, useState } from "react";

// 从GitHub获取hero.json配置文件
async function getHeroImages() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/hero.json');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.images)) {
        return data.images.map(img => img.path);
      }
    }
  } catch (error) {
    console.warn("Failed to load hero.json from GitHub:", error);
  }
  
  // 如果无法获取配置，返回默认图片列表作为后备
  return [
    "/hero/hero.jpg",
    "/hero/hero.1756305625.bak.jpg",
    "/hero/2.jpg",
    "/hero/IMG_8176.JPG",
    "/hero/DSC09073.JPG"
  ];
}

// 路径转换函数：将相对路径转换为GitHub raw URL，避免重复
function getGitHubUrl(path) {
  if (!path) return '';
  
  // 如果路径已经包含GitHub URL，直接返回
  if (path.includes('raw.githubusercontent.com')) {
    return path;
  }
  
  // 如果是外部链接，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  
  // 处理相对路径
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
          const response = await fetch('https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/photos.json');
          if (response.ok) {
            return await response.json();
          }
          return { items: [] };
        } catch (error) {
          console.warn("Failed to load photos from GitHub:", error);
          return { items: [] };
        }
      })(),
      (async () => {
        try {
          const response = await fetch('https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/videos.json');
          if (response.ok) {
            return await response.json();
          }
          return { items: [] };
        } catch (error) {
          console.warn("Failed to load videos from GitHub:", error);
          return { items: [] };
        }
      })()
    ])
      .then(([heroImages, photosData, videosData]) => {
        if (alive) {
          // 从配置文件中获取的图片列表中随机选择
          const randomHero = getRandomHeroImage(heroImages);
          
          setData({
            hero: getGitHubUrl(randomHero),
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
