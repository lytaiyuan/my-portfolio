import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ensureSlash = (p) => (p ? (p.startsWith("/") ? p : "/" + p) : "");
const normArray = (xs) => (Array.isArray(xs) ? xs : []).map(ensureSlash);

export default function PackagingDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  // 路径转换函数：将相对路径转换为GitHub raw URL
  const getGitHubUrl = (path) => {
    if (!path) return '';
    
    console.log('[PackagingDetail] 原始路径:', path);
    
    // 如果路径已经包含GitHub URL，直接返回
    if (path.includes('raw.githubusercontent.com')) {
      console.log('[PackagingDetail] 路径已包含GitHub URL，直接返回:', path);
      return path;
    }
    
    // 如果是外部链接，直接返回
    if (path.startsWith('http')) {
      console.log('[PackagingDetail] 外部链接，直接返回:', path);
      return path;
    }
    
    // 处理相对路径
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const finalUrl = `https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main${cleanPath}`;
    console.log('[PackagingDetail] 构建的最终URL:', finalUrl);
    return finalUrl;
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    const fetchPackagingData = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/lytaiyuan/my-portfolio-data/main/packaging.json'
        );
        
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
        console.error("[PackagingDetail] 读取GitHub包装设计数据失败：", e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    
    fetchPackagingData();
    return () => { alive = false; };
  }, []);

  const item = useMemo(() => {
    if (!data || !Array.isArray(data.items)) return null;
    return data.items.find((it) => String(it.slug) === String(slug)) || null;
  }, [data, slug]);

  const images = useMemo(() => {
    if (!item) return [];
    // 直接使用原始路径，不经过normArray处理
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    // 如果没有images数组，使用cover
    if (item.cover) {
      return [item.cover];
    }
    return [];
  }, [item]);

  const pdfPath = item?.pdf || "";

  if (loading) return <div className="min-h-screen grid place-items-center bg-neutral-950 text-neutral-300">加载中…</div>;
  if (err) return <div className="min-h-screen grid place-items-center bg-neutral-950 text-neutral-300">读取 packaging.json 出错：{String(err.message || err)}</div>;
  if (!item) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-[1120px] mx-auto px-4 py-10">
          <p className="text-sm text-neutral-400">未找到 slug = <code>{slug}</code> 的包装设计条目。</p>
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

        <div className="mt-6 space-y-4">
          {images.map((src, i) => (
            <figure key={src} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
              <img src={getGitHubUrl(src)} alt={`${item.title} - ${i + 1}`} className="w-full h-auto block" loading="lazy" />
            </figure>
          ))}
        </div>

        {pdfPath && (
          <div className="mt-8">
            <a href={getGitHubUrl(pdfPath)} download className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800">
              下载该 PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}