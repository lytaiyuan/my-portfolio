// src/pages/design/Product.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ALL = "全部";
const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Product() {
  const [items, setItems] = useState([]);
  const [tag, setTag] = useState(ALL);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/productphotos.json", { cache: "no-cache" })
      .then(r => r.json())
      .then(json => {
        if (!alive) return;
        setItems(Array.isArray(json.photos) ? json.photos : []);
        document.title = "Li Yang Studio — 产品摄影";
      });
    return () => { alive = false; };
  }, []);

  const tags = useMemo(() => {
    const s = new Set();
    items.forEach(p => (p.tags || []).forEach(t => s.add(t)));
    return [ALL, ...Array.from(s)];
  }, [items]);

  const photos = useMemo(() => {
    return items.filter(p => {
      const okT = tag === ALL || (p.tags || []).includes(tag);
      const okQ = !q || (p.title || "").toLowerCase().includes(q.toLowerCase());
      return okT && okQ;
    });
  }, [items, tag, q]);

  return (
    <div className="bg-neutral-950 text-neutral-100">
      <div className="max-w-[1120px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">产品摄影</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tags.map(t => (
            <button key={t} onClick={() => setTag(t)} className={cx(
              "px-3 py-1.5 rounded-full text-sm border transition",
              tag === t ? "bg-neutral-100 text-neutral-900 border-neutral-200" : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800"
            )}>{t}</button>
          ))}
          <div className="ml-auto w-full sm:w-64">
            <input
              type="text"
              placeholder="搜索标题…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 px-3 py-2 text-sm bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </div>
        </div>

        <div className="mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          <AnimatePresence>
            {photos.map((img) => (
              <motion.figure
                key={img.url}
                layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }}
                className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
              >
                < img src={img.url} alt={img.title} className="w-full h-auto block" loading="lazy" />
                <figcaption className="p-3">
                  <div className="text-sm font-medium text-neutral-100">{img.title}</div>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}