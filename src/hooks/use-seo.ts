import { useEffect } from "react";

const DEFAULT_OG_IMAGE = "https://valora-vision.lovable.app/og-default.png";
const SITE_URL = "https://valora-vision.lovable.app";

function setMeta(nameOrProp: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector<HTMLMetaElement>(
    `meta[${attr}="${nameOrProp}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

interface SEOOptions {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  path?: string;
}

export function useSEO({ title, description, ogImage, ogType = "website", path }: SEOOptions) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:image", ogImage || DEFAULT_OG_IMAGE, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:site_name", "ValoraCasa", "property");
    if (path) {
      setMeta("og:url", `${SITE_URL}${path}`, "property");
    } else {
      setMeta("og:url", `${SITE_URL}${window.location.pathname}`, "property");
    }

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage || DEFAULT_OG_IMAGE);
  }, [title, description, ogImage, ogType, path]);
}
