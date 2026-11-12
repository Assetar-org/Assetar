const { mergeConfig } = require("vite");

module.exports = (config) =>
  mergeConfig(config, {
    resolve: {
      dedupe: ["@strapi/strapi", "@strapi/admin"],
    },
  });
