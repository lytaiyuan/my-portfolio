// src/lib/useContent.js
import { useEffect, useState } from "react";

// Hero图片列表 - 可以随时添加新的jpg/JPG文件到这个文件夹
const HERO_IMAGES = [
  "/hero/hero.jpg",
  "/hero/hero.1756305625.bak.jpg",
  "/hero/2.jpg",
  "/hero/IMG_8176.JPG",
  "/hero/DSC09073.JPG"
];

// 随机选择hero图片的函数
function getRandomHeroImage() {
  const randomIndex = Math.floor(Math.random() * HERO_IMAGES.length);
  return HERO_IMAGES[randomIndex];
}

export function useContent() {
  const [data, setData] = useState({ hero: getRandomHeroImage(), photos: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    
    // 直接从专门的配置文件获取数据
    Promise.all([
      fetch("/photos.json", { cache: "no-cache" }),
      fetch("/videos.json", { cache: "no-cache" })
    ])
      .then((responses) => {
        if (!responses[0].ok) throw new Error("Photos HTTP " + responses[0].status);
        if (!responses[1].ok) throw new Error("Videos HTTP " + responses[1].status);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([photosData, videosData]) => {
        if (alive) {
          setData({
            hero: getRandomHeroImage(), // 每次调用都随机选择
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
            hero: getRandomHeroImage(), // 错误时也随机选择
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
