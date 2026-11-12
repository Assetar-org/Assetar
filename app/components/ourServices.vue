<script setup>
const { content } = useSiteContent();
</script>
<template>
  <section>
    <div class="content">
      <div class="intro">
        <h2>{{ content.home.servicesHeading }}</h2>
        <p class="subheader">{{ content.home.servicesDescription }}</p>
      </div>
      <div class="service-grid">
        <div
          v-for="(item, index) in content.home.services"
          :key="index"
          class="grid-item"
        >
          <div class="item-content">
            <img :src="mediaUrl(item.image)" :alt="item.image?.alt || ''" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
@use "~/assets/styles/partials/variables" as v;
section {
  background: var(--Grey-bglast, #f9fbfc);
  padding: 2rem 0px;
  .content {
    width: 90%;
    margin: 0 auto;
    .intro {
      text-align: center;

      h2 {
        font-size: 1.5rem;
        font-family: "Clash Display";
      }
      .subheader {
        font-family: Satoshi;
        color: var(--Grey-3, #7d7e7f);
        font-weight: 600;
      }
    }
    .service-grid {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 1.5rem;
      margin-top: 2rem;
      .grid-item {
        width: 100%;
        background-color: #fff;
        padding: 1rem 0px;
        border-radius: 0.5rem;
        .item-content {
          margin: 0 auto;
          width: 90%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.5rem;
          img {
            width: 1.5rem;
            height: 1.5rem;
            padding: 8px;
            border-radius: 50%;
            background-color: #f9fbfc;
          }
          h3 {
            font-size: 1.25rem;
            font-family: "Satoshi";
          }
          p {
            font-family: "Satoshi";
            color: var(--Grey-3, #7d7e7f);
            font-weight: 600;
          }
        }
      }
    }
  }
  @media #{v.$media-mobile} {
    .content {
      .intro {
        text-align: left;
        br {
          display: none;
        }
      }
      .service-grid {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
      }
    }
  }
}
</style>
