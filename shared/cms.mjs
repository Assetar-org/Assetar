export const singleTypes = {
  site: "site-setting",
  home: "home-page",
  about: "about-page",
};
const image = { populate: { file: true } };
const seo = {
  populate: { shareImage: image, headLinks: true, metaTags: true },
};
const cta = { populate: { button: true } };
export const populations = {
  site: {
    logo: image,
    tradeLink: true,
    navigation: true,
    contacts: true,
    socialLinks: true,
    seo,
    marketing: true,
  },
  home: {
    heroImage: image,
    primaryLink: true,
    secondaryLink: true,
    platforms: image,
    values: { populate: { image } },
    services: { populate: { image } },
    testimonials: true,
    cta,
    seo,
  },
  about: { primaryLink: true, faqs: true, cta, seo },
};
export function contentQuery(key) {
  const result = new URLSearchParams({ status: "published" });
  function visit(value, prefix) {
    for (const [k, v] of Object.entries(value)) {
      const path = `${prefix}[${k}]`;
      if (v && typeof v === "object") visit(v, path);
      else result.set(path, String(v));
    }
  }
  visit(populations[key], "populate");
  return result.toString();
}
export function publicMedia(value, origin) {
  if (Array.isArray(value))
    return value.map((item) => publicMedia(item, origin));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      key === "url" &&
      typeof entry === "string" &&
      entry.startsWith("/uploads/")
        ? new URL(entry, origin).href
        : publicMedia(entry, origin),
    ])
  );
}
export function assertContent(content) {
  if (
    !content.site?.name ||
    !content.site?.tradeLink?.href ||
    !content.home?.heroTitle ||
    !content.about?.heroTitle ||
    !content.home?.cta?.button ||
    !content.about?.cta?.button
  ) {
    throw new Error("Required published CMS content is missing");
  }
  return content;
}
