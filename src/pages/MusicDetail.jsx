// src/pages/MusicDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";

export default function MusicDetail() {
  const { slug } = useParams();
  const [items, setItems] = useState([]);
  const [musicDescription, setMusicDescription] = useState("");
  const [scoreImages, setScoreImages] = useState([]);
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

  // 加载乐谱图片
  useEffect(() => {
    if (music && music.scoreFolder) {
      console.log("开始加载乐谱图片，scoreFolder:", music.scoreFolder);
      
      // 检测乐谱图片是否存在，只显示实际存在的图片
      const checkImageExists = async (url) => {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          console.log(`检查图片 ${url}: ${response.ok ? '存在' : '不存在'}`);
          return response.ok;
        } catch (error) {
          console.log(`检查图片 ${url} 时出错:`, error);
          return false;
        }
      };

      const loadScoreImages = async () => {
        const validImages = [];
        for (let i = 1; i <= 10; i++) {
          const paddedNum = i.toString().padStart(2, '0');
          const imageUrl = `${music.scoreFolder}${paddedNum}.jpg`;
          const githubImageUrl = getGitHubUrl(imageUrl);
          console.log(`尝试加载乐谱图片: ${githubImageUrl}`);
          if (await checkImageExists(githubImageUrl)) {
            validImages.push(githubImageUrl);
            console.log(`乐谱图片 ${githubImageUrl} 加载成功`);
          }
        }
        console.log(`最终找到的乐谱图片:`, validImages);
        setScoreImages(validImages);
      };

      loadScoreImages();
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
      {scoreImages.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-center mb-6">乐谱</h2>
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
        </div>
      )}

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
