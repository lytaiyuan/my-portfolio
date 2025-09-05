// src/pages/Music.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getConfigUrl, pickUrl } from "../lib/configSource.js";

export default function Music() {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [loadedMap, setLoadedMap] = useState({});
  const [routeReadySent, setRouteReadySent] = useState(false);

  // 路径转换函数：将相对路径转换为GitHub raw URL
  const getGitHubUrl = (path) => (path.startsWith('http') ? path : path);

  useEffect(() => {
    let alive = true;
    
    const fetchMusic = async () => {
      try {
        const response = await fetch(getConfigUrl('music'));
        
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

  // 顶部容器就绪后即可结束转场
  useEffect(() => {
    if (routeReadySent) return;
    const id = requestAnimationFrame(() => {
      setRouteReadySent(true);
      window.dispatchEvent(new CustomEvent('app:routeReady'));
    });
    return () => cancelAnimationFrame(id);
  }, [routeReadySent]);

  if (loading) return <PageWrap><p className="text-neutral-400">加载音乐列表…</p></PageWrap>;
  if (err) return <PageWrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></PageWrap>;
  if (!music.length) return <PageWrap><p className="text-neutral-400">暂无音乐。</p></PageWrap>;

  return (
    <>
      {/* 顶部容器：移动端略高，容纳标题与留白 */}
      <section className="relative h-[46svh] md:h-[600px] music-header overflow-hidden">
        <div className="absolute inset-0">
          <div className="max-w-[1120px] mx-auto h-full px-4">
            <div className="flex h-full justify-center items-center">
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary text-center">音乐</h1>
            </div>
          </div>
        </div>
      </section>

      <PageWrap>
        <h2 className="text-2xl font-semibold mb-6 text-theme-primary">全部音乐</h2>

        {/* 桌面每行最多两个（md:grid-cols-2），手机 1 列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {music.map(m => {
            const key = m.cover || m.coverLocalUrl || m.slug || m.id;
            const isLoaded = !!loadedMap[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Link
                  to={`/music/${encodeURIComponent(m.slug ?? String(m.id))}`}
                  className="group overflow-hidden rounded-2xl border border-theme-primary bg-black/5 focus:outline-none"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={pickUrl(m.cover, m.coverLocalUrl)}
                      alt={m.title || ""}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                      onLoad={() => setLoadedMap(prev => (prev[key] ? prev : { ...prev, [key]: true }))}
                      onError={() => setLoadedMap(prev => (prev[key] ? prev : { ...prev, [key]: true }))}
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-theme-primary">{m.title}</div>
                    {m.excerpt && <div className="mt-1 text-xs text-theme-secondary line-clamp-2">{m.excerpt}</div>}
                  </div>
                </Link>
              </motion.div>
            );
          })}
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