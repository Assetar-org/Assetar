<script setup>
const { content } = useSiteContent();
const isActive = ref(false);
const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    isActive.value = false;
  }
);
</script>
<template>
  <nav>
    <div class="top-info">
      <p>{{ content.site.announcement }}</p>
    </div>
    <div class="nav-content">
      <NuxtLink class="logo" to="/"
        ><img
          :src="mediaUrl(content.site.logo)"
          :alt="content.site.logo?.alt || content.site.name"
        />
        <h4>{{ content.site.name }}</h4></NuxtLink
      >
      <div class="nav-list">
        <ContentLink
          v-for="(item, index) in content.site.navigation"
          :key="index"
          :link="item"
        />
      </div>
      <div class="buttons">
        <NuxtLink to="/#footer">{{ content.site.socialLabel }}</NuxtLink
        ><ContentLink class="trade-link" :link="content.site.tradeLink" />
      </div>
      <button
        class="hamburger hamburger--spring"
        :class="{ 'is-active': isActive }"
        :aria-expanded="isActive"
        aria-label="Toggle navigation"
        aria-controls="mobile-navigation"
        @click="isActive = !isActive"
        type="button"
      >
        <span class="hamburger-box"><span class="hamburger-inner"></span></span>
      </button>
    </div>
    <div v-if="isActive" id="mobile-navigation" class="mobile-dropdown">
      <div class="mb-nav-list">
        <ContentLink
          v-for="(item, index) in content.site.navigation"
          :key="index"
          :link="item"
          @click="isActive = false"
        /><NuxtLink to="/#footer" @click="isActive = false">{{
          content.site.socialLabel
        }}</NuxtLink>
      </div>
    </div>
  </nav>
</template>
<style lang="scss" scoped>
@use "~/assets/styles/partials/variables" as v;
nav {
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  height: auto;
  background-color: white;
  .top-info {
    background-image: url(../assets/images/top-info.png);
    width: 100%;
    height: fit-content;
    padding: 0.5rem 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .nav-content {
    width: 90%;
    margin: 0 auto;
    height: fit-content;
    display: flex;
    justify-content: space-between;

    // position: relative;
    // z-index: 10;
    .logo,
    .nav-list,
    .buttons {
      display: flex;
      align-items: center;
    }
    .logo {
      gap: 0px;
      cursor: pointer;
      img {
        width: 48px;
        height: 48px;
      }
      h4 {
        font-family: "Clash Display";
      }
    }
    .nav-list,
    .buttons {
      gap: 12px;
      p,
      a {
        cursor: pointer;
        font-weight: 600;
      }
      .trade-link {
        border-radius: 0.5rem;
        background: #0471a6;
        outline: none;
        color: #fff;
        padding: 12px 16px;
        border: none;
        cursor: pointer;
        text-decoration: none;
      }
    }
    .hamburger {
      display: none;
    }
  }
  .mobile-dropdown {
    display: none;
  }
  @media #{v.$media-mobile} {
    .nav-content {
      .nav-list,
      .buttons {
        display: none;
      }
    }
    .hamburger {
      display: block !important;
      background-color: white;
      transform: scale(0.8);
    }
    .mobile-dropdown {
      background: white;
      width: 100%;
      display: block;
      position: absolute;
      z-index: 10;
      .mb-nav-list {
        width: 90%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        p,
        a {
          font-size: 16px;
          font-weight: 600;
          border-bottom: 2px solid #ffffff;
          padding-bottom: 4px;
          &.active {
            border-bottom: 2px solid #0471a6;
          }
          &:active {
            border-bottom: 2px solid #0471a6;
          }
        }
      }
    }
  }
}
</style>

<style scoped>
nav a {
  text-decoration: none;
  color: inherit;
}
.nav-list a,
.mb-nav-list a {
  cursor: pointer;
}
.mb-nav-list a {
  display: block;
  padding: 0.75rem 0;
}
</style>
