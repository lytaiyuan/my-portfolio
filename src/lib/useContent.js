// src/lib/useContent.js
import { useEffect, useState } from "react";

export function useContent() {
  const [data, setData] = useState({ hero: "/photos/hero.jpg", photos: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/content.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((json) => {
        if (alive) {
          setData({
            hero: typeof json.hero === "string" ? json.hero : "/photos/hero.jpg",
            photos: Array.isArray(json.photos) ? json.photos : [],
            videos: Array.isArray(json.videos) ? json.videos : [],
          });
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setErr(e);
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, []);

  return { ...data, loading, error };
}
