<script setup>
const { content } = useSiteContent();
usePageHead("about");
</script>
<template>
  <div>
    <NavBar />
    <main>
      <section class="hero">
        <div class="text-section">
          <div class="content">
            <h5>{{ content.about.eyebrow }}</h5>
            <h1 class="intro-text">{{ content.about.heroTitle }}</h1>
            <div class="button-row">
              <ContentLink
                class="main-button"
                :link="content.about.primaryLink"
              />
            </div>
          </div>
        </div>
      </section>
      <FaqSect />
      <section class="btm-talk">
        <div class="content">
          <div id="cont">
            <div class="text-sect">
              <h3>{{ content.about.cta.title }}</h3>
              <h3 id="second">
                {{ content.about.cta.subtitle }}
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
              <ContentLink id="hello" :link="content.about.cta.button" />
              <p>{{ content.about.cta.description }}</p>
            </div>
          </div>
        </div>
      </section>
      <FooterSect />
    </main>
  </div>
</template>

<style lang="scss" scoped>
section.hero {
  background: var(--Grey-bglast, #f9fbfc);
  padding: 1rem 0px;
  .text-section {
    .content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      h5 {
        padding: 0;
        margin: 0;
        color: #0471a6;
      }
    }
  }
}
.btm-talk {
  background: linear-gradient(to bottom, #0471a6 50%, #fff 50%) !important;
  padding: 1rem 0rem;
}
.btn-hold {
  display: flex;
  flex-direction: column;
  #hello {
    width: fit-content;
    border-radius: 0.5rem;
    background: #0471a6;
    outline: none;
    color: #fff;
    padding: 12px 16px;
    border: none;
    cursor: pointer;
    text-decoration: none;
  }
  p {
    width: 10rem;
  }
}
</style>
