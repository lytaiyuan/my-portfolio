// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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

/** ===== 可调参数（0~1 之间）===== */
const OPACITY_HEADER = 0.30; // 顶部玻璃条透明度
const OPACITY_DRAWER = 0.30; // 手机端抽屉透明度
const HEADER_HEIGHT_PX = 48; // 12 * 4px

/** 固定在最上方的玻璃背景条（真正制造半透明 & 毛玻璃） */
function FixedGlassBar() {
  return (
    <div
      className="fixed top-0 left-0 w-screen"
      style={{
        height: HEADER_HEIGHT_PX,
        zIndex: 105,
        pointerEvents: "none",
        backgroundColor: `rgba(10,10,10,${OPACITY_HEADER})`,
        backdropFilter: "saturate(1.1) blur(10px)",
        WebkitBackdropFilter: "saturate(1.1) blur(10px)",
        borderBottom: "1px solid rgba(38,38,38,0.8)", // neutral-800/80
      }}
      aria-hidden
    />
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

function TopNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // 路由切换时自动收起抽屉
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className="sticky top-0 z-[110] isolate"
      style={{
        height: HEADER_HEIGHT_PX,
        borderBottom: "1px solid rgba(38,38,38,0.8)", // neutral-800/80
      }}
    >
      <div className="max-w-[1120px] mx-auto px-4">
        <div className="h-12 flex items-center justify-between md:grid md:grid-cols-3 md:justify-normal">
          {/* 手机：左 LOGO */}
          <Link to="/" className="md:hidden flex items-center">
            <img src="/logo.png" alt="Li Yang Studio" className="h-5 w-auto" />
          </Link>

          {/* 桌面：左侧菜单 */}
          <nav className="hidden md:flex justify-self-start gap-6 text-sm text-neutral-400">
            <NavLink to="/">主页</NavLink>
            <NavLink to="/photos">图片</NavLink>
            <NavLink to="/videos">视频</NavLink>
            <NavLink to="/design">设计</NavLink>
            <NavLink to="/music">音乐</NavLink>
          </nav>

          {/* 桌面：中 LOGO */}
          <Link to="/" className="hidden md:flex justify-self-center items-center">
            <img src="/logo.png" alt="Li Yang Studio" className="h-5 w-auto" />
          </Link>

          {/* 桌面：右占位 */}
          <div className="hidden md:block justify-self-end" />

          {/* 手机：右侧菜单键 */}
          <div className="md:hidden">
            {!open && (
              <button
                aria-label="打开菜单"
                onClick={() => setOpen(true)}
                className="p-2 rounded-lg border border-neutral-800 bg-neutral-900/80"
              >
                <img src="/Menu.png" alt="menu" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 遮罩（盖过固定背景条和页面内容） */}
      {open && (
        <div
          className="fixed inset-0 z-[115] bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 抽屉（层级最高） */}
      <div
        className={
          "fixed inset-y-0 right-0 z-[120] w-72 border-l border-neutral-800 p-4 " +
          "transform transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "translate-x-full pointer-events-none")
        }
        style={{
          backgroundColor: `rgba(10,10,10,${OPACITY_DRAWER})`,
          backdropFilter: "saturate(1.1) blur(10px)",
          WebkitBackdropFilter: "saturate(1.1) blur(10px)",
        }}
      >
        {/* 关闭按钮：抽屉右上角（与菜单键位置一致） */}
        <button
          aria-label="关闭菜单"
          onClick={() => setOpen(false)}
          className="absolute top-2 right-4 p-2 rounded-lg border border-neutral-800 bg-neutral-900/80"
        >
          <img src="/close.png" alt="close" className="h-4 w-4" />
        </button>

        <div className="mt-8 flex flex-col gap-2 text-neutral-200">
          <DrawerLink to="/">主页</DrawerLink>
          <DrawerLink to="/photos">图片</DrawerLink>
          <DrawerLink to="/videos">视频</DrawerLink>
          <DrawerLink to="/design">设计</DrawerLink>
          <DrawerLink to="/music">音乐</DrawerLink>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} className="hover:text-neutral-200 transition">
      {children}
    </Link>
  );
}
function DrawerLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800"
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
    const suffix = TITLES[location.pathname] || "";
    document.title = suffix ? `Li Yang Studio — ${suffix}` : "Li Yang Studio";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800">
      <FixedGlassBar />
      <TopNav />
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