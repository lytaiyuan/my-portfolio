// src/pages/Photos.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ALL = "全部";
const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Photos() {
  const [items, setItems] = useState([]);
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
    
    const fetchPhotos = async () => {
      try {
        console.log('🚀 开始从GitHub获取照片数据...');
        
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/photos.json'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📸 照片数据获取成功:', data);
        
        if (!alive) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        console.error('❌ 从GitHub获取照片数据失败:', e);
        setErr(e);
        setLoading(false);
      }
    };
    
    fetchPhotos();
    return () => { alive = false; };
  }, []);

  // —— 筛选/搜索 —— //
  const [tag, setTag] = useState(ALL);
  const [q, setQ] = useState("");
  const collator = useMemo(() => new Intl.Collator('zh-Hans-u-co-pinyin', { sensitivity: 'base' }), []);
  const tags = useMemo(() => {
    const s = new Set();
    (items || []).forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    const arr = Array.from(s).sort(collator.compare);
    return [ALL, ...arr];
  }, [items, collator]);

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
    <div className="bg-theme-primary text-theme-primary photos-page">
      {/* 顶部容器：背景采用与首页图片板块一致的配色变量 */}
      <section className="relative h-[600px] photos-header photos-header-gradient overflow-hidden">
        <div className="absolute inset-0">
          <div className="max-w-[1120px] mx-auto h-full px-4">
            <div className="flex h-full justify-center items-start pt-24 md:items-center md:pt-0">
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary text-center">图片</h1>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-theme-primary/80 backdrop-blur-sm">
          <div className="max-w-[1120px] mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={cx(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary transition-colors duration-200 text-sm",
                    tag === t
                      ? "is-active bg-black/15 text-theme-primary"
                      : "bg-black/5 text-theme-primary hover:bg-black/15"
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
                  className="w-full rounded-xl border border-theme-primary px-3 py-2 text-sm bg-black/5 text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Masonry 瀑布流 */}
      <section className="bg-theme-primary">
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
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-theme-primary bg-theme-card cursor-zoom-in photo-card"
                  onClick={() => openBox(i)}
                >
                  <img
                    src={getGitHubUrl(img.url)}
                    alt={img.title}
                    className="w-full h-auto block"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <figcaption className="p-3">
                    <div className="text-sm font-medium text-theme-primary">{img.title}</div>
                    {!!img.desc && <div className="mt-1 text-xs text-theme-primary line-clamp-2">{img.desc}</div>}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(img.tags || []).map((t) => (
                        <span key={t} className="inline-flex items-center px-3 py-1.5 text-xs rounded-lg border border-theme-primary bg-black/5 text-theme-primary hover:bg-black/15">
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
            className="fixed inset-0 z-[200] overlay-glass backdrop-blur-lg"
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
                className="absolute top-3 right-4 px-3 py-1.5 rounded-full border border-theme-primary bg-theme-card/90 text-theme-secondary text-sm hover:bg-theme-hover"
              >
                关闭
              </button>

              {/* 稳定框：宽高来自 w/h 与视口计算 */}
              <div
                className="overflow-hidden bg-black"
                style={{ width: `${fit.width}px`, height: `${fit.height}px` }}
              >
                <img
                  src={getGitHubUrl(photos[box.index]?.url)}
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
                <div className="text-theme-primary text-sm font-medium">{photos[box.index]?.title}</div>
                {!!photos[box.index]?.desc && (
                  <div className="mt-1 text-theme-secondary text-[13px] leading-relaxed">
                    {photos[box.index]?.desc}
                  </div>
                )}
                {!!(photos[box.index]?.tags?.length) && (
                  <div className="mt-1 text-theme-muted text-[12px]">
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