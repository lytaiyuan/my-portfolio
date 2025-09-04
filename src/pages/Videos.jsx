// src/pages/Videos.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConfigUrl, pickUrl } from "../lib/configSource.js";

export default function Videos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 路径转换函数：将相对路径转换为GitHub raw URL
  const getGitHubUrl = (path) => (path.startsWith('http') ? path : path);

  useEffect(() => {
    let alive = true;
    
    const fetchVideos = async () => {
      try {
        const response = await fetch(getConfigUrl('videos'));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!alive) return;
        const arr = Array.isArray(data.items) ? data.items : [];
        setItems(arr);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        console.error("[Videos] 读取GitHub视频数据失败：", e);
        setErr(e);
        setLoading(false);
      }
    };
    
    fetchVideos();
    return () => { alive = false; };
  }, []);

  if (loading) return <PageWrap><p className="text-theme-muted">加载视频列表…</p></PageWrap>;
  if (err) return <PageWrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></PageWrap>;
  if (!items.length) return <PageWrap><p className="text-theme-muted">暂无视频。</p></PageWrap>;

  return (
    <>
      {/* 顶部容器：与图片页一致 */}
      <section className="relative h-[600px] videos-header overflow-hidden">
        <div className="absolute inset-0">
          <div className="max-w-[1120px] mx-auto h-full px-4">
            <div className="flex h-full justify-center items-start pt-24 md:items-center md:pt-0">
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary text-center">视频</h1>
            </div>
          </div>
        </div>
      </section>

      <PageWrap>
        <h2 className="text-2xl font-semibold mb-6 text-theme-primary">全部视频</h2>

      {/* 桌面每行最多两个（md:grid-cols-2），手机 1 列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(v => (
          <Link
            key={v.slug || v.id}
            to={`/videos/${encodeURIComponent(v.slug ?? String(v.id))}`}
            className="group overflow-hidden rounded-2xl border border-theme-primary bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={pickUrl(v.poster, v.posterLocalUrl)}
                alt={v.title || ""}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-3 bg-black/5">
              <div className="text-sm font-medium text-theme-primary">{v.title}</div>
              {v.excerpt && <div className="mt-1 text-xs text-theme-secondary line-clamp-2">{v.excerpt}</div>}
            </div>
          </Link>
        ))}
      </div>
      </PageWrap>
    </>
  );
}

function PageWrap({ children }) {
  return (
    <section className="border-t border-theme-primary bg-theme-primary">
      <div className="max-w-[1120px] mx-auto px-4 py-8 text-theme-primary">{children}</div>
    </section>
  );
}