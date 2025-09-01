// src/pages/Music.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Music() {
  const [music, setMusic] = useState([]);
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
    
    const fetchMusic = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/music.json'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!alive) return;
        const arr = Array.isArray(data.items) ? data.items : [];
        setMusic(arr);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        console.error("[Music] 读取GitHub音乐数据失败：", e);
        setErr(e);
        setLoading(false);
      }
    };
    
    fetchMusic();
    return () => { alive = false; };
  }, []);

  if (loading) return <PageWrap><p className="text-neutral-400">加载音乐列表…</p></PageWrap>;
  if (err) return <PageWrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></PageWrap>;
  if (!music.length) return <PageWrap><p className="text-neutral-400">暂无音乐。</p></PageWrap>;

  return (
    <PageWrap>
      <h1 className="text-3xl font-semibold mb-6">音乐</h1>

      {/* 桌面每行最多两个（md:grid-cols-2），手机 1 列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {music.map(m => (
          <Link
            key={m.slug || m.id}
            to={`/music/${encodeURIComponent(m.slug ?? String(m.id))}`}
            className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={getGitHubUrl(m.cover)}
                alt={m.title || ""}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-neutral-100">{m.title}</div>
              {m.excerpt && <div className="mt-1 text-xs text-neutral-400 line-clamp-2">{m.excerpt}</div>}
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