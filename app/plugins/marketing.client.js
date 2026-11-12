export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  // Initial page view is sent by the head integration. Register after hydration.
  nuxtApp.hook("app:mounted", () => {
    router.afterEach((to, from, failure) => {
      if (failure || to.path === from.path) return;
      const marketing = useState("site-content").value?.site?.marketing;
      if (!marketing?.enabled) return;
      if (marketing.googleTagId && window.gtag)
        window.gtag("event", "page_view", {
          page_path: to.fullPath,
          page_location: window.location.href,
        });
      if (marketing.snapchatPixelId && window.snaptr)
        window.snaptr("track", "PAGE_VIEW");
    });
  });
});
