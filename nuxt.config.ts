export default defineNuxtConfig({
  compatibilityDate: "2026-11-12",
  devtools: { enabled: false },
  css: [
    "~/assets/main.css",
    "~/assets/styles/global.scss",
    "~/assets/styles/hamburgers.css",
    "~/assets/styles/pages.scss",
  ],
  nitro: { preset: "node-server" },
  runtimeConfig: {
    strapiUrl: "",
    strapiToken: "",
    // Local previews use the migrated snapshot; production requires published CMS content.
    contentSource: "cms",
    public: { siteUrl: "", strapiMediaUrl: "" },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [{ rel: "icon", href: "/favicon.ico" }],
      meta: [{ name: "format-detection", content: "telephone=no" }],
    },
  },
});
