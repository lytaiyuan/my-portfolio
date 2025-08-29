// src/pages/Photos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ALL = "全部";
const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Photos() {
  const [items, setItems] = useState([]);
  const [tag, setTag] = useState(ALL);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { index }

  useEffect(() => {
    let alive = true;
    const BASE = import.meta.env.BASE_URL || "/";
    fetch(`${BASE}content.json`, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!alive) return;
        const photos = Array.isArray(json.photos) ? json.photos : [];
        setItems(photos);
        setLoading(false);
        document.title = "Li Yang Studio — 图片";
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e);
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const tags = useMemo(() => {
    const s = new Set();
    items.forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    return [ALL, ...Array.from(s)];
  }, [items]);

  const photos = useMemo(() => {
    return items.filter((p) => {
      const okT = tag === ALL || (p.tags || []).includes(tag);
      const okQ = !q || (p.title || "").toLowerCase().includes(q.toLowerCase());
      return okT && okQ;
    });
  }, [items, tag, q]);

  if (loading) return <Wrap><p className="text-neutral-400">加载图片中…</p></Wrap>;
  if (err) return <Wrap><ErrorBox err={err} /></Wrap>;

  return (
    <Wrap>
      <h1 className="text-2xl font-semibold">图片</h1>

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
            placeholder="搜索标题…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 px-3 py-2 text-sm bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
          />
        </div>
      </div>

      <div className="mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        <AnimatePresence>
          {photos.map((img, i) => (
            <motion.figure
              key={img.url}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 cursor-zoom-in"
              onClick={() => setLightbox({ index: i })}
            >
              <img src={img.url} alt={img.title} className="w-full h-auto block" loading="lazy" />
              <figcaption className="p-3">
                <div className="text-sm font-medium text-neutral-100">{img.title}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(img.tags || []).map((t) => (
                    <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {t}
                    </span>
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      {/* —— Lightbox 居中版 —— */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            {/* 阻止冒泡，以下整个块（图 + 边框 + 关闭键 + 标题）整体居中 */}
            <div className="relative inline-block text-center" onClick={(e) => e.stopPropagation()}>
              {/* 圆角边框紧贴图片四边；按钮放在框内右上角，不会影响居中 */}
              <figure className="relative inline-block rounded-2xl overflow-hidden border border-neutral-800 bg-black/20">
                <img
                  src={photos[lightbox.index]?.url}
                  alt={photos[lightbox.index]?.title}
                  className="block w-auto h-auto
                             max-w-[calc(100vw-32px)]
                             sm:max-w-[min(1120px,100vw-64px)]
                             max-h-[calc(100svh-160px)]
                             object-contain"
                />
                <button
                  aria-label="关闭"
                  onClick={() => setLightbox(null)}
                  className="absolute top-2 right-2 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 text-sm hover:bg-neutral-800"
                >
                  关闭
                </button>
              </figure>

              {/* 标题说明（在框下，整体仍然居中） */}
              <div className="mt-3 text-neutral-300 text-sm">
                <strong>{photos[lightbox.index]?.title}</strong>
                <span className="ml-2 opacity-70">{(photos[lightbox.index]?.tags || []).join(" · ")}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrap>
  );
}

function Wrap({ children }) {
  return (
    <div className="bg-neutral-950 text-neutral-100">
      <div className="max-w-[1120px] mx-auto px-4 py-8">{children}</div>
    </div>
  );
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