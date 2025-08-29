// src/pages/VideoDetail.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

export default function VideoDetail() {
  const { slug } = useParams(); // /videos/:slug
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/videos.json", { cache: "no-cache" })
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
        console.error("[VideoDetail] 读取 /videos.json 失败：", e);
      });
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

  if (loading) return <Wrap><p className="text-neutral-400">加载中…</p></Wrap>;
  if (err) return <Wrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></Wrap>;
  if (!video) {
    return (
      <Wrap>
        <p className="text-neutral-400">未找到该视频。</p>
        <div className="mt-4">
          <Link className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-sm" to="/videos">
            返回视频列表
          </Link>
        </div>
      </Wrap>
    );
  }

  const { playerSrc, pageUrl } = fromEmbed(video.embed);
  const useIframe = !!playerSrc;
  const poster = video.poster || "/covers/placeholder.jpg";

  // 点击海报开始播放（iframe 直接加载；mp4 自动播放）
  const onStart = () => {
    setIsPlaying(true);
    if (!useIframe) {
      // HTML5 视频：下一帧再播放，确保已挂载
      setTimeout(() => {
        html5Ref.current?.play?.();
      }, 0);
    }
  };

  return (
    <Wrap>
      {/* 顶部播放器区：16:9 容器 */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-black">
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
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          )}
        </div>
      </div>

      {/* 标题 & 摘要 */}
      <div className="mt-6 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{video.title}</h1>
        {video.excerpt && <p className="mt-2 text-neutral-300 md:text-[15px]">{video.excerpt}</p>}
      </div>

      {/* 正文：空行分段 */}
      {video.body && (
        <div className="mt-6 text-neutral-300 leading-relaxed space-y-4 max-w-3xl mx-auto">
          {String(video.body)
            .split(/\n{2,}/)
            .map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para.trim()}
              </p>
            ))}
        </div>
      )}

      {/* 操作区 */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-sm"
          to="/videos"
        >
          返回视频列表
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