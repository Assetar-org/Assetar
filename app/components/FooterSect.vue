<script setup>
const { content } = useSiteContent();
</script>
<template>
  <footer id="footer">
    <div class="list_row">
      <div class="ftContact">
        <h5>{{ content.site.contactHeading }}</h5>
        <ul>
          <li v-for="(item, index) in content.site.contacts" :key="index">
            <ContentLink :link="item" />
          </li>
        </ul>
      </div>
      <div class="ftlinks">
        <h5>{{ content.site.socialHeading }}</h5>
        <ul>
          <li v-for="(item, index) in content.site.socialLinks" :key="index">
            <ContentLink :link="item" />
          </li>
        </ul>
      </div>
    </div>
    <div class="copyRight">{{ content.site.copyright }}</div>
  </footer>
</template>
<style lang="scss" scoped>
@use "~/assets/styles/partials/variables" as v;
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
footer {
  width: 100%;
  .list_row {
    width: 80%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 auto;
    div {
      h5 {
        font-size: 18px;
        font-weight: bold;
        font-family: "Clash Display";
      }
      ul {
        img {
          width: 24px;
        }
        li,
        a {
          display: flex;
          gap: 8px;
          align-items: center;
          font-weight: 600;
          //   justify-content: center;
          cursor: pointer;
          a {
            text-decoration: none;
            color: var(--Grey-3, #7d7e7f);
          }
        }
        li {
          margin: 12px 0px;
        }
      }
    }
  }

  .copyRight {
    width: 100%;
    background-image: url(../assets/images/top-info.png);
    text-align: center;
    color: #fff;
    padding: 2rem 0px;
    margin-top: 4rem;
    // border-radius: 40px 40px 0px 0px;
    font-family: "Clash Display";
  }
  @media #{v.$media-mobile} {
    .list_row {
      flex-direction: column;
    }
    .copyRight {
      border-radius: 16px 16px 0px 0px;
    }
  }
}
</style>
