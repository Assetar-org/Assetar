"use strict";
const fs = require("node:fs/promises");
const path = require("node:path");
const snapshot = require("../seed/content.json");
const models = { site: "site-setting", home: "home-page", about: "about-page" };
const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
async function importMedia(strapi, value) {
  if (Array.isArray(value)) {
    // Several cards reuse one icon. Serialize imports to avoid duplicate uploads.
    const items = [];
    for (const item of value) items.push(await importMedia(strapi, item));
    return items;
  }
  if (!value || typeof value !== "object") return value;
  const result = {};
  for (const [key, item] of Object.entries(value))
    result[key] = await importMedia(strapi, item);
  if (typeof value.url === "string" && value.url.startsWith("/legacy/")) {
    const relative = value.url.slice("/legacy/".length);
    const filename = path.join(__dirname, "../seed-media", relative);
    const name = `migrated-${relative.replaceAll("/", "-")}`;
    const existing = await strapi.db
      .query("plugin::upload.file")
      .findOne({ where: { name } });
    if (existing) result.file = existing.id;
    else {
      const stat = await fs.stat(filename);
      const uploaded = await strapi
        .plugin("upload")
        .service("upload")
        .upload({
          data: { fileInfo: { name, alternativeText: value.alt || "" } },
          files: {
            filepath: filename,
            originalFilename: path.basename(filename),
            mimetype: mimeTypes[path.extname(filename)],
            size: stat.size,
          },
        });
      result.file = uploaded[0].id;
    }
  }
  return result;
}
module.exports = {
  async bootstrap({ strapi }) {
    if (process.env.SEED_CONTENT !== "true") return;
    // Existing drafts, unpublished documents, and team edits are never overwritten.
    for (const [key, model] of Object.entries(models)) {
      const uid = `api::${model}.${model}`;
      const existing = await strapi.db.query(uid).count();
      if (existing > 0) {
        strapi.log.info(`Migration skipped existing ${model}`);
        continue;
      }
      const data = await importMedia(strapi, structuredClone(snapshot[key]));
      await strapi.documents(uid).create({ data, status: "published" });
      strapi.log.info(`Migrated and published ${model}`);
    }
  },
};
