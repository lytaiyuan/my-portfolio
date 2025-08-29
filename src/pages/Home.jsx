// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HomeDesign from "../components/HomeDesign.jsx";

const cx = (...xs) => xs.filter(Boolean).join(" ");

export default function Home({ hero }) {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [design, setDesign] = useState({ items: [], featuredId: undefined });
  const [music,  setMusic]  = useState({ items: [], featuredId: undefined });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const c = await fetch("/content.json", { cache: "no-cache" }).then(r => r.json());
        const d = await fetch("/design.json",  { cache: "no-cache" }).then(r => r.ok ? r.json() : ({ items: [] })).catch(() => ({ items: [] }));
        const m = await fetch("/music.json",   { cache: "no-cache" }).then(r => r.ok ? r.json() : ({ items: [] })).catch(() => ({ items: [] }));
        if (!alive) return;
        setPhotos(Array.isArray(c.photos) ? c.photos : []);
        setVideos(Array.isArray(c.videos) ? c.videos : []);
        setDesign({ items: Array.isArray(d.items) ? d.items : [], featuredId: d.featuredId });
        setMusic({  items: Array.isArray(m.items) ? m.items : [], featuredId: m.featuredId });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const pickFeatured = (items = [], featuredId) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    if (featuredId != null) {
      const f = items.find(x => x.id === featuredId);
      if (f) return f;
    }
    return items[0];
  };

  const featuredPhoto  = useMemo(() => photos[0] || null, [photos]);
  const featuredVideo  = useMemo(() => videos[0] || null, [videos]);
  const featuredDesign = useMemo(() => pickFeatured(design.items, design.featuredId), [design]);
  const featuredMusic  = useMemo(() => pickFeatured(music.items, music.featuredId),   [music]);

  const [player, setPlayer] = useState(null); // { title, poster, src }
  const openPlay  = (title, poster, src) => setPlayer({ title, poster, src });
  const closePlay = () => setPlayer(null);

  if (loading) return <div className="min-h-[60svh] grid place-items-center text-neutral-400">加载主页内容…</div>;

  const heroUrl = `${hero || "/photos/hero.jpg"}${import.meta.env.DEV ? `?v=${Date.now()}` : ""}`;

  return (
    <>
      {/* HERO：文字与底部渐变动画时长 1s */}
      <section className="relative min-h-[100svh]">
        <img src={heroUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" fetchpriority="high" decoding="async" />
        <div className="relative z-10 max-w-[1120px] mx-auto px-4 pt-14 md:pt-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-end min-h-[60vh] md:min-h-[70vh]">
            <div className="pb-8 md:pb-14">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                className="text-[28px] leading-tight font-medium tracking-[-0.01em] md:text-[44px] md:leading-[1.1]"
              >
                光影叙事 · 自然与人之间的呼吸
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.05, ease: "easeOut" }}
                className="mt-3 text-neutral-100/95 max-w-prose md:text-lg"
              >
                记录风光、人像与建筑的细节与情绪。
              </motion.p>
              {/* 桌面端按钮（手机隐藏） */}
              <div className="mt-6 hidden md:flex flex-wrap gap-3">
                <Link to="/photos" className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 transition">图片</Link>
                <Link to="/videos" className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 transition">视频</Link>
                <Link to="/design" className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 transition">设计</Link>
                <Link to="/music"  className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 transition">音乐</Link>
              </div>
            </div>
            <div className="hidden md:block" />
          </div>
        </div>
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-10 bg-gradient-to-b from-transparent to-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
      </section>

      {/* —— 首页四个板块：覆盖文字浮在图片上 —— */}
      <SectionOverlayCard
        id="home-photos"
        ctaText="查看全部图片"
        ctaTo="/photos"
        card={
          featuredPhoto ? (
            <CardImage
              src={featuredPhoto.url}
              captionTitle={featuredPhoto.title}
              overlayTitle="云南也有中东风情？"
              overlaySubtitle="探索云南省红河彝族哈尼族自治州沙甸清真寺的风情。"
            />
          ) : <EmptyCard tip="还没有添加照片。" />
        }
      />

      <SectionOverlayCard
        id="home-videos"
        ctaText="查看全部视频"
        ctaTo="/videos"
        card={
          featuredVideo ? (
            <CardImage
              src={featuredVideo.poster || "/covers/placeholder.jpg"}
              captionTitle={featuredVideo.title}
              overlayTitle="2023，全是回忆。"
              overlaySubtitle="和我一起，回到2023年的那些美好瞬间。"
              extra={featuredVideo.src && (
                <button
                  onClick={() => openPlay(featuredVideo.title, featuredVideo.poster, featuredVideo.src)}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-sm"
                >
                  <PlayIcon /> 立即播放
                </button>
              )}
            />
          ) : <EmptyCard tip="还没有添加视频。" />
        }
      />
      <HomeDesign />

      <SectionOverlayCard
        id="home-music"
        ctaText="进入音乐页"
        ctaTo="/music"
        card={
          featuredMusic ? (
            <CardImage
              src={featuredMusic.cover}
              captionTitle={featuredMusic.title}
              overlayTitle="音乐"
              overlaySubtitle="展示原创音乐的视频作品。"
              extra={featuredMusic.video && (
                <button
                  onClick={() => openPlay(featuredMusic.title, featuredMusic.cover, featuredMusic.video)}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-sm"
                >
                  <PlayIcon /> 立即播放
                </button>
              )}
            />
          ) : <EmptyCard tip="还没有添加音乐代表作。" />
        }
      />

      {/* —— 关于我们（每人占满一整行：左-名字/简介，中-优势，右-较小照片） —— */}
      <section id="about" className="border-t border-neutral-900/80 bg-neutral-950">
        <div className="max-w-[1120px] mx-auto px-4 py-14">
          <h2 className="text-2xl font-semibold">关于我们</h2>

          {/* 人员 1：李洋 */}
          <article className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              {/* 左：名字 + 简介 */}
              <div className="md:col-span-5">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">李洋</h3>
                <p className="mt-2 text-neutral-300 text-sm leading-relaxed">
                  作曲人、摄影师。摩托、咖啡与露营爱好者。常驻云南与山西。
                </p>
              </div>
              {/* 中：优势 */}
              <div className="md:col-span-4">
                <h4 className="text-sm font-medium text-neutral-200">优势</h4>
                <ul className="mt-2 space-y-2 text-sm text-neutral-300/90 list-disc pl-5">
                  <li>关注自然与人文的呼吸</li>
                  <li>创作涵盖音乐、影像与多媒体叙事</li>
                  <li>可提供从作曲录音到拍摄后期的一体化解决方案</li>
                </ul>
              </div>
              {/* 右：照片（较小尺寸） */}
              <div className="md:col-span-3 justify-self-start md:justify-self-end">
                <div className="w-36 md:w-40 aspect-[3/4] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                  <img src="/about.jpg" alt="李洋" className="w-full h-full object-cover" />
                </div>
                <p className="mt-2 text-[11px] text-neutral-500"> <code></code></p>
              </div>
            </div>
          </article>

          {/* 人员 2：王蒙 */}
          <article className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              {/* 左：名字 + 简介 */}
              <div className="md:col-span-5">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">王蒙</h3>
                <p className="mt-2 text-neutral-300 text-sm leading-relaxed">
                  设计师、创业导师。露营、马拉松与单车长途爱好者。
                </p>
              </div>
              {/* 中：优势 */}
              <div className="md:col-span-4">
                <h4 className="text-sm font-medium text-neutral-200">优势</h4>
                <ul className="mt-2 space-y-2 text-sm text-neutral-300/90 list-disc pl-5">
                  <li>专注品牌视觉与产品形象的打造</li>
                  <li>可提供整套VI设计与产品摄影</li>
                  <li>涵盖包装设计、平面设计等全方位方案</li>
                </ul>
              </div>
              {/* 右：照片（较小尺寸） */}
              <div className="md:col-span-3 justify-self-start md:justify-self-end">
                <div className="w-36 md:w-40 aspect-[3/4] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                  <img src="/about2.jpg" alt="王蒙" className="w-full h-full object-cover" />
                </div>
                <p className="mt-2 text-[11px] text-neutral-500"> <code></code></p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 联系（不变） */}
      <section id="contact" className="border-t border-neutral-900/80 bg-neutral-950">
        <div className="max-w-[1120px] mx-auto px-4 py-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold">联系</h2>
            <p className="mt-2 text-neutral-400 text-sm">
              欢迎合作。请发送邮件至 <a className="underline" href="mailto:lytaiyuan@qq.com">lytaiyuan@qq.com</a>，
              或通过下方社交账号联系。
            </p>
            <div className="mt-6 text-sm text-neutral-400 space-y-1">
              <p>微信：LYPUBL</p>
              <p>手机：150 3514 8062</p>
              <p>小红书：@6738496349</p>
            </div>
          </div>
        </div>
      </section>

      {/* 播放弹窗 */}
      <AnimatePresence>
        {player && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closePlay}
          >
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button onClick={closePlay} className="absolute -top-10 right-0 px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 text-sm hover:bg-neutral-800">关闭</button>
              <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black">
                <video src={player.src} poster={player.poster} controls playsInline preload="metadata" className="w-full h-auto block" />
              </div>
              <div className="mt-3 text-neutral-300 text-sm"><strong>{player.title}</strong></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* —— 首页分块：右上角 CTA —— */
function SectionOverlayCard({ id, ctaText, ctaTo, card }) {
  return (
    <section id={id} className="border-t border-neutral-900/80 bg-neutral-950">
      <div className="max-w-[1120px] mx-auto px-4 py-12">
        <div className="flex justify-end">
          <Link to={ctaTo} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-sm">
            {ctaText} <ArrowRight />
          </Link>
        </div>
        <div className="mt-6">{card}</div>
      </div>
    </section>
  );
}

/* —— 卡片：支持覆盖文字 —— */
function CardImage({ src, captionTitle, overlayTitle, overlaySubtitle, to, extra }) {
  const image = (
    <div className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={src}
          alt={captionTitle || ""}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            {overlayTitle && (
              <div className="text-white text-lg md:text-2xl font-semibold tracking-tight">
                {overlayTitle}
              </div>
            )}
            {overlaySubtitle && (
              <div className="mt-1 text-white/85 text-xs md:text-sm max-w-[85%]">
                {overlaySubtitle}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-3">
        {captionTitle && <div className="text-sm font-medium text-neutral-100">{captionTitle}</div>}
        {extra}
      </div>
    </div>
  );
  return to ? <Link to={to}>{image}</Link> : image;
}

function EmptyCard({ tip = "暂无内容" }) {
  return <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-400">{tip}</div>;
}

/* 小图标 */
function PlayIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
}
function ArrowRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" transform="scale(-1,1) translate(-24,0)" /></svg>;
}