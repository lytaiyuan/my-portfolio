// src/components/HomeDesign.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function HomeDesign() {
  const cover = `${"/home/design/cover.jpg"}${import.meta.env.DEV ? `?v=${Date.now()}` : ""}`;

  return (
    <section id="home-design" className="border-t border-neutral-900/80 bg-neutral-950">
      <div className="max-w-[1120px] mx-auto px-4 py-12">
        <div className="flex justify-end">
          <Link to="/design" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-sm">
            进入设计页
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" transform="scale(-1,1) translate(-24,0)"/></svg>
          </Link>
        </div>

        <div className="mt-6 group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img
              src={cover}
              alt="设计代表作"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
            {/* 覆盖文案 */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="text-white text-lg md:text-2xl font-semibold tracking-tight">补品包装设计</div>
                <div className="mt-1 text-white/85 text-xs md:text-sm max-w-[85%]">立即查看我们的获奖设计作品集</div>
              </div>
            </div>
          </div>
          {/* 下方可以放一句短说明（可按需改/删） */}
          <div className="p-3">
            <div className="text-sm font-medium text-neutral-100">进入设计页查看更多方案</div>
          </div>
        </div>
      </div>
    </section>
  );
}