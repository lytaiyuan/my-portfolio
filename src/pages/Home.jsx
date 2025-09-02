// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useContent } from "../lib/useContent.js";

export default function Home() {
  const { hero, photos, videos, loading: contentLoading } = useContent();
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null); // { title, poster, src }

  // 路径转换函数：将相对路径转换为GitHub raw URL，避免重复
  const getGitHubUrl = (path) => {
    if (!path) return '';
    
    // 如果路径已经包含GitHub URL，直接返回
    if (path.includes('raw.githubusercontent.com')) {
      return path;
    }
    
    // 如果是外部链接，直接返回
    if (path.startsWith('http')) {
      return path;
    }
    
    // 处理相对路径
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${cleanPath}`;
  };

  useEffect(() => {
    let alive = true;
    
    const fetchMusic = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/config/music.json'
        );
        
        if (response.ok) {
          const m = await response.json();
          
          if (!alive) return;
          setMusic(Array.isArray(m.items) ? m.items : []);
        }
      } catch (error) {
        console.error('[Home] 读取GitHub音乐数据失败：', error);
      } finally {
        if (alive) setLoading(false);
      }
    };
    
    fetchMusic();
    return () => { alive = false; };
  }, []);

  const featuredPhoto = useMemo(() => (Array.isArray(photos) && photos.length ? photos[0] : null), [photos]);
  const featuredVideo = useMemo(() => (Array.isArray(videos) && videos.length ? videos[0] : null), [videos]);
  const featuredMusic = useMemo(() => (Array.isArray(music) && music.length ? music[0] : null), [music]);

  const heroUrl = `${hero}${import.meta.env.DEV ? `?v=${Date.now()}` : ""}`;

  const openPlay = (title, poster, src) => setPlayer({ title, poster, src });
  const closePlay = () => setPlayer(null);

  if (contentLoading || loading) {
    return <div className="min-h-[60svh] grid place-items-center text-theme-muted">加载主页内容…</div>;
  }

  return (
    <>
      {/* HERO：文字与底部渐变动画时长 1s（注意：图片从顶端开始，被顶栏"盖住"以形成毛玻璃效果） */}
      <section className="relative min-h-[100svh]">
        <img
          src={heroUrl}
          alt=""
          className="absolute top-0 left-0 right-0 bottom-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="relative z-10 max-w-[1120px] mx-auto px-4 pt-14 md:pt-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-end min-h-[60vh] md:min-h-[70vh]">
            <div className="pb-8 md:pb-14">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                className="text-[28px] leading-tight font-medium tracking-[-0.01em] md:text-[44px] md:leading-[1.1] text-white"
              >
                Li Yang  |  Studio
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.05, ease: "easeOut" }}
                className="mt-3 text-white/95 max-w-prose md:text-lg"
              >
                让影像、设计、音乐诉说着同一种语言。
              </motion.p>

              {/* 桌面端快捷按钮（手机隐藏） */}
              <div className="mt-6 hidden md:flex flex-wrap gap-3">
                <Link to="/photos" className="px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 transition text-white">图片</Link>
                <Link to="/videos" className="px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 transition text-white">视频</Link>
                <Link to="/design" className="px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 transition text-white">设计</Link>
                <Link to="/music"  className="px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 transition text-white">音乐</Link>
              </div>
            </div>
            <div className="hidden md:block" />
          </div>
        </div>
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-10"
          style={{
            background: 'var(--hero-gradient)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
      </section>

      {/* —— 首页四个板块 —— */}
      {/* 照片（展示 photos.json 的第一张） */}
      <SectionOverlayCard
        id="home-photos"
        ctaText="查看全部图片"
        ctaTo="/photos"
        gradientType="photos"
        card={
          featuredPhoto ? (
            <CardImage
              to="/photos"
              src={getGitHubUrl(featuredPhoto.url)}
              captionTitle={featuredPhoto.title}
              overlayTitle="云南也有中东风情？"
              overlaySubtitle="探索云南省红河州沙甸清真寺的风情。"
              gradientType="photos"
            />
          ) : <EmptyCard tip="还没有添加照片。" />
        }
      />

      {/* 视频（展示 videos.json 的第一条，带 hottitle/hotintro） */}
      <SectionOverlayCard
        id="home-videos"
        ctaText="查看全部视频"
        ctaTo="/videos"
        gradientType="videos"
        card={
          featuredVideo ? (
            <CardImage
              to={`/videos/${featuredVideo.slug}`}
              src={featuredVideo.poster ? getGitHubUrl(featuredVideo.poster) : "/covers/placeholder.jpg"}
              captionTitle={featuredVideo.title}
              overlayTitle={featuredVideo.hottitle || featuredVideo.title}
              overlaySubtitle={featuredVideo.hotintro}
              gradientType="videos"
              extra={
                (featuredVideo.src
                  ? <button
                      onClick={() => openPlay(featuredVideo.title, featuredVideo.poster, featuredVideo.src)}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-theme-card/80 hover:bg-theme-hover text-sm text-theme-primary"
                    ><PlayIcon /> 立即播放</button>
                  : <Link
                      to={`/videos/${featuredVideo.slug}`}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-theme-card/80 hover:bg-theme-hover text-sm text-theme-primary"
                    ><PlayIcon /> 查看详情</Link>
                )
              }
            />
          ) : <EmptyCard tip="还没有添加视频。" />
        }
      />

      {/* 设计板块 */}
      <section id="home-design" className="border-t border-theme-primary bg-theme-primary" style={{ background: 'var(--design-gradient)' }}>
        <div className="max-w-[1120px] mx-auto px-4 py-12">
          {/* 右上角 CTA */}
          <div className="flex justify-end">
            <Link
              to="/design"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 bg-black/10 hover:bg-black/20 text-sm transition-colors duration-200 text-white"
            >
              进入设计页
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" transform="scale(-1,1) translate(-24,0)"/>
              </svg>
            </Link>
          </div>

          {/* 整张卡片可点击 */}
          <Link to="/design" className="mt-6 block group overflow-hidden rounded-2xl border border-white/20 bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src="/home/design/cover.jpg"
                alt="设计代表作"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
              {/* 覆盖文案 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" style={{ background: 'var(--design-gradient-overlay)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="text-white text-lg md:text-2xl font-semibold tracking-tight">补品包装设计</div>
                  <div className="mt-1 text-white/85 text-xs md:text-sm max-w-[85%]">
                    立即查看我们的获奖设计作品集
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
              <div className="text-white text-sm font-medium">进入设计页查看更多方案</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 音乐（动态展示 music.json 的第一条） */}
      <SectionOverlayCard
        id="home-music"
        ctaText="进入音乐页"
        ctaTo="/music"
        gradientType="music"
        ctaTextColor="text-white"
        card={
                           featuredMusic ? (
                   <CardImage
                     to={`/music/${featuredMusic.slug}`}
                     src={getGitHubUrl(featuredMusic.cover)}
                     captionTitle={featuredMusic.title}
                     overlayTitle={featuredMusic.hottitle || featuredMusic.title}
                     overlaySubtitle={featuredMusic.hotintro}
                     gradientType="music"
                     textColor="text-white"
                     extraTextColor="text-white"
                   />
                 ) : <EmptyCard tip="还没有添加音乐。" />
        }
      />

      {/* —— 关于我们（恢复） —— */}
              <section id="about" className="border-t border-theme-primary bg-theme-primary">
        <div className="max-w-[1120px] mx-auto px-4 py-14">
          <h2 className="text-2xl font-semibold">关于我们</h2>

          {/* 李洋 */}
          <article className="mt-8 rounded-2xl border border-theme-primary bg-theme-card p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">李洋</h3>
                <p className="mt-2 text-theme-secondary text-sm leading-relaxed">
                  作曲人、摄影师。摩托、咖啡与露营爱好者。常驻云南与山西。
                </p>
              </div>
              <div className="md:col-span-4">
                <h4 className="text-sm font-medium text-theme-secondary">优势</h4>
                <ul className="mt-2 space-y-2 text-sm text-theme-secondary list-disc pl-5">
                  <li>关注自然与人文的呼吸</li>
                  <li>创作涵盖音乐、影像与多媒体叙事</li>
                  <li>可提供从作曲录音到拍摄后期的一体化解决方案</li>
                </ul>
              </div>
              <div className="md:col-span-3 justify-self-start md:justify-self-end">
                <div className="w-36 md:w-40 aspect-[3/4] overflow-hidden rounded-xl border border-theme-primary bg-theme-card">
                  <img src="/about.jpg" alt="李洋" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </article>

          {/* 王蒙 */}
          <article className="mt-6 rounded-2xl border border-theme-primary bg-theme-card p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">王蒙</h3>
                <p className="mt-2 text-theme-secondary text-sm leading-relaxed">
                  设计师、创业导师。露营、马拉松与单车长途爱好者。
                </p>
              </div>
              <div className="md:col-span-4">
                <h4 className="text-sm font-medium text-theme-secondary">优势</h4>
                <ul className="mt-2 space-y-2 text-sm text-theme-secondary list-disc pl-5">
                  <li>专注品牌视觉与产品形象打造</li>
                  <li>可提供整套 VI 设计与产品摄影</li>
                  <li>包装/平面设计等全方位方案</li>
                </ul>
              </div>
              <div className="md:col-span-3 justify-self-start md:justify-self-end">
                <div className="w-36 md:w-40 aspect-[3/4] overflow-hidden rounded-xl border border-theme-primary bg-theme-card">
                  <img src="/about2.jpg" alt="王蒙" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </article>

          {/* 原世芳 */}
          <article className="mt-6 rounded-2xl border border-theme-primary bg-theme-card p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">原世芳</h3>
                <p className="mt-2 text-theme-secondary text-sm leading-relaxed">
                  占位符描述文字，请根据实际情况修改。
                </p>
              </div>
                             <div className="md:col-span-4">
                <h4 className="text-sm font-medium text-theme-secondary">优势</h4>
                <ul className="mt-2 space-y-2 text-sm text-theme-secondary list-disc pl-5">
                  <li>占位符优势描述1</li>
                  <li>占位符优势描述2</li>
                  <li>占位符优势描述3</li>
                </ul>
              </div>
              <div className="md:col-span-3 justify-self-start md:justify-self-end">
                <div className="w-36 md:w-40 aspect-[3/4] overflow-hidden rounded-xl border border-theme-primary bg-theme-card">
                  <img src="/about3.jpg" alt="原世芳" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* —— 联系（恢复） —— */}
      <section id="contact" className="border-t border-theme-primary bg-theme-primary">
        <div className="max-w-[1120px] mx-auto px-4 py-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold">联系</h2>
            <p className="mt-2 text-theme-muted text-sm">
              欢迎合作。请发送邮件至 <a className="underline" href="mailto:lytaiyuan@qq.com">lytaiyuan@qq.com</a>，
              或通过下方社交账号联系。
            </p>
            <div className="mt-6 text-sm text-theme-muted space-y-1">
              <p>微信：LYPUBL</p>
              <p>手机：150 3514 8062</p>
              <p>小红书：@6738496349</p>
            </div>
          </div>
        </div>
      </section>

      {/* 播放弹窗（保留） */}
      <AnimatePresence>
        {player && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closePlay}
          >
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closePlay}
                className="absolute -top-10 right-0 px-3 py-1.5 rounded-full border border-theme-primary bg-theme-card text-theme-secondary text-sm hover:bg-theme-hover"
              >关闭</button>
              <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black">
                <video src={player.src} poster={player.poster} controls playsInline preload="metadata" className="w-full h-auto block" />
              </div>
              <div className="mt-3 text-theme-secondary text-sm"><strong>{player.title}</strong></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* —— 公用 UI —— */
function SectionOverlayCard({ id, ctaText, ctaTo, card, gradientType = 'photos', ctaTextColor = 'text-theme-primary' }) {
  const getGradientStyle = () => {
    switch (gradientType) {
      case 'photos': return { background: 'var(--photos-gradient)' };
      case 'videos': return { background: 'var(--videos-gradient)' };
      case 'music': return { background: 'var(--music-gradient)' };
      default: return { background: 'var(--photos-gradient)' };
    }
  };

  return (
    <section id={id} className="border-t border-theme-primary bg-theme-primary" style={getGradientStyle()}>
      <div className="max-w-[1120px] mx-auto px-4 py-12">
        <div className="flex justify-end">
          <Link to={ctaTo} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-black/5 hover:bg-black/15 text-sm transition-colors duration-200 ${ctaTextColor}`} style={{ color: ctaTextColor === 'text-white' ? '#ffffff' : undefined }}>
            {ctaText} <ArrowRight />
          </Link>
        </div>
        <div className="mt-6">{card}</div>
      </div>
    </section>
  );
}

function CardImage({ src, captionTitle, overlayTitle, overlaySubtitle, to, extra, gradientType = 'photos', textColor = 'text-theme-primary', extraTextColor = 'text-theme-primary' }) {
  const getOverlayGradient = () => {
    switch (gradientType) {
      case 'photos': return 'var(--photos-gradient-overlay)';
      case 'videos': return 'var(--videos-gradient-overlay)';
      case 'music': return 'var(--music-gradient-overlay)';
      default: return 'var(--photos-gradient-overlay)';
    }
  };

  const image = (
    <div className="group overflow-hidden rounded-2xl border border-theme-primary bg-black/5">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={src}
          alt={captionTitle || ""}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: getOverlayGradient() }} />
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
      <div className="p-3 bg-black/5">
        {captionTitle && <div className={`text-sm font-medium ${textColor}`} style={{ color: textColor === 'text-white' ? '#ffffff' : undefined }}>{captionTitle}</div>}
        {extra && React.cloneElement(extra, { 
          className: `${extra.props.className || ''} ${extraTextColor}`.trim(),
          style: { ...extra.props.style, color: extraTextColor === 'text-white' ? '#ffffff' : undefined }
        })}
      </div>
    </div>
  );
  return to ? <Link to={to}>{image}</Link> : image;
}

function EmptyCard({ tip = "暂无内容" }) {
  return <div className="overflow-hidden rounded-2xl border border-theme-primary bg-black/5 p-6 text-theme-muted">{tip}</div>;
}
function PlayIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
}
function ArrowRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" transform="scale(-1,1) translate(-24,0)" /></svg>;
}