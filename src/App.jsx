// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./components/ThemeToggle";
import ThemeImage from "./components/ThemeImage";
import { useTheme } from "./lib/useTheme.js";

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

/** 固定在最上方的玻璃背景条（包含所有工具栏功能） */
function FixedGlassBar() {
  const [open, setOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const location = useLocation();

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

  return (
    <>
      {/* 主工具栏背景 */}
      <div
        className="fixed top-0 left-0 w-screen toolbar-glass"
        style={{
          height: HEADER_HEIGHT_PX,
          zIndex: 105,
        }}
      >
        <div className="max-w-[1120px] mx-auto px-4">
          <div className="h-12 flex items-center justify-between md:grid md:grid-cols-3 md:justify-normal relative z-[120]" key={`toolbar-content-${isLight ? 'light' : 'dark'}-${forceUpdate}`}>
            {/* 手机：左 LOGO */}
            <Link to="/" className="md:hidden flex items-center">
              <ThemeImage 
                type="logo" 
                alt="Li Yang Studio" 
                className="h-5 w-auto" 
                isLight={isLight} 
                actualTheme={actualTheme} 
                key={`logo-mobile-${isLight ? 'light' : 'dark'}`}
              />
            </Link>

            {/* 桌面：左侧菜单 */}
            <nav className="hidden md:flex justify-self-start gap-6 text-sm text-theme-secondary">
              <NavLink to="/">主页</NavLink>
              <NavLink to="/photos">图片</NavLink>
              <NavLink to="/videos">视频</NavLink>
              <NavLink to="/design">设计</NavLink>
              <NavLink to="/music">音乐</NavLink>
            </nav>

            {/* 桌面：中 LOGO */}
            <Link to="/" className="hidden md:flex justify-self-center items-center">
              <ThemeImage 
                type="logo" 
                alt="Li Yang Studio" 
                className="h-5 w-auto" 
                isLight={isLight} 
                actualTheme={actualTheme} 
                key={`logo-desktop-${isLight ? 'light' : 'dark'}`}
              />
            </Link>

            {/* 桌面：右侧主题切换按钮 */}
            <div className="hidden md:flex justify-self-end items-center">
              <ThemeToggle variant="desktop" />
            </div>

            {/* 手机：右侧菜单键 */}
            <div className="md:hidden">
              {!open && (
                <button
                  aria-label="打开菜单"
                  onClick={() => setOpen(true)}
                  className="p-2 rounded-lg border border-theme-primary bg-theme-card/80"
                >
                  <ThemeImage 
                    type="menu" 
                    alt="menu" 
                    className="h-4 w-4" 
                    isLight={isLight} 
                    actualTheme={actualTheme} 
                    key={`menu-${isLight ? 'light' : 'dark'}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-[115] overlay-glass"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 右侧抽屉菜单 */}
      <div
        className={
          "fixed inset-y-0 right-0 z-[130] w-72 p-4 drawer-glass " +
          "transform transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "translate-x-full pointer-events-none")
        }
      >
        {/* 关闭按钮：抽屉右上角（与菜单键位置一致） */}
        <button
          aria-label="关闭菜单"
          onClick={() => setOpen(false)}
          className="absolute top-2 right-4 p-2 rounded-lg border border-theme-primary bg-theme-card/80"
        >
          <ThemeImage 
            type="close" 
            alt="close" 
            className="h-4 w-4" 
            isLight={isLight} 
            actualTheme={actualTheme} 
            key={`close-${isLight ? 'light' : 'dark'}`}
          />
        </button>

        <div className="mt-8 flex flex-col gap-2 text-theme-primary" key={`drawer-content-${isLight ? 'light' : 'dark'}-${forceUpdate}`}>
          <DrawerLink to="/">主页</DrawerLink>
          <DrawerLink to="/photos">图片</DrawerLink>
          <DrawerLink to="/videos">视频</DrawerLink>
          <DrawerLink to="/design">设计</DrawerLink>
          <DrawerLink to="/music">音乐</DrawerLink>
          
          {/* 手机端主题切换按钮 */}
          <div className="mt-4 pt-4 border-t border-theme-primary">
            <div className="flex items-center justify-center">
              <ThemeToggle variant="mobile" />
            </div>
          </div>
        </div>
      </div>
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
      className="px-3 py-2 rounded-lg bg-theme-card/40 hover:bg-theme-card/60 text-theme-primary"
    >
      {children}
    </Link>
  );
}

export default function App() {
  const location = useLocation();

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
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
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

      {/* 页脚也给同款玻璃效果（保持一致） */}
      <footer
        className="border-t border-neutral-900/80"
        style={{
          backgroundColor: `rgba(10,10,10,${OPACITY_HEADER})`,
          backdropFilter: "saturate(1.1) blur(10px)",
          WebkitBackdropFilter: "saturate(1.1) blur(10px)",
        }}
      >
        <div className="max-w-[1120px] mx-auto px-4 py-6 text-sm text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Li Yang Studio. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  );
}