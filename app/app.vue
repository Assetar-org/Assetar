<script setup>
import { buildMarketingHead } from "#shared/head.mjs";
const { data, error } = await useAsyncData("site-content", () =>
  $fetch("/api/content")
);
if (error.value)
  throw createError({
    statusCode: 503,
    statusMessage:
      "Content is temporarily unavailable. Please try again shortly.",
  });
const content = useState("site-content", () => data.value);
useHead(() => buildMarketingHead(content.value.site.marketing));
</script>
<template>
  <NuxtPage />
  <WhatsAppButton />
</template>
