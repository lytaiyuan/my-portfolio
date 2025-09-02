// src/pages/MusicDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";

export default function MusicDetail() {
  const { slug } = useParams();
  const [items, setItems] = useState([]);
  const [musicDescription, setMusicDescription] = useState("");
  const [scoreImages, setScoreImages] = useState([]);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 路径转换函数：将相对路径转换为GitHub raw URL，避免重复
  const getGitHubUrl = (path) => {
    if (!path) return '';
    
    console.log('[MusicDetail] 原始路径:', path);
    
    // 如果路径已经包含GitHub URL，直接返回
    if (path.includes('raw.githubusercontent.com')) {
      console.log('[MusicDetail] 路径已包含GitHub URL，直接返回:', path);
      return path;
    }
    
    // 如果是外部链接，直接返回
    if (path.startsWith('http')) {
      console.log('[MusicDetail] 外部链接，直接返回:', path);
      return path;
    }
    
    // 处理相对路径
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const finalUrl = `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${cleanPath}`;
    console.log('[MusicDetail] 构建的最终URL:', finalUrl);
    return finalUrl;
  };

  useEffect(() => {
    let alive = true;
    
    const fetchMusicData = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/music.json'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const json = await response.json();
        
        if (!alive) return;
        setItems(Array.isArray(json.items) ? json.items : []);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr(e);
        setLoading(false);
        console.error("[MusicDetail] 读取GitHub音乐数据失败：", e);
      }
    };
    
    fetchMusicData();
    return () => {
      alive = false;
    };
  }, []);

  const music = useMemo(() => {
    if (!items.length) return null;
    const bySlug = items.find((m) => String(m.slug) === String(slug));
    if (bySlug) return bySlug;
    const maybeId = Number(slug);
    if (!Number.isNaN(maybeId)) {
      return items.find((m) => Number(m.id) === maybeId) || null;
    }
    return null;
  }, [items, slug]);

  // 加载音乐描述文件
  useEffect(() => {
    if (music && music.descriptionFile) {
      const descriptionUrl = getGitHubUrl(music.descriptionFile);
      console.log('[MusicDetail] 加载描述文件:', descriptionUrl);
      
      fetch(descriptionUrl)
        .then((res) => res.text())
        .then((text) => setMusicDescription(text))
        .catch((err) => console.error("Failed to load music description:", err));
    }
  }, [music]);

  // 加载乐谱图片 - 优化版本
  useEffect(() => {
    if (music && music.scoreFolder) {
      console.log("开始加载乐谱图片，scoreFolder:", music.scoreFolder);
      
      // 设置加载状态
      setScoreLoading(true);
      
      // 使用缓存避免重复检查
      const cacheKey = `score_images_${music.slug}`;
      const cachedImages = sessionStorage.getItem(cacheKey);
      
      if (cachedImages) {
        try {
          const parsed = JSON.parse(cachedImages);
          console.log('使用缓存的乐谱图片:', parsed);
          setScoreImages(parsed);
          setScoreLoading(false);
          return;
        } catch (e) {
          console.log('缓存解析失败，重新加载');
        }
      }
      
      // 智能预加载策略：先尝试加载前几张，再并行检查其余
      const loadScoreImagesSmart = async () => {
        const validImages = [];
        
        // 策略1：直接尝试加载前3张图片（通常存在的概率最高）
        const quickLoadPromises = [];
        for (let i = 1; i <= 3; i++) {
          const paddedNum = i.toString().padStart(2, '0');
          const imageUrl = `${music.scoreFolder}${paddedNum}.jpg`;
          const githubImageUrl = getGitHubUrl(imageUrl);
          
          const quickPromise = fetch(githubImageUrl, { method: 'HEAD' })
            .then(response => {
              if (response.ok) {
                console.log(`快速加载乐谱图片 ${i}: 存在`);
                return { index: i, url: githubImageUrl };
              }
              return null;
            })
            .catch(() => null);
          
          quickLoadPromises.push(quickPromise);
        }
        
        // 等待前3张的结果
        const quickResults = await Promise.all(quickLoadPromises);
        const quickValid = quickResults.filter(result => result !== null);
        
        // 如果前3张都找到了，直接使用，避免检查更多
        if (quickValid.length === 3) {
          const sortedUrls = quickValid
            .sort((a, b) => a.index - b.index)
            .map(result => result.url);
          
          console.log('前3张乐谱图片全部找到，使用快速模式');
          sessionStorage.setItem(cacheKey, JSON.stringify(sortedUrls));
          setScoreImages(sortedUrls);
          return;
        }
        
        // 策略2：如果前3张不完整，并行检查所有图片
        console.log('前3张不完整，检查所有图片...');
        const allImagePromises = [];
        
        for (let i = 1; i <= 10; i++) {
          const paddedNum = i.toString().padStart(2, '0');
          const imageUrl = `${music.scoreFolder}${paddedNum}.jpg`;
          const githubImageUrl = getGitHubUrl(imageUrl);
          
          const checkPromise = fetch(githubImageUrl, { method: 'HEAD' })
            .then(response => {
              if (response.ok) {
                return { index: i, url: githubImageUrl };
              }
              return null;
            })
            .catch(() => null);
          
          allImagePromises.push(checkPromise);
        }
        
        const allResults = await Promise.all(allImagePromises);
        const allValid = allResults.filter(result => result !== null);
        
        // 按索引排序
        const sortedUrls = allValid
          .sort((a, b) => a.index - b.index)
          .map(result => result.url);
        
        console.log(`找到 ${sortedUrls.length} 张乐谱图片:`, sortedUrls);
        
        // 缓存结果
        sessionStorage.setItem(cacheKey, JSON.stringify(sortedUrls));
        setScoreImages(sortedUrls);
        setScoreLoading(false);
      };
      
      loadScoreImagesSmart();
    } else {
      console.log("没有找到music或scoreFolder:", { music, scoreFolder: music?.scoreFolder });
    }
  }, [music]);

  // B站视频解析
  const parseBilibiliEmbed = (embed) => {
    if (!embed) return { playerSrc: null, pageUrl: null };
    
    try {
      // 尝试从playerUrl中提取BV号
      if (embed.playerUrl) {
        const match = embed.playerUrl.match(/bvid=([^&]+)/);
        if (match) {
          const bvid = match[1];
          return {
            playerSrc: embed.playerUrl,
            pageUrl: `https://www.bilibili.com/video/${bvid}`
          };
        }
      }
      
      // 从iframe中提取
      if (embed.iframe) {
        const match = embed.iframe.match(/src=["']([^"']+)["']/);
        if (match) {
          const src = match[1];
          const bvidMatch = src.match(/bvid=([^&]+)/);
          if (bvidMatch) {
            const bvid = bvidMatch[1];
            return {
              playerSrc: src,
              pageUrl: `https://www.bilibili.com/video/${bvid}`
            };
          }
        }
      }
    } catch (e) {
      console.error("解析B站嵌入失败:", e);
    }
    
    return { playerSrc: null, pageUrl: null };
  };

  // 开始播放
  const onStart = () => {
    setIsPlaying(true);
  };

  // 清理乐谱图片缓存
  const clearScoreCache = () => {
    if (music?.slug) {
      const cacheKey = `score_images_${music.slug}`;
      sessionStorage.removeItem(cacheKey);
      console.log('已清理乐谱图片缓存');
      
      // 重新加载乐谱图片
      setScoreImages([]);
      setScoreLoading(true);
      
      // 触发重新加载
      if (music.scoreFolder) {
        const loadScoreImagesSmart = async () => {
          const allImagePromises = [];
          
          for (let i = 1; i <= 10; i++) {
            const paddedNum = i.toString().padStart(2, '0');
            const imageUrl = `${music.scoreFolder}${paddedNum}.jpg`;
            const githubImageUrl = getGitHubUrl(imageUrl);
            
            const checkPromise = fetch(githubImageUrl, { method: 'HEAD' })
              .then(response => {
                if (response.ok) {
                  return { index: i, url: githubImageUrl };
                }
                return null;
              })
              .catch(() => null);
            
            allImagePromises.push(checkPromise);
          }
          
          const allResults = await Promise.all(allImagePromises);
          const allValid = allResults.filter(result => result !== null);
          
          const sortedUrls = allValid
            .sort((a, b) => a.index - b.index)
            .map(result => result.url);
          
          console.log(`重新加载找到 ${sortedUrls.length} 张乐谱图片:`, sortedUrls);
          
          // 更新缓存
          sessionStorage.setItem(cacheKey, JSON.stringify(sortedUrls));
          setScoreImages(sortedUrls);
          setScoreLoading(false);
        };
        
        loadScoreImagesSmart();
      }
    }
  };

  if (loading) return <Wrap><p className="text-neutral-400">加载中…</p></Wrap>;
  if (err) return <Wrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></Wrap>;
  if (!music) {
    return (
      <Wrap>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-400">音乐未找到</h1>
          <p className="mt-2 text-neutral-400">找不到对应的音乐信息</p>
          <Link to="/music" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            返回音乐列表
          </Link>
        </div>
      </Wrap>
    );
  }

  const { playerSrc, pageUrl } = parseBilibiliEmbed(music.embed);

  return (
    <Wrap>
      {/* 顶部播放器区：16:9 容器 */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-black">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          {!isPlaying ? (
            // —— 初始仅显示封面 + 播放按钮 ——
            <button
              onClick={onStart}
              aria-label="播放音乐"
              className="absolute inset-0 w-full h-full group"
            >
              <img
                src={getGitHubUrl(music.cover)}
                alt={music.title || "cover"}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/25 transition" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-800/80 text-white text-sm backdrop-blur">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  点击播放
                </span>
              </div>
            </button>
          ) : (
            // —— B 站 iframe 播放 ——
            <iframe
              className="absolute inset-0 w-full h-full"
              src={playerSrc}
              title={music.title || "Bilibili player"}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </div>

      {/* 标题 & 摘要 */}
      <div className="mt-6 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{music.title}</h1>
        {music.hotintro && <p className="mt-2 text-neutral-300 md:text-[15px]">{music.hotintro}</p>}
      </div>

      {/* 正文：从txt文件读取，空行分段，首行缩进，段落间距 */}
      {musicDescription && (
        <div className="mt-6 text-neutral-300 leading-8 text-lg max-w-3xl mx-auto px-4 sm:px-0">
          {String(musicDescription)
            .split(/\n/)
            .filter(para => para.trim())
            .map((para, i) => (
              <p key={i} className="mb-8 text-justify">
                {/* 桌面端显示首行缩进，移动端隐藏 */}
                <span className="hidden md:inline-block w-8"></span>
                {para.trim()}
              </p>
            ))}
        </div>
      )}

      {/* 乐谱展示区 */}
      <div className="mt-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-xl font-semibold">乐谱</h2>
          <button
            onClick={clearScoreCache}
            className="p-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition-colors"
            title="刷新乐谱图片"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </div>
        
        {scoreLoading ? (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-flex items-center gap-3 text-neutral-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-400"></div>
              <span>正在加载乐谱图片...</span>
            </div>
            <p className="mt-2 text-sm text-neutral-500">使用智能预加载策略，通常只需1-2秒</p>
          </div>
        ) : scoreImages.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {scoreImages.map((imageUrl, index) => (
              <div key={index} className="flex justify-center">
                <img
                  src={imageUrl}
                  alt={`乐谱第${index + 1}页`}
                  className="max-w-full h-auto rounded-lg border border-neutral-800 shadow-lg"
                  loading="lazy"
                  onError={(e) => {
                    // 如果图片加载失败，隐藏这个元素
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center py-8 text-neutral-400">
            <p>暂无乐谱图片</p>
          </div>
        )}
      </div>

      {/* 操作区 */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-sm"
          to="/music"
        >
          返回音乐列表
        </Link>
        {pageUrl && (
          <a
            className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-sm"
            href={pageUrl}
            target="_blank"
            rel="noreferrer"
          >
            去 B 站观看
          </a>
        )}
      </div>
    </Wrap>
  );
}

function Wrap({ children }) {
  return (
    <section className="border-t border-neutral-900/80 bg-neutral-950">
      <div className="max-w-[1120px] mx-auto px-4 py-8">{children}</div>
    </section>
  );
}
