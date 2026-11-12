import { buildPageHead } from "#shared/head.mjs";
export function usePageHead(page) {
  const { content } = useSiteContent();
  const config = useRuntimeConfig();
  const route = useRoute();
  useHead(() =>
    buildPageHead(
      content.value.site,
      content.value[page],
      route.path,
      config.public.siteUrl
    )
  );
}
