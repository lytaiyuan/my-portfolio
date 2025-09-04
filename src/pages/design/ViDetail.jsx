import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getConfigUrl, pickUrl } from "../../lib/configSource.js";

const ensureSlash = (p) => (p ? (p.startsWith("/") ? p : "/" + p) : "");
const normArray = (xs) => (Array.isArray(xs) ? xs : []).map(ensureSlash);

export default function ViDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocalOrRemote = (remote, local) => pickUrl(remote, local);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    
    const fetchViData = async () => {
      try {
        const response = await fetch(getConfigUrl('vi'));
        
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
        console.error("[ViDetail] 读取GitHub VI设计数据失败：", e);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    
    fetchViData();
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
      const len = Math.max(remotes.length, locals.length);
      return Array.from({ length: len }).map((_, i) => pickUrl(remotes[i], locals[i]));
    }
    if (item.cover || item.coverLocalUrl) {
      return [pickUrl(item.cover, item.coverLocalUrl)];
    }
    return [];
  }, [item]);

  const pdfPath = pickUrl(item?.pdf, item?.pdfLocalUrl) || "";

  if (loading) return <Wrap><p className="text-theme-muted">加载中…</p></Wrap>;
  if (err) return <Wrap><p className="text-red-400">读取出错：{String(err.message || err)}</p></Wrap>;
  if (!item) {
    return (
      <Wrap>
        <p className="text-theme-muted">未找到该 VI 条目（slug = <code>{slug}</code>）。</p>
        <div className="mt-4">
          <Link className="px-3 py-1.5 rounded-lg border border-theme-primary bg-black/5 hover:bg-black/15 text-sm text-theme-primary" to="/design">
            返回设计
          </Link>
        </div>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <div>
        <Link to="/design" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-black/5 hover:bg-black/15 text-sm text-theme-primary">
          ← 返回设计
        </Link>
        <h1 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-theme-primary">{item.title}</h1>
        {item.subtitle && <p className="mt-1 text-theme-secondary md:text-[15px]">{item.subtitle}</p>}

        <div className="mt-6 space-y-4">
          {images.map((src, i) => (
            <figure key={src} className="overflow-hidden rounded-2xl border border-theme-primary bg-black/5">
              <img src={src} alt={`${item.title} - ${i + 1}`} className="w-full h-auto block" loading="lazy" />
            </figure>
          ))}
        </div>

        {pdfPath && (
          <div className="mt-8">
            <a href={pdfPath} download className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-primary bg-black/5 hover:bg-black/15 text-sm text-theme-primary transition-colors duration-200">
              下载该 PDF
            </a>
          </div>
        )}
      </div>
    </Wrap>
  );
}

function Wrap({ children }) {
  return (
    <section className="border-t border-theme-primary bg-theme-primary pt-16">
      <div className="max-w-[1120px] mx-auto px-4 py-8 text-theme-primary">{children}</div>
    </section>
  );
}