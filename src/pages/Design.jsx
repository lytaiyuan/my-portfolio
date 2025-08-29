// src/pages/Design.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Card = ({ img, title, subtitle, to }) => (
  <Link to={to} className="group block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
    <div className="relative aspect-[16/9] w-full overflow-hidden">
      <img
        src={img}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="text-white text-lg md:text-2xl font-semibold tracking-tight">{title}</div>
          {subtitle && <div className="mt-1 text-white/85 text-xs md:text-sm max-w-[85%]">{subtitle}</div>}
        </div>
      </div>
    </div>
    <div className="p-3">
      <div className="text-sm font-medium text-neutral-100">{title}</div>
    </div>
  </Link>
);

export default function Design() {
  const [graphic, setGraphic] = useState([]);
  const [vi, setVi] = useState([]);
  const [pack, setPack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const g = await fetch("/graphiccontent.json", { cache: "no-cache" }).then(r => r.json()).catch(() => ({ items: [] }));
      const v = await fetch("/vi.json",              { cache: "no-cache" }).then(r => r.json()).catch(() => ({ items: [] }));
      const p = await fetch("/packaging.json",       { cache: "no-cache" }).then(r => r.json()).catch(() => ({ items: [] }));
      if (!alive) return;
      setGraphic(Array.isArray(g.items) ? g.items : []);
      setVi(Array.isArray(v.items) ? v.items : []);
      setPack(Array.isArray(p.items) ? p.items : []);
      setLoading(false);
      document.title = "Li Yang Studio — 设计";
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="min-h-[50svh] grid place-items-center text-neutral-400">加载设计内容…</div>;

  return (
    <div className="bg-neutral-950 text-neutral-100">
      <div className="max-w-[1120px] mx-auto px-4 py-10 space-y-12">
        <Section title="平面设计">
          <Grid>
            {graphic.slice(0, 3).map(it => (
              <Card key={it.slug} img={it.cover} title={it.title} subtitle={it.subtitle} to={`/design/graphic/${it.slug}`} />
            ))}
          </Grid>
        </Section>

        <Section title="视觉识别（VI）方案">
          <Grid>
            {vi.slice(0, 3).map(it => (
              <Card key={it.slug} img={it.cover} title={it.title} subtitle={it.subtitle} to={`/design/vi/${it.slug}`} />
            ))}
          </Grid>
        </Section>

        <Section title="包装设计">
          <Grid>
            {pack.slice(0, 3).map(it => (
              <Card key={it.slug} img={it.cover} title={it.title} subtitle={it.subtitle} to={`/design/packaging/${it.slug}`} />
            ))}
          </Grid>
        </Section>

        <Section title="产品摄影" action={<LinkBtn to="/design/product">进入产品摄影</LinkBtn>}>
          <div className="rounded-2xl border border-neutral-800 p-6 text-neutral-400">
            进入“产品摄影”页查看瀑布流作品。
          </div>
        </Section>
      </div>
    </div>
  );
}

/* 小组件 */
function Section({ title, action, children }) {
  return (
    <section className="border-t border-neutral-900/80 pt-8">
      <div className="flex items-end justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}
function LinkBtn({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-sm">
      {children}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" transform="scale(-1,1) translate(-24,0)"/></svg>
    </Link>
  );
}