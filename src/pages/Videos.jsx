// src/pages/Videos.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Videos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/videos.json", { cache: "no-cache" })
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
        console.error("[Videos] 读取 /videos.json 失败：", e);
      });
    return () => { alive = false; };
  }, []);

  if (loading) return <PageWrap><p className="text-neutral-400">加载视频列表…</p></PageWrap>;
  if (err) return <PageWrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></PageWrap>;
  if (!items.length) return <PageWrap><p className="text-neutral-400">暂无视频。</p></PageWrap>;

  return (
    <PageWrap>
      <h1 className="text-3xl font-semibold mb-6">视频</h1>

      {/* 桌面每行最多两个（md:grid-cols-2），手机 1 列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(v => (
          <Link
            key={v.slug || v.id}
            to={`/videos/${encodeURIComponent(v.slug ?? String(v.id))}`}
            className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={v.poster}
                alt={v.title || ""}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-neutral-100">{v.title}</div>
              {v.excerpt && <div className="mt-1 text-xs text-neutral-400 line-clamp-2">{v.excerpt}</div>}
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