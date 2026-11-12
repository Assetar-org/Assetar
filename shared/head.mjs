// Only structured, escaped head fields are accepted; CMS editors never supply raw HTML.
export function safeUrl(value, { contact = false, absolute = false } = {}) {
  if (typeof value !== "string" || /[\u0000-\u0020\u007f\\]/.test(value))
    return "";
  if (!absolute && /^\/(?!\/)/.test(value)) return value;
  if (!absolute && value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    if (
      ["https:", "http:", ...(contact ? ["mailto:", "tel:"] : [])].includes(
        url.protocol
      ) &&
      !url.username &&
      !url.password
    )
      return value;
  } catch {
    /* invalid URLs are omitted */
  }
  return "";
}
const allowedRels = new Set([
  "canonical",
  "alternate",
  "preconnect",
  "dns-prefetch",
  "preload",
  "icon",
  "apple-touch-icon",
]);
const preloadTypes = new Set(["image", "font", "style", "script", "fetch"]);
export function buildPageHead(site, page, path, siteUrl = "") {
  const defaults = site.seo || {};
  const seo = {
    ...defaults,
    ...Object.fromEntries(
      Object.entries(page.seo || {}).filter(
        ([, value]) => value !== null && value !== undefined && value !== ""
      )
    ),
  };
  const title = seo.title || site.name;
  const base = safeUrl(siteUrl, { absolute: true });
  const canonical =
    safeUrl(page.seo?.canonicalUrl, { absolute: true }) ||
    (base ? new URL(path, base).href : "");
  const links = new Map();
  if (canonical)
    links.set("canonical", {
      key: "canonical",
      rel: "canonical",
      href: canonical,
    });
  for (const item of [
    ...(defaults.headLinks || []),
    ...(safeUrl(page.seo?.canonicalUrl, { absolute: true })
      ? [{ rel: "canonical", href: page.seo.canonicalUrl }]
      : []),
    ...(page.seo?.headLinks || []),
  ]) {
    const href = safeUrl(item.href);
    if (!href || !allowedRels.has(item.rel)) continue;
    if (item.rel === "canonical" && !safeUrl(href, { absolute: true }))
      continue;
    if (item.rel === "preload" && !preloadTypes.has(item.as)) continue;
    const key =
      item.rel === "canonical"
        ? "canonical"
        : `${item.rel}:${item.hreflang || ""}:${href}`;
    links.set(key, {
      key,
      rel: item.rel,
      href,
      ...(item.hreflang ? { hreflang: item.hreflang } : {}),
      ...(item.type ? { type: item.type } : {}),
      ...(item.rel === "preload" ? { as: item.as } : {}),
      ...(item.crossOrigin ? { crossorigin: "anonymous" } : {}),
    });
  }
  const meta = new Map();
  for (const item of [
    ...(defaults.metaTags || []),
    ...(page.seo?.metaTags || []),
  ]) {
    if (
      /^[a-zA-Z][a-zA-Z0-9:_.-]{0,99}$/.test(item.name || "") &&
      typeof item.content === "string"
    ) {
      meta.set(item.name.toLowerCase(), {
        name: item.name,
        content: item.content,
      });
    }
  }
  // Dedicated SEO fields take precedence over arbitrary meta entries.
  for (const [name, value] of Object.entries({
    description: seo.description || "",
    keywords: seo.keywords || "",
    robots: seo.noIndex ? "noindex, nofollow" : "index, follow",
  })) {
    meta.set(name, { name, content: value });
  }
  const shareImage = safeUrl(seo.shareImage?.file?.url || seo.shareImage?.url);
  const ogImage =
    shareImage && base ? new URL(shareImage, base).href : shareImage;
  return {
    title,
    link: [...links.values()],
    meta: [
      ...meta.values(),
      { property: "og:title", content: title },
      { property: "og:description", content: seo.description || "" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: site.name },
      ...(links.has("canonical")
        ? [{ property: "og:url", content: links.get("canonical").href }]
        : []),
      ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
      {
        name: "twitter:card",
        content: ogImage ? "summary_large_image" : "summary",
      },
    ],
  };
}
export function buildMarketingHead(marketing = {}) {
  if (!marketing.enabled) return { script: [] };
  const script = [];
  if (/^(G|AW|GT)-[A-Z0-9]+$/.test(marketing.googleTagId || "")) {
    const id = JSON.stringify(marketing.googleTagId);
    script.push({
      key: "google-init",
      tagPriority: 0,
      innerHTML: `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',${id});`,
    });
    script.push({
      key: "google-tag",
      src: `https://www.googletagmanager.com/gtag/js?id=${marketing.googleTagId}`,
      async: true,
    });
  }
  if (/^[0-9a-f-]{36}$/i.test(marketing.snapchatPixelId || "")) {
    script.push({
      key: "snapchat-init",
      tagPriority: 0,
      innerHTML: `window.snaptr=window.snaptr||function(){window.snaptr.handleRequest?window.snaptr.handleRequest.apply(window.snaptr,arguments):window.snaptr.queue.push(arguments)};window.snaptr.queue=window.snaptr.queue||[];window.snaptr('init',${JSON.stringify(
        marketing.snapchatPixelId
      )},{});window.snaptr('track','PAGE_VIEW');`,
    });
    script.push({
      key: "snapchat-pixel",
      src: "https://sc-static.net/scevent.min.js",
      async: true,
    });
  }
  const mailchimp = safeUrl(marketing.mailchimpScriptUrl, { absolute: true });
  if (
    mailchimp &&
    new URL(mailchimp).protocol === "https:" &&
    new URL(mailchimp).hostname === "chimpstatic.com" &&
    new URL(mailchimp).pathname.endsWith(".js")
  ) {
    script.push({ key: "mailchimp", src: mailchimp, async: true });
  }
  return { script };
}
