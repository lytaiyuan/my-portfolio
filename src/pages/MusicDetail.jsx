import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

export default function MusicDetail() {
  const { slug } = useParams(); // /music/:slug
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [description, setDescription] = useState(""); // 用来存储加载的文本内容
  const [scoreImages, setScoreImages] = useState([]); // 存储乐谱图片列表

  useEffect(() => {
    let alive = true;
    fetch("/music.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((json) => {
        if (!alive) return;
        setItems(Array.isArray(json.items) ? json.items : []);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e);
        setLoading(false);
        console.error("[MusicDetail] 读取 /music.json 失败：", e);
      });
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

  // 读取 descriptionFile（txt文件内容）
  useEffect(() => {
    if (music && music.descriptionFile) {
      fetch(music.descriptionFile)
        .then((res) => res.text())
        .then((text) => setDescription(text))
        .catch((err) => console.error("Failed to load description file:", err));
    }
  }, [music]);

  // 加载乐谱图片
  useEffect(() => {
    if (music && music.scoreFolder) {
      // 这里需要根据实际的文件结构来加载乐谱图片
      // 暂时使用占位符，实际实现时需要后端API或预定义的图片列表
      const loadScoreImages = async () => {
        try {
          // 尝试加载乐谱图片（这里假设有1.jpg, 2.jpg等）
          const images = [];
          let index = 1;
          while (index <= 10) { // 最多尝试10张图片
            try {
              const response = await fetch(`${music.scoreFolder}${index}.jpg`);
              if (response.ok) {
                images.push({
                  url: `${music.scoreFolder}${index}.jpg`,
                  index: index
                });
              } else {
                break; // 如果某张图片不存在，停止加载
              }
            } catch {
              break;
            }
            index++;
          }
          setScoreImages(images);
        } catch (error) {
          console.error("Failed to load score images:", error);
        }
      };
      
      loadScoreImages();
    }
  }, [music]);

  // —— 播放控制（默认不播放，先显示封面） ——
  const [isPlaying, setIsPlaying] = useState(false);
  const html5Ref = useRef(null);

  // —— embed 解析：支持 B 站视频页 URL 或 player URL，也兼容直接 iframe 片段 ——
  const toHttps = (u) => (u && u.startsWith("//") ? "https:" + u : u);
  const parseIframeSrc = (html) => {
    if (!html) return null;
    const m = String(html).match(/src=["']([^"']+)["']/i);
    return m ? toHttps(m[1]) : null;
  };
  const fromEmbed = (embed) => {
    if (!embed) return { playerSrc: null, pageUrl: null };
    
    // 处理B站视频链接
    if (embed.bilibili) {
      const bvid = embed.bilibili;
      const page = embed.page || 1;
      return {
        playerSrc: `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}`,
        pageUrl: `https://www.bilibili.com/video/${bvid}${page > 1 ? `?p=${page}` : ""}`,
      };
    }
    
    const raw = toHttps(embed.playerUrl) || parseIframeSrc(embed.iframe) || null;
    if (!raw) return { playerSrc: null, pageUrl: null };
    
    try {
      const u = new URL(raw);
      // https://www.bilibili.com/video/BVxxxx/?p=2
      const m = u.href.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]+)/i);
      if (m) {
        const bvid = m[1];
        const p = Number(u.searchParams.get("p") || u.searchParams.get("page") || 1) || 1;
        return {
          playerSrc: `https://player.bilibili.com/player.html?bvid=${bvid}&page=${p}`,
          pageUrl: `https://www.bilibili.com/video/${bvid}${p > 1 ? `?p=${p}` : ""}`,
        };
      }
      // https://player.bilibili.com/player.html?bvid=BVxxxx&page=1
      if (/player\.bilibili\.com/i.test(u.hostname)) {
        const bvid = u.searchParams.get("bvid");
        const p = Number(u.searchParams.get("page") || u.searchParams.get("p") || 1) || 1;
        return {
          playerSrc: u.href,
          pageUrl: bvid ? `https://www.bilibili.com/video/${bvid}${p > 1 ? `?p=${p}` : ""}` : null,
        };
      }
    } catch {
      /* ignore */
    }
    return { playerSrc: raw, pageUrl: null };
  };

  // 处理 description 文件中的每段文字：首行缩进 + 段落间距
  const formatDescription = (text) => {
    if (!text) return null;
    
    // 更健壮的分段：处理多种换行符和空白
    const paragraphs = text
      .split(/\n\s*\n/) // 按双换行分段，允许中间有空格
      .map(p => p.trim()) // 去除每段首尾空白
      .filter(p => p.length > 0); // 过滤空段落
    
    return paragraphs.map((paragraph, index) => (
      <p 
        key={index} 
        className="mb-8 leading-8 text-lg"
        style={{ 
          textAlign: 'justify'
        }}
      >
        <span className="hidden md:inline-block w-8"></span>
        {paragraph}
      </p>
    ));
  };

  if (loading) return <Wrap><p className="text-neutral-400">加载中…</p></Wrap>;
  if (err) return <Wrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></Wrap>;
  if (!music) {
    return (
      <Wrap>
        <p className="text-neutral-400">未找到该音乐。</p>
        <div className="mt-4">
          <Link className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-sm" to="/music">
            返回音乐列表
          </Link>
        </div>
      </Wrap>
    );
  }

  const { playerSrc, pageUrl } = fromEmbed(music.video);
  const useIframe = !!playerSrc;
  const poster = music.cover || "/covers/placeholder.jpg";

  // 点击封面开始播放（iframe 直接加载）
  const onStart = () => {
    setIsPlaying(true);
  };

  return (
    <Wrap>
      {/* 顶部播放器区：16:9 容器 */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-black">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          {!isPlaying ? (
            // —— 初始仅显示封面 + 播放按钮 ——
            <button
              onClick={onStart}
              aria-label="播放音乐视频"
              className="absolute inset-0 w-full h-full group"
            >
              <img
                src={poster}
                alt={music.title || "music cover"}
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
          ) : useIframe ? (
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
          ) : (
            // —— 如果没有B站链接，显示封面和提示 ——
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <div className="text-center text-neutral-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto mb-4">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p>暂无视频链接</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 标题 & 摘要 */}
      <div className="mt-6 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{music.title}</h1>
        {music.hottitle && <p className="mt-2 text-neutral-300 md:text-[15px]">{music.hottitle}</p>}
        {music.duration && <p className="mt-1 text-neutral-400 text-sm">时长：{music.duration}</p>}
      </div>

      {/* 标签 */}
      {music.tags && music.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {music.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 text-sm rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              {tag}
            </span>
            ))}
        </div>
      )}

      {/* 正文：空行分段 */}
      {description && (
        <div className="mt-8 text-neutral-300 leading-relaxed space-y-4 max-w-3xl mx-auto px-4 sm:px-0">
          {formatDescription(description)}
        </div>
      )}

      {/* 乐谱展示 */}
      {scoreImages.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-center mb-6">乐谱</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {scoreImages.map((img) => (
              <div key={img.index} className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                <img
                  src={img.url}
                  alt={`乐谱第${img.index}页`}
                  className="w-full h-auto block cursor-pointer hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onClick={() => {
                    // 点击放大查看乐谱
                    window.open(img.url, '_blank');
                  }}
                />
                <div className="p-2 text-center text-xs text-neutral-400">
                  第{img.index}页
                </div>
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
