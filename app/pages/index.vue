<script setup>
const { content } = useSiteContent();
usePageHead("home");
</script>
<template>
  <div>
    <NavBar />
    <main>
      <section class="hero">
        <div class="text-section">
          <div class="content">
            <h1 class="intro-text">{{ content.home.heroTitle }}</h1>
            <p class="sub-text">{{ content.home.heroDescription }}</p>
            <div class="button-row">
              <ContentLink
                class="main-button"
                :link="content.home.primaryLink"
              /><ContentLink
                v-if="content.home.secondaryLink?.href"
                class="outline-button"
                :link="content.home.secondaryLink"
              />
            </div>
          </div>
        </div>
        <div class="image-section">
          <img
            :src="mediaUrl(content.home.heroImage)"
            :alt="content.home.heroImage?.alt || ''"
          />
        </div>
      </section>
      <SocialProof />
      <OurOffers id="offers" />
      <OurServices />
      <TestimonialSect id="testimonial" />
      <section class="btm-talk">
        <div class="content">
          <div id="cont">
            <div class="text-sect">
              <h3>{{ content.home.cta.title }}</h3>
              <h3 id="second">
                {{ content.home.cta.subtitle }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="54"
                  height="54"
                  viewBox="0 0 54 54"
                  fill="none"
                >
                  <path
                    d="M27 0C29.5892 13.6971 40.3029 24.4108 54 27C40.3029 29.5892 29.5892 40.3029 27 54C24.4108 40.3029 13.6971 29.5892 0 27C13.6971 24.4108 24.4108 13.6971 27 0Z"
                    fill="#0471A6"
                  />
                </svg>
              </h3>
            </div>
            <div class="btn-hold">
              <ContentLink id="hello" :link="content.home.cta.button" />
              <p>{{ content.home.cta.description }}</p>
            </div>
          </div>
        </div>
      </section>
      <FooterSect id="footer" />
    </main>
  </div>
</template>
