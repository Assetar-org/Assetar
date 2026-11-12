<script setup>
defineProps({ link: { type: Object, default: () => ({}) } });
</script>
<template>
  <NuxtLink
    :to="safeHref(link?.href)"
    :target="link?.newTab ? '_blank' : undefined"
    :rel="link?.newTab ? 'noopener noreferrer' : undefined"
    ><slot>{{ link?.label }}</slot></NuxtLink
  >
</template>
