// src/pages/VideoDetail.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

export default function VideoDetail() {
  const { slug } = useParams(); // /videos/:slug
  const [items, setItems] = useState([]);
  const [videoDescription, setVideoDescription] = useState("");  // 存储视频描述
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 路径转换函数：将相对路径转换为GitHub raw URL
  const getGitHubUrl = (path) => {
    if (path.startsWith('http')) {
      return path; // 如果是外部链接，直接返回
    }
    return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${path}`;
  };

  useEffect(() => {
    let alive = true;
    
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/videos.json'
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
        console.error("[VideoDetail] 读取GitHub视频数据失败：", e);
      }
    };
    
    fetchVideos();
    return () => {
      alive = false;
    };
  }, []);

  const video = useMemo(() => {
    if (!items.length) return null;
    const bySlug = items.find((v) => String(v.slug) === String(slug));
    if (bySlug) return bySlug;
    const maybeId = Number(slug);
    if (!Number.isNaN(maybeId)) {
      return items.find((v) => Number(v.id) === maybeId) || null;
    }
    return null;
  }, [items, slug]);

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
    const raw = toHttps(embed.playerUrl) || parseIframeSrc(embed.iframe) || null;
    if (!raw) return { playerSrc: null, pageUrl: null };
    try {
      const u = new URL(raw);
      const m = u.href.match(/bilibili\.com\/video\/(BV[0-9A-Za-z]+)/i);
      if (m) {
        const bvid = m[1];
        const p = Number(u.searchParams.get("p") || u.searchParams.get("page") || 1) || 1;
        return {
          playerSrc: `https://player.bilibili.com/player.html?bvid=${bvid}&page=${p}`,
          pageUrl: `https://www.bilibili.com/video/${bvid}${p > 1 ? `?p=${p}` : ""}`,
        };
      }
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

  // 加载视频描述文件
  useEffect(() => {
    if (video && video.descriptionFile) {
      fetch(getGitHubUrl(video.descriptionFile))
        .then((res) => res.text())
        .then((text) => setVideoDescription(text))
        .catch((err) => console.error("Failed to load video description:", err));
    }
  }, [video]);

  if (loading) return <Wrap><p className="text-theme-muted">加载中…</p></Wrap>;
  if (err) return <Wrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></Wrap>;
  if (!video) {
    return (
      <Wrap>
        <p className="text-theme-muted">未找到该视频。</p>
        <div className="mt-4">
          <Link className="px-3 py-1.5 rounded-lg border border-theme-primary bg-theme-card hover:bg-theme-hover text-sm text-theme-primary" to="/videos">
            返回视频列表
          </Link>
        </div>
      </Wrap>
    );
  }

  const { playerSrc, pageUrl } = fromEmbed(video.embed);
  const useIframe = !!playerSrc;
  const poster = video.poster ? getGitHubUrl(video.poster) : "/covers/placeholder.jpg";

  // 点击海报开始播放（iframe 直接加载；mp4 自动播放）
  const onStart = () => {
    setIsPlaying(true);
    if (!useIframe) {
      setTimeout(() => {
        html5Ref.current?.play?.();
      }, 0);
    }
  };

  return (
    <Wrap>
      {/* 顶部播放器区：16:9 容器 */}
      <div className="overflow-hidden rounded-2xl border border-theme-primary bg-theme-card">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          {!isPlaying ? (
            // —— 初始仅显示海报 + 播放按钮 ——
            <button
              onClick={onStart}
              aria-label="播放视频"
              className="absolute inset-0 w-full h-full group"
            >
              <img
                src={poster}
                alt={video.title || "poster"}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/25 transition" />
              <div className="absolute left-3 bottom-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-neutral-700 bg-neutral-800/80 text-white backdrop-blur">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                </span>
              </div>
            </button>
          ) : useIframe ? (
            // —— B 站 iframe 播放 ——
            <iframe
              className="absolute inset-0 w-full h-full"
              src={playerSrc}
              title={video.title || "Bilibili player"}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            // —— HTML5 播放（回退到 mp4） ——
            <video
              ref={html5Ref}
              src={video.src}
              poster={poster}
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-contain bg-theme-card"
            />
          )}
        </div>
      </div>

      {/* 标题 & 摘要 */}
      <div className="mt-6 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-theme-primary">{video.title}</h1>
        {video.excerpt && <p className="mt-2 text-theme-secondary md:text-[15px]">{video.excerpt}</p>}
      </div>

      {/* 正文：从txt文件读取，空行分段，首行缩进，段落间距 */}
      {videoDescription && (
        <div className="mt-6 text-theme-secondary leading-8 text-lg max-w-3xl mx-auto px-4 sm:px-0">
          {String(videoDescription)
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

      {/* 操作区 */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-black/5 hover:bg-black/15 text-sm text-theme-primary transition-colors duration-200"
          to="/videos"
        >
          返回视频列表
        </Link>
        {pageUrl && (
          <a
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-black/5 hover:bg-black/15 text-sm text-theme-primary transition-colors duration-200"
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
    <section className="border-t border-theme-primary bg-theme-primary pt-16">
      <div className="max-w-[1120px] mx-auto px-4 py-8 text-theme-primary">{children}</div>
    </section>
  );
}