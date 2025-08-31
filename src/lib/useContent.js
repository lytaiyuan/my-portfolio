// src/lib/useContent.js
import { useEffect, useState } from "react";

// 从hero.json配置文件获取hero图片列表
async function getHeroImages() {
  try {
    const response = await fetch('/hero.json', { cache: "no-cache" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.images)) {
        return data.images.map(img => img.path);
      }
    }
  } catch (error) {
    console.warn("Failed to load hero.json:", error);
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
    
    // 从hero.json获取图片列表并随机选择
    Promise.all([
      getHeroImages(),
      fetch("/photos.json", { cache: "no-cache" }),
      fetch("/videos.json", { cache: "no-cache" })
    ])
      .then((responses) => {
        if (!responses[1].ok) throw new Error("Photos HTTP " + responses[1].status);
        if (!responses[2].ok) throw new Error("Videos HTTP " + responses[2].status);
        return Promise.all([responses[0], responses[1].json(), responses[2].json()]);
      })
      .then(([heroImages, photosData, videosData]) => {
        if (alive) {
          // 从配置文件中获取的图片列表中随机选择
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
