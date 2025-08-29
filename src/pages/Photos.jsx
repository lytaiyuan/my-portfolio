// src/pages/Photos.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ALL = "全部";
const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Photos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/photos.json", { cache: "no-cache" })
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
      });
    return () => { alive = false; };
  }, []);

  // —— 筛选/搜索 —— //
  const [tag, setTag] = useState(ALL);
  const [q, setQ] = useState("");
  const tags = useMemo(() => {
    const s = new Set();
    (items || []).forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    return [ALL, ...Array.from(s)];
  }, [items]);

  const photos = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.filter((p) => {
      const okTag = tag === ALL || (p.tags || []).includes(tag);
      const okQ = !q || (p.title || "").toLowerCase().includes(q.toLowerCase());
      return okTag && okQ;
    });
  }, [items, tag, q]);

  // —— Lightbox（使用 json 的 w/h 稳定尺寸）—— //
  const [box, setBox] = useState(null); // { index }
  const closeBox = () => setBox(null);

  // 根据视口 & 图片原始尺寸计算“稳定框”宽高（像素）
  const computeFitRect = useCallback((w = 1600, h = 900) => {
    // 顶部有固定导航栏（h-12≈48px），再给一些呼吸边距
    const HEADER = 48;
    const MARGIN = 32; // 左右/上下的安全边距
    const EXTRA = 56;  // 标题/按钮区域预留

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const availW = Math.max(320, vw - MARGIN * 2);
    const availH = Math.max(240, vh - (HEADER + EXTRA + MARGIN * 2));

    const ratio = w / h;
    const boxRatio = availW / availH;

    let outW, outH;
    if (boxRatio > ratio) {
      // 以高度受限
      outH = availH;
      outW = Math.round(outH * ratio);
    } else {
      // 以宽度受限
      outW = availW;
      outH = Math.round(outW / ratio);
    }
    // 再做个上限，避免过大
    outW = Math.min(outW, 1600);
    outH = Math.min(outH, 1200);
    return { width: outW, height: outH };
  }, []);

  const [fit, setFit] = useState({ width: 960, height: 600 });

  // 当打开 / 窗口尺寸变化时重算
  useEffect(() => {
    function onResize() {
      if (box == null) return;
      const p = photos[box.index];
      const { width, height } = computeFitRect(p?.w, p?.h);
      setFit({ width, height });
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [box, photos, computeFitRect]);

  const openBox = (index) => {
    const p = photos[index];
    const { width, height } = computeFitRect(p?.w, p?.h);
    setFit({ width, height });
    setBox({ index });
  };

  if (loading) return <div className="min-h-[60svh] grid place-items-center text-neutral-400">加载图片…</div>;
  if (err) return <div className="min-h-[60svh] grid place-items-center text-neutral-400">读取 photos.json 出错：{String(err.message || err)}</div>;

  return (
    <div className="bg-neutral-950 text-neutral-100">
      {/* 顶部留白标题（简洁版） */}
      <section className="border-b border-neutral-900/80 bg-neutral-950">
        <div className="max-w-[1120px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold">图片</h1>
        </div>
      </section>

      {/* 筛选区 */}
      <section className="bg-neutral-950">
        <div className="max-w-[1120px] mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={cx(
                  "px-3 py-1.5 rounded-full text-sm border transition",
                  tag === t
                    ? "bg-neutral-100 text-neutral-900 border-neutral-200"
                    : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800"
                )}
              >
                {t}
              </button>
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
        </div>
      </section>

      {/* Masonry 瀑布流 */}
      <section className="bg-neutral-950">
        <div className="max-w-[1120px] mx-auto px-4 pb-10">
          <div className="mt-2 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
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
                  onClick={() => openBox(i)}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-auto block"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <figcaption className="p-3">
                    <div className="text-sm font-medium text-neutral-100">{img.title}</div>
                    {!!img.desc && <div className="mt-1 text-xs text-neutral-400 line-clamp-2">{img.desc}</div>}
                    <div className="mt-2 flex flex-wrap gap-1">
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
        </div>
      </section>

      {/* —— 大图 Lightbox：稳定尺寸 + 绝不会被顶部工具栏遮挡 —— */}
      <AnimatePresence>
        {box && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeBox}
          >
            {/* 内容区：用 padding-top 留出工具栏高度，始终居中 */}
            <div
              className="absolute inset-0 p-4 pt-16 md:pt-20 grid place-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮固定在右上角（和手机抽屉按钮对齐） */}
              <button
                onClick={closeBox}
                className="absolute top-3 right-4 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 text-sm hover:bg-neutral-800"
              >
                关闭
              </button>

              {/* 稳定框：宽高来自 w/h 与视口计算 */}
              <div
                className="overflow-hidden rounded-2xl border border-neutral-800 bg-black"
                style={{ width: `${fit.width}px`, height: `${fit.height}px` }}
              >
                <img
                  src={photos[box.index]?.url}
                  alt={photos[box.index]?.title}
                  className="w-full h-full object-contain block"
                  // 万一 json 没提供尺寸，用自然尺寸回填一次，之后就稳定
                  onLoad={(e) => {
                    const p = photos[box.index];
                    if (!p?.w || !p?.h) {
                      const nw = e.currentTarget.naturalWidth || 1600;
                      const nh = e.currentTarget.naturalHeight || 900;
                      const { width, height } = computeFitRect(nw, nh);
                      setFit({ width, height });
                    }
                  }}
                />
              </div>

              {/* 标题/说明：始终在图像下方，保证不会压到图片 */}
              <div className="mt-3 max-w-[min(90vw,1120px)] text-center">
                <div className="text-neutral-100 text-sm font-medium">{photos[box.index]?.title}</div>
                {!!photos[box.index]?.desc && (
                  <div className="mt-1 text-neutral-300/90 text-[13px] leading-relaxed">
                    {photos[box.index]?.desc}
                  </div>
                )}
                {!!(photos[box.index]?.tags?.length) && (
                  <div className="mt-1 text-neutral-500 text-[12px]">
                    {(photos[box.index].tags || []).join(" · ")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}