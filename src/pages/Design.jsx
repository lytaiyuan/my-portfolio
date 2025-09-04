// src/pages/Design.jsx
import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { getConfigUrl, pickUrl } from "../lib/configSource.js";

const Card = ({ img, title, subtitle, to }) => (
  <Link to={to} className="group overflow-hidden rounded-2xl border border-theme-primary bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent">
    <div className="relative aspect-[16/9] w-full overflow-hidden">
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div className="p-3">
      <div className="text-sm font-medium text-theme-primary">{title}</div>
      {subtitle && <div className="mt-1 text-xs text-theme-secondary line-clamp-2">{subtitle}</div>}
    </div>
  </Link>
);

export default function Design() {
  const [graphic, setGraphic] = useState([]);
  const [vi, setVi] = useState([]);
  const [pack, setPack] = useState([]);
  const [productPhotos, setProductPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  // 产品摄影大图浏览
  const [box, setBox] = useState(null); // { index }
  const closeBox = () => setBox(null);

  // 与图片页一致的适配逻辑
  const computeFitRect = useCallback((w = 1600, h = 900) => {
    const HEADER = 48;
    const MARGIN = 32;
    const EXTRA = 56;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const availW = Math.max(320, vw - MARGIN * 2);
    const availH = Math.max(240, vh - (HEADER + EXTRA + MARGIN * 2));
    const ratio = w / h;
    const boxRatio = availW / availH;
    let outW, outH;
    if (boxRatio > ratio) {
      outH = availH;
      outW = Math.round(outH * ratio);
    } else {
      outW = availW;
      outH = Math.round(outW / ratio);
    }
    outW = Math.min(outW, 1600);
    outH = Math.min(outH, 1200);
    return { width: outW, height: outH };
  }, []);
  const [fit, setFit] = useState({ width: 960, height: 600 });
  useEffect(() => {
    function onResize() {
      if (box == null) return;
      const p = productPhotos[box.index];
      const { width, height } = computeFitRect(p?.w, p?.h);
      setFit({ width, height });
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [box, productPhotos, computeFitRect]);
  const openBox = (index) => {
    const p = productPhotos[index];
    const { width, height } = computeFitRect(p?.w, p?.h);
    setFit({ width, height });
    setBox({ index });
  };

  useEffect(() => {
    let alive = true;
    
    const fetchDesignData = async () => {
      try {
        const [g, v, p, prod] = await Promise.all([
          fetch(getConfigUrl('graphiccontent'))
            .then(r => r.json())
            .catch(() => ({ items: [] })),
          fetch(getConfigUrl('vi'))
            .then(r => r.json())
            .catch(() => ({ items: [] })),
          fetch(getConfigUrl('packaging'))
            .then(r => r.json())
            .catch(() => ({ items: [] })),
          fetch(getConfigUrl('productphotos'))
            .then(r => r.json())
            .catch(() => ({ photos: [] }))
        ]);
        
        if (!alive) return;
        setGraphic(Array.isArray(g.items) ? g.items : []);
        setVi(Array.isArray(v.items) ? v.items : []);
        setPack(Array.isArray(p.items) ? p.items : []);
        setProductPhotos(Array.isArray(prod.photos) ? prod.photos : []);
        setLoading(false);
        document.title = "Li Yang Studio — 设计";
      } catch (error) {
        if (!alive) return;
        console.error('[Design] 读取GitHub设计数据失败：', error);
        setLoading(false);
      }
    };
    
    fetchDesignData();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="min-h-[50svh] grid place-items-center text-neutral-400">加载设计内容…</div>;

  return (
    <div className="bg-theme-primary text-theme-primary">
      {/* 顶部容器：与图片页一致 */}
      <section className="relative h-[46svh] md:h-[600px] design-header overflow-hidden">
        <div className="absolute inset-0">
          <div className="max-w-[1120px] mx-auto h-full px-4">
            <div className="flex h-full justify-center items-center">
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary text-center">设计</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-4 pt-0 pb-10 space-y-12">
        <Section title="包装设计" noBorder>
          <Grid>
            {pack.slice(0, 3).map(it => (
              <Card key={it.slug} img={pickUrl(it.cover, it.coverLocalUrl)} title={it.title} subtitle={it.subtitle} to={`/design/packaging/${it.slug}`} />
            ))}
          </Grid>
        </Section>

        <Section title="平面设计">
          <Grid>
            {graphic.slice(0, 3).map(it => (
              <Card key={it.slug} img={pickUrl(it.cover, it.coverLocalUrl)} title={it.title} subtitle={it.subtitle} to={`/design/graphic/${it.slug}`} />
            ))}
          </Grid>
        </Section>

        <Section title="视觉识别（VI）方案">
          <Grid>
            {vi.slice(0, 3).map(it => (
              <Card key={it.slug} img={pickUrl(it.cover, it.coverLocalUrl)} title={it.title} subtitle={it.subtitle} to={`/design/vi/${it.slug}`} />
            ))}
          </Grid>
        </Section>

        <Section title="产品摄影">
          <div className="mt-2 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            <AnimatePresence>
              {productPhotos.map((p, i) => (
                <motion.figure
                  key={p.url}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-theme-primary bg-theme-card cursor-zoom-in photo-card"
                  onClick={() => openBox(i)}
                >
                  <img
                    src={pickUrl(p.url, p.localurl)}
                    alt={p.title}
                    className="w-full h-auto block"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="p-3">
                    <div className="text-sm font-medium text-theme-primary">{p.title}</div>
                    {p.desc && <div className="mt-1 text-xs text-theme-primary line-clamp-2">{p.desc}</div>}
                  </figcaption>
                </motion.figure>
              ))}
            </AnimatePresence>
          </div>
        </Section>

        {/* 产品摄影大图 Lightbox —— 完整复用图片页实现 */}
        <AnimatePresence>
          {box && (
            <motion.div
              className="fixed inset-0 z-[9999] overlay-glass backdrop-blur-lg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeBox}
            >
              <div className="absolute inset-0 p-4 grid place-items-center" onClick={(e) => e.stopPropagation()}>
                <button onClick={closeBox} className="absolute top-3 right-4 px-3 py-1.5 rounded-full border border-theme-primary bg-theme-card/90 text-theme-secondary text-sm hover:bg-theme-hover">关闭</button>
                <div className="overflow-hidden bg-black" style={{ width: `${fit.width}px`, height: `${fit.height}px` }}>
                  <img
                    src={pickUrl(productPhotos[box.index]?.url, productPhotos[box.index]?.localurl)}
                    alt={productPhotos[box.index]?.title}
                    className="w-full h-full object-contain block"
                    onLoad={(e) => {
                      const p = productPhotos[box.index];
                      if (!p?.w || !p?.h) {
                        const nw = e.currentTarget.naturalWidth || 1600;
                        const nh = e.currentTarget.naturalHeight || 900;
                        const { width, height } = computeFitRect(nw, nh);
                        setFit({ width, height });
                      }
                    }}
                  />
                </div>
                <div className="mt-3 max-w-[min(90vw,1120px)] text-center">
                  <div className="text-theme-primary text-sm font-medium">{productPhotos[box.index]?.title}</div>
                  {productPhotos[box.index]?.desc && (
                    <div className="mt-1 text-theme-primary text-[13px] leading-relaxed">{productPhotos[box.index]?.desc}</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* 小组件 */
function Section({ title, action, children, noBorder = false }) {
  return (
    <section className={noBorder ? "pt-8" : "border-t border-theme-primary pt-8"}>
      <div className="flex items-end justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function LinkBtn({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-black/5 hover:bg-black/15 text-sm text-theme-primary transition-colors duration-200">
      {children}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" transform="scale(-1,1) translate(-24,0)"/></svg>
    </Link>
  );
}