<script setup>
const { content } = useSiteContent();
</script>
<template>
  <section>
    <div class="content">
      <div class="intro">
        <h2>{{ content.home.testimonialsHeading }}</h2>
        <p>{{ content.home.testimonialsDescription }}</p>
      </div>
      <div
        class="testimonialCarousel"
        tabindex="0"
        aria-label="Customer reviews"
      >
        <div
          v-for="(item, index) in content.home.testimonials"
          :key="index"
          class="testimonial"
        >
          <div class="content">
            <p class="word">{{ item.quote }}</p>
            <div class="btm">
              <div class="author">
                <div class="name">{{ item.author }}</div>
                <img src="../assets/images/svg/stars.svg" alt="" />
              </div>
              <img src="../assets/images/png/inverted-comma.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
section {
  background: var(--Grey-0, #050410);
  padding: 4rem 0px;
  color: #fff;
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
        color: #fff;
        font-weight: 600;
      }
    }
    .testimonialCarousel {
      width: 100%;
      display: flex;
      flex-direction: row;
      overflow-x: scroll;
      margin-top: 2rem;
      gap: 1.5rem;
      &::-webkit-scrollbar {
        height: 0px;
      }
      .testimonial {
        border-radius: var(--small, 1rem);
        background: var(--Grey-1, #2e2f35);
        // width: fit-content;
        height: 15rem;
        min-width: 30rem;
        max-width: 30rem;
        padding: 1rem 0px;
        .content {
          height: 100%;
          width: 90%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          p {
            font-family: "Satoshi";
            line-height: 130%;
            font-family: Satoshi;
            font-size: 1.125rem;
            font-style: normal;
            font-weight: 500;
          }
          .btm {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }
  }
}
</style>
