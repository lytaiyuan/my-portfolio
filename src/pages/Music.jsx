// src/pages/Music.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Music() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/music.json", { cache: "no-cache" })
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(json => {
        if (!alive) return;
        const arr = Array.isArray(json.items) ? json.items : [];
        setItems(arr);
        setLoading(false);
      })
      .catch(e => {
        if (!alive) return;
        setErr(e);
        setLoading(false);
        console.error("[Music] 读取 /music.json 失败：", e);
      });
    return () => { alive = false; };
  }, []);

  if (loading) return <PageWrap><p className="text-neutral-400">加载音乐列表…</p></PageWrap>;
  if (err) return <PageWrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></PageWrap>;
  if (!items.length) return <PageWrap><p className="text-neutral-400">暂无音乐。</p></PageWrap>;

  return (
    <PageWrap>
      <h1 className="text-3xl font-semibold mb-6">音乐</h1>

      {/* 桌面每行最多两个（md:grid-cols-2），手机 1 列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(music => (
          <Link
            key={music.slug || music.id}
            to={`/music/${encodeURIComponent(music.slug ?? String(music.id))}`}
            className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={music.cover}
                alt={music.title || ""}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
              {/* 音乐播放图标覆盖层 */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-800/70 text-white text-xs backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span>播放音乐</span>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-neutral-100">{music.title}</div>
              {music.hotintro && <div className="mt-1 text-xs text-neutral-400 line-clamp-2">{music.hotintro}</div>}
              {music.duration && <div className="mt-2 text-xs text-neutral-500">{music.duration}</div>}
              {music.tags && music.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {music.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </PageWrap>
  );
}

function PageWrap({ children }) {
  return (
    <section className="border-t border-neutral-900/80 bg-neutral-950">
      <div className="max-w-[1120px] mx-auto px-4 py-8">{children}</div>
    </section>
  );
}