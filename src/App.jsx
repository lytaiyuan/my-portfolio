// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import ThemeImage from "./components/ThemeImage";
import { useTheme } from "./lib/useTheme.js";
import { getConfigUrl, pickUrl } from "./lib/configSource.js";

import Home from "./pages/Home.jsx";
import Photos from "./pages/Photos.jsx";
import Videos from "./pages/Videos.jsx";
import Design from "./pages/Design.jsx";
import Music from "./pages/Music.jsx";

import GraphicDetail from "./pages/design/GraphicDetail.jsx";
import ViDetail from "./pages/design/ViDetail.jsx";
import PackagingDetail from "./pages/design/PackagingDetail.jsx";
import Product from "./pages/design/Product.jsx";
import VideoDetail from "./pages/VideoDetail.jsx";
import MusicDetail from "./pages/MusicDetail.jsx";

/** ===== 可调参数（0~1 之间）===== */
const OPACITY_HEADER = 0.30; // 顶部玻璃条透明度
const OPACITY_DRAWER = 0.30; // 手机端抽屉透明度
const HEADER_HEIGHT_PX = 48; // 12 * 4px
const MENU_HEIGHT_PX = 280;  // 工具栏展开时的额外高度（可调）

/** 固定在最上方的玻璃背景条（包含所有工具栏功能） */
function FixedGlassBar() {
  const [open, setOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // 路由切换时自动收起抽屉
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // 获取当前主题
  const { theme, actualTheme, isLight, isDark } = useTheme();
  
  // 强制重新渲染当主题状态改变时
  useEffect(() => {
    // 每次主题状态改变时，强制重新渲染
    setForceUpdate(prev => prev + 1);
  }, [isLight, isDark]);
  
  // 调试：每次渲染时都检查状态
  console.log('[FixedGlassBar] Rendering with:', { isLight, isDark, actualTheme, forceUpdate });

  // 将 open 状态广播给 App，用于控制全屏模糊
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('app:menuOpen', { detail: open }));
  }, [open]);

  // 预加载工具
  const preloadImage = (src) => new Promise((resolve) => {
    if (!src) return resolve();
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

  const prefetchRouteAssets = async (path) => {
    try {
      if (path === '/photos') {
        const res = await fetch(getConfigUrl('photos'));
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items.slice(0, 12) : [];
        await Promise.all(items.map(it => preloadImage(pickUrl(it.url, it.localurl))));
      } else if (path === '/videos') {
        const res = await fetch(getConfigUrl('videos'));
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items.slice(0, 8) : [];
        await Promise.all(items.map(it => preloadImage(pickUrl(it.poster, it.posterLocalUrl))));
      } else if (path === '/music') {
        const res = await fetch(getConfigUrl('music'));
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items.slice(0, 10) : [];
        await Promise.all(items.map(it => preloadImage(pickUrl(it.cover, it.coverLocalUrl))));
      } else if (path === '/design') {
        // 设计页：预加载封面与部分产品摄影
        await preloadImage('/home/design/cover.jpg');
        try {
          const res = await fetch(getConfigUrl('productphotos'));
          const json = await res.json();
          const items = Array.isArray(json.items) ? json.items.slice(0, 12) : [];
          await Promise.all(items.map(it => preloadImage(pickUrl(it.url, it.localurl))));
        } catch (_) {}
      }
    } catch (e) {
      console.warn('[Prefetch] 预加载失败（忽略）：', e);
    }
  };

  // 带预加载的导航组件（仅用于工具栏/抽屉菜单）
  function PrefetchLink({ to, children, className }) {
    const onClick = async (e) => {
      e.preventDefault();
      try {
        // 告知 App 进入转场：淡出旧页面
        window.dispatchEvent(new CustomEvent('app:pageTransition', { detail: true }));
        // 先收起菜单（如在移动端）
        setOpen(false);
        // 等淡出开始
        await new Promise(r => setTimeout(r, 120));
        // 预加载目标页关键资源
        await prefetchRouteAssets(to);
        // 导航到目标页
        navigate(to);
      } finally {
        // 不在此处结束转场，改由目标页在就绪时派发 app:routeReady 结束
      }
    };
    return <a href={to} onClick={onClick} className={className}>{children}</a>;
  }

  return (
    <>
      {/* 主工具栏背景 */}
      <div
        className="fixed top-0 left-0 w-screen toolbar-glass"
        style={{
          height: open ? HEADER_HEIGHT_PX + MENU_HEIGHT_PX : HEADER_HEIGHT_PX,
          zIndex: 105,
          overflow: "hidden",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="h-12 grid grid-cols-3 items-center relative z-[120]" key={`toolbar-content-${isLight ? 'light' : 'dark'}-${forceUpdate}`}>
            {/* 手机：左 菜单键 */}
            <div className="md:hidden flex items-center justify-self-start">
              {open ? (
                <button
                  aria-label="关闭菜单"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg border border-theme-primary bg-theme-card/80"
                >
                  <ThemeImage 
                    type="close" 
                    alt="close" 
                    className="h-4 w-4" 
                    key={`close-${isLight ? 'light' : 'dark'}`}
                  />
                </button>
              ) : (
                <button
                  aria-label="打开菜单"
                  onClick={() => setOpen(true)}
                  className="p-2 rounded-lg border border-theme-primary bg-theme-card/80"
                >
                  <ThemeImage 
                    type="menu" 
                    alt="menu" 
                    className="h-4 w-4" 
                    key={`menu-${isLight ? 'light' : 'dark'}`}
                  />
                </button>
              )}
            </div>

            {/* 手机：中 LOGO */}
            <Link to="/" className="md:hidden flex items-center justify-center justify-self-center">
              <ThemeImage 
                type="logo" 
                alt="Li Yang Studio" 
                className="h-5 w-auto" 
                key={`logo-mobile-${isLight ? 'light' : 'dark'}`}
              />
            </Link>

            {/* 桌面：左侧菜单 */}
            <nav className="hidden md:flex justify-self-start gap-6 text-sm text-theme-secondary">
              <PrefetchLink to="/" className="hover:text-theme-primary transition">主页</PrefetchLink>
              <PrefetchLink to="/photos" className="hover:text-theme-primary transition">图片</PrefetchLink>
              <PrefetchLink to="/videos" className="hover:text-theme-primary transition">视频</PrefetchLink>
              <PrefetchLink to="/design" className="hover:text-theme-primary transition">设计</PrefetchLink>
              <PrefetchLink to="/music" className="hover:text-theme-primary transition">音乐</PrefetchLink>
            </nav>

            {/* 桌面：中 LOGO */}
            <Link to="/" className="hidden md:flex justify-self-center items-center">
              <ThemeImage 
                type="logo" 
                alt="Li Yang Studio" 
                className="h-5 w-auto" 
                key={`logo-desktop-${isLight ? 'light' : 'dark'}`}
              />
            </Link>

            {/* 桌面：右侧主题切换按钮 */}
            <div className="hidden md:flex justify-self-end items-center">
              <ThemeToggle variant="desktop" useToolbarThemeStyle />
            </div>

            {/* 手机：右 主题切换 */}
            <div className="md:hidden flex items-center justify-self-end">
              <ThemeToggle variant="mobile" useToolbarThemeStyle className="ml-2" />
            </div>
          </div>

          {/* 手机端：展开区（随工具栏高度展开） */}
          <div className="md:hidden">
            <div className={"toolbar-menu-content " + (open ? "is-open" : "") }>
              <ul className="text-center text-base space-y-6 py-4">
                <li><PrefetchLink to="/">主页</PrefetchLink></li>
                <li><PrefetchLink to="/photos">图片</PrefetchLink></li>
                <li><PrefetchLink to="/videos">视频</PrefetchLink></li>
                <li><PrefetchLink to="/design">设计</PrefetchLink></li>
                <li><PrefetchLink to="/music">音乐</PrefetchLink></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 顶部下拉菜单层已移除（逻辑合并到工具栏） */}
    </>
  );
}

/** 路由变化时滚动到页顶（避免 SPA 保留滚动位置） */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return; // 带锚点时保留浏览器默认行为
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname, hash]);
  return null;
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="hover:text-theme-primary transition">
      {children}
    </Link>
  );
}
function DrawerLink({ to, children }) {
  return (
    <Link
      to={to}
      className="w-full text-center px-0 py-2 rounded-lg bg-theme-card/40 hover:bg-theme-card/60 text-theme-primary"
    >
      {children}
    </Link>
  );
}

export default function App() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    const handler = (e) => setMenuOpen(Boolean(e.detail));
    window.addEventListener('app:menuOpen', handler);
    return () => window.removeEventListener('app:menuOpen', handler);
  }, []);

  // 监听页面转场事件：true 表示开始淡出旧页面；false 表示可以淡入新页面
  useEffect(() => {
    const handler = (e) => setIsTransitioning(Boolean(e.detail));
    window.addEventListener('app:pageTransition', handler);
    return () => window.removeEventListener('app:pageTransition', handler);
  }, []);

  // 监听新页面就绪事件
  useEffect(() => {
    const onReady = () => setIsTransitioning(false);
    window.addEventListener('app:routeReady', onReady);
    return () => window.removeEventListener('app:routeReady', onReady);
  }, []);

  // 当路由变化且仍处于转场中时，设置兜底计时器，避免极端情况下卡住
  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => setIsTransitioning(false), 2000);
    return () => clearTimeout(timer);
  }, [location.pathname, isTransitioning]);

  // 设置标签页标题
  useEffect(() => {
    const TITLES = {
      "/": "主页",
      "/photos": "图片",
      "/videos": "视频",
      "/design": "设计",
      "/music": "音乐",
      "/design/product": "产品摄影",
    };
    
    // 动态设置音乐详情页标题
    if (location.pathname.startsWith("/music/")) {
      document.title = "Li Yang Studio — 音乐详情";
    } else {
      const suffix = TITLES[location.pathname] || "";
      document.title = suffix ? `Li Yang Studio — ${suffix}` : "Li Yang Studio";
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary selection:bg-theme-secondary transition-colors duration-300">
      <FixedGlassBar />
      {/* 全屏背景毛玻璃层：不拦截点击，曲线非线性（去重） */}
      <div className={"toolbar-blur-overlay " + (menuOpen ? "is-open" : "")}></div>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 8 : 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/design" element={<Design />} />
            <Route path="/music" element={<Music />} />
            <Route path="/design/graphic/:slug" element={<GraphicDetail />} />
            <Route path="/design/vi/:slug" element={<ViDetail />} />
            <Route path="/design/packaging/:slug" element={<PackagingDetail />} />
            <Route path="/design/product" element={<Product />} />
            <Route path="/videos/:slug" element={<VideoDetail />} />
            <Route path="/music/:slug" element={<MusicDetail />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      {/* 页面淡入淡出覆盖层（在淡出期间激活） */}
      <div className={"page-fade-overlay " + (isTransitioning ? "is-active" : "")}></div>

      {/* 页脚最后渐显（在页面内容出现之后） */}
      <motion.footer
        key={`footer-${location.pathname}`}
        className="footer-glass"
        style={{
          backgroundColor: `rgba(10,10,10,${OPACITY_HEADER})`,
          backdropFilter: "saturate(1.1) blur(10px)",
          WebkitBackdropFilter: "saturate(1.1) blur(10px)",
        }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? 4 : 0 }}
        transition={{ duration: 0.5, delay: isTransitioning ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-[1120px] mx-auto px-4 py-6 text-sm text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Li Yang Studio. 保留所有权利。</p>
        </div>
      </motion.footer>
    </div>
  );
}