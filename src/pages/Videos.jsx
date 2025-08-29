// src/pages/Videos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ALL = "全部";
const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Videos() {
  const [items, setItems] = useState([]);
  const [tag, setTag] = useState(ALL);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [box, setBox] = useState(null); // {index}

  useEffect(() => {
    let alive = true;
    const BASE = (import.meta.env.BASE_URL || "/");
    fetch(`${BASE}content.json`, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!alive) return;
        const videos = Array.isArray(json.videos) ? json.videos : [];
        setItems(videos);
        setLoading(false);
        document.title = "Li Yang Studio — 视频";
      })
      .catch((e) => {
        if (!alive) return;
        console.error("[Videos] 读取 content.json 失败：", e);
        setErr(e);
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const tags = useMemo(() => {
    const s = new Set();
    items.forEach((v) => (v.tags || []).forEach((t) => s.add(t)));
    return [ALL, ...Array.from(s)];
  }, [items]);

  const list = useMemo(() => {
    return items.filter((v) => {
      const okT = tag === ALL || (v.tags || []).includes(tag);
      const okQ = !q || (v.title || "").toLowerCase().includes(q.toLowerCase());
      return okT && okQ;
    });
  }, [items, tag, q]);

  if (loading) return <Wrap><p className="text-neutral-400">加载视频中…</p></Wrap>;
  if (err) return <Wrap><ErrorBox err={err} /></Wrap>;

  return (
    <Wrap>
      <h1 className="text-2xl font-semibold">视频</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(t)} className={cx(
            "px-3 py-1.5 rounded-full text-sm border transition",
            tag === t ? "bg-neutral-100 text-neutral-900 border-neutral-200"
                      : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800"
          )}>{t}</button>
        ))}
        <div className="ml-auto w-full sm:w-64">
          <input
            type="text"
            placeholder="搜索视频标题…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 px-3 py-2 text-sm bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((v, i) => (
          <button
            key={v.src}
            onClick={() => setBox({ index: i })}
            className="group text-left overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={v.poster}
                alt={v.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/10 transition">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-800/70 text-white text-xs backdrop-blur">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <span className="opacity-90">{v.duration || "播放"}</span>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-neutral-100">{v.title}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(v.tags || []).map((t) => (
                  <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 播放弹窗 */}
      <AnimatePresence>
        {box && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBox(null)}
          >
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setBox(null)}
                className="absolute -top-10 right-0 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:bg-neutral-800"
              >关闭</button>
              <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black">
                <video
                  src={list[box.index]?.src}
                  poster={list[box.index]?.poster}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-auto block"
                />
              </div>
              <div className="mt-3 text-neutral-300 text-sm">
                <strong>{list[box.index]?.title}</strong>
                <span className="ml-2 opacity-70">{(list[box.index]?.tags || []).join(" · ")}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrap>
  );
}

function Wrap({ children }) {
  return <div className="bg-neutral-950 text-neutral-100"><div className="max-w-[1120px] mx-auto px-4 py-8">{children}</div></div>;
}
function ErrorBox({ err }) {
  return (
    <div className="rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm">
      读取 <code>content.json</code> 失败：{String(err?.message || err)}
      <ul className="mt-2 list-disc pl-5 text-neutral-300">
        <li>确认 <code>public/content.json</code> 存在且是合法 JSON</li>
        <li>在浏览器打开 <code>/content.json</code> 看看是否 200</li>
      </ul>
    </div>
  );
}