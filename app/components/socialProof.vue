<script setup>
const { content } = useSiteContent();
</script>
<template>
  <section>
    <h4 class="intro">{{ content.home.platformHeading }}</h4>
    <div class="image-row">
      <img
        v-for="(item, index) in content.home.platforms"
        :key="index"
        :src="mediaUrl(item)"
        :alt="item.alt || ''"
      />
    </div>
  </section>
</template>
<style lang="scss" scoped>
@use "~/assets/styles/partials/variables" as v;
section {
  background: var(--Grey-bglast, #f9fbfc);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0rem;
  padding: 1rem;
  h4 {
    font-family: "Clash Display";
  }
  .image-row {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    align-items: center;
    justify-content: space-evenly;
  }
  img {
    aspect-ratio: 16/4;
    object-fit: contain;
    width: 150px;
  }
  @media #{v.$media-mobile} {
    .image-row {
      width: 100%;
      position: relative;
      overflow: scroll;
    }
  }
}
</style>
