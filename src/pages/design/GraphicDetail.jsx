import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getConfigUrl, pickUrl } from "../../lib/configSource.js";

const ensureSlash = (p) => (p ? (p.startsWith("/") ? p : "/" + p) : "");
const normArray = (xs) => (Array.isArray(xs) ? xs : []).map(ensureSlash);

export default function GraphicDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocalOrRemote = (remote, local) => pickUrl(remote, local);

  // 从GitHub读取平面设计数据
  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    const fetchGraphicData = async () => {
      try {
        const response = await fetch(getConfigUrl('graphiccontent'));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const json = await response.json();
        
        if (!alive) return;
        setData(json);
        setErr(null);
      } catch (e) {
        if (!alive) return;
        setErr(e);
        console.error("[GraphicDetail] 读取GitHub平面设计数据失败：", e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    
    fetchGraphicData();
    return () => { alive = false; };
  }, []);

  const item = useMemo(() => {
    if (!data || !Array.isArray(data.items)) return null;
    return data.items.find((it) => String(it.slug) === String(slug)) || null;
  }, [data, slug]);

  const images = useMemo(() => {
    if (!item) return [];
    const remotes = Array.isArray(item.images) ? item.images : [];
    const locals = Array.isArray(item.imagesLocalUrls) ? item.imagesLocalUrls : [];
    if (remotes.length || locals.length) {
      // 优先使用本地数组与远程数组逐项配对
      const len = Math.max(remotes.length, locals.length);
      return Array.from({ length: len }).map((_, i) => pickUrl(remotes[i], locals[i]));
    }
    if (item.cover || item.coverLocalUrl) {
      return [pickUrl(item.cover, item.coverLocalUrl)];
    }
    return [];
  }, [item]);

  const pdfPath = pickUrl(item?.pdf, item?.pdfLocalUrl) || "";

  if (loading) return <div className="min-h-screen grid place-items-center bg-neutral-950 text-neutral-300">加载中…</div>;
  if (err) return <div className="min-h-screen grid place-items-center bg-neutral-950 text-neutral-300">读取 graphiccontent.json 出错：{String(err.message || err)}</div>;
  if (!item) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-[1120px] mx-auto px-4 py-10">
          <p className="text-sm text-neutral-400">未找到 slug = <code>{slug}</code> 的平面设计条目。</p>
          <p className="mt-2"><Link to="/design" className="underline">← 返回设计</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-[1120px] mx-auto px-4 py-6">
        <Link to="/design" className="text-sm text-neutral-400 underline">← 返回设计</Link>
        <h1 className="mt-4 text-2xl font-semibold">{item.title}</h1>
        {item.subtitle && <p className="mt-1 text-neutral-400">{item.subtitle}</p>}

        {/* 长图区域：铺底展示（容器内全宽，带圆角与细边框） */}
        <div className="mt-6 space-y-4">
          {images.map((src, i) => (
            <figure key={src} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
              <img
                src={src}
                alt={`${item.title} - ${i + 1}`}
                className="w-full h-auto block"
                loading="lazy"
              />
            </figure>
          ))}
        </div>

        {/* 页尾：下载 PDF（保留原始 PDF 下载） */}
        {pdfPath && (
          <div className="mt-8">
            <a
              href={pdfPath}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
            >
              下载该 PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}