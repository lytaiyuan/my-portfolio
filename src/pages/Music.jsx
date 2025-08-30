// src/pages/Music.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Music() {
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/music.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((json) => {
        setMusic(Array.isArray(json.items) ? json.items : []);
        setLoading(false);
      })
      .catch((e) => {
        console.error("[Music] 读取 /music.json 失败：", e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="bg-neutral-950 text-neutral-100">
        <div className="max-w-[1120px] mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold">音乐</h1>
          <p className="mt-2 text-neutral-400">加载中…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-neutral-950 text-neutral-100">
      <div className="max-w-[1120px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">音乐</h1>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {music.map((item) => (
            <Link
              key={item.id}
              to={`/music/${item.slug}`}
              className="group block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 hover:border-neutral-700 transition-colors"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg group-hover:text-blue-400 transition-colors">
                  {item.hottitle}
                </h3>
                <p className="mt-2 text-sm text-neutral-400 line-clamp-2">
                  {item.hotintro}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                  <span>{item.duration}</span>
                  <span className="text-blue-400">查看详情 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}