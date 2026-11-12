import snapshot from "#shared/content.json";
import {
  singleTypes,
  contentQuery,
  publicMedia,
  assertContent,
} from "#shared/cms.mjs";
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  // No shared cache: publishing or unpublishing takes effect on the next page load.
  setHeader(event, "Cache-Control", "no-store");
  if (config.contentSource === "snapshot") return snapshot;
  if (
    !config.strapiUrl ||
    !config.strapiToken ||
    !config.public.strapiMediaUrl
  ) {
    console.error("[content] CMS configuration is incomplete", {
      strapiUrlConfigured: Boolean(config.strapiUrl),
      strapiTokenConfigured: Boolean(config.strapiToken),
      strapiMediaUrlConfigured: Boolean(config.public.strapiMediaUrl),
    });
    throw createError({
      statusCode: 503,
      statusMessage: "CMS configuration is incomplete",
    });
  }
  try {
    const pairs = await Promise.all(
      Object.entries(singleTypes).map(async ([key, endpoint]) => {
        const response = await $fetch(
          `${config.strapiUrl.replace(
            /\/$/,
            ""
          )}/api/${endpoint}?${contentQuery(key)}`,
          {
            headers: { Authorization: `Bearer ${config.strapiToken}` },
            timeout: 8000,
            retry: 0,
          }
        );
        return [key, publicMedia(response.data, config.public.strapiMediaUrl)];
      })
    );
    return assertContent(Object.fromEntries(pairs));
  } catch (error) {
    // Never log API credentials or return internal CMS error details to the browser.
    console.error("[content] Unable to load required published CMS content", {
      statusCode: error?.statusCode || error?.status || error?.response?.status,
      code: error?.code || error?.cause?.code,
      statusMessage: error?.statusMessage || error?.response?.statusText,
    });
    throw createError({
      statusCode: 503,
      statusMessage: "Content is temporarily unavailable",
    });
  }
});
