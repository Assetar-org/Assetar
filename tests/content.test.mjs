import test from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { buildPageHead, buildMarketingHead, safeUrl } from "../shared/head.mjs";
import { contentQuery, publicMedia, assertContent } from "../shared/cms.mjs";
const require = createRequire(import.meta.url);
const snapshot = JSON.parse(
  readFileSync(new URL("../shared/content.json", import.meta.url))
);
const cmsSeed = require("../cms/seed/content.json");
const models = { site: "site-setting", home: "home-page", about: "about-page" };

test("all migrated content fits the CMS schema and media exists", () => {
  assert.deepEqual(snapshot, cmsSeed);
  function validate(value, schema) {
    for (const [name, field] of Object.entries(schema.attributes)) {
      if (field.required)
        assert.ok(value[name] !== undefined && value[name] !== "", name);
    }
    for (const [name, item] of Object.entries(value)) {
      const field = schema.attributes[name];
      assert.ok(field, `Unknown field ${name}`);
      if (field.type === "component") {
        const nested = require(`../cms/src/components/${field.component.replace(
          ".",
          "/"
        )}.json`);
        for (const entry of field.repeatable ? item : [item])
          validate(entry, nested);
      }
      if (name === "url" && item.startsWith("/legacy/")) {
        assert.ok(
          existsSync(new URL(`../public${item}`, import.meta.url)),
          item
        );
        assert.ok(
          existsSync(
            new URL(`../cms/seed-media/${item.slice(8)}`, import.meta.url)
          ),
          item
        );
      }
    }
  }
  for (const [key, name] of Object.entries(models))
    validate(
      snapshot[key],
      require(`../cms/src/api/${name}/content-types/${name}/schema.json`)
    );
  assert.equal(snapshot.home.values.length, 4);
  assert.equal(snapshot.home.services.length, 4);
  assert.equal(snapshot.home.testimonials.length, 5);
  assert.equal(snapshot.about.faqs.length, 4);
  assert.equal(snapshot.site.socialLinks.length, 4);
});

test("SEO supports page overrides, verification, and one canonical", () => {
  const site = {
    name: "Assetar",
    seo: {
      title: "Default",
      headLinks: [{ rel: "canonical", href: "https://example.com/" }],
      metaTags: [{ name: "google-site-verification", content: "proof" }],
    },
  };
  const page = {
    seo: {
      title: "About",
      description: "Our story",
      noIndex: true,
      headLinks: [
        { rel: "canonical", href: "https://example.com/about" },
        { rel: "alternate", href: "https://example.com/fr", hreflang: "fr" },
      ],
    },
  };
  const head = buildPageHead(site, page, "/about", "https://example.com");
  assert.equal(head.title, "About");
  assert.equal(head.link.filter((item) => item.rel === "canonical").length, 1);
  assert.equal(
    head.link.find((item) => item.rel === "canonical").href,
    "https://example.com/about"
  );
  assert.ok(
    head.meta.some(
      (item) =>
        item.name === "google-site-verification" && item.content === "proof"
    )
  );
  assert.ok(
    head.meta.some(
      (item) => item.name === "robots" && item.content === "noindex, nofollow"
    )
  );
  assert.equal(
    buildPageHead({ name: "Assetar" }, {}, "/about", "https://example.com")
      .link[0].href,
    "https://example.com/about"
  );
});

test("head tags and CTA URLs reject executable and protocol-relative URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "//evil.example",
    "/\\evil.example",
    "data:text/html,test",
    "https://user:pass@example.com",
    "java\nscript:alert(1)",
  ])
    assert.equal(safeUrl(url), "");
  assert.equal(safeUrl("/about"), "/about");
  assert.equal(
    safeUrl("tel:+2348062404114", { contact: true }),
    "tel:+2348062404114"
  );
  const head = buildPageHead(
    { name: "Assetar" },
    {
      seo: {
        headLinks: [
          { rel: "stylesheet", href: "https://evil.example/a.css" },
          { rel: "canonical", href: "javascript:alert(1)" },
        ],
      },
    },
    "/",
    ""
  );
  assert.equal(head.link.length, 0);
});

test("marketing migrates each integration once and rejects injected scripts", () => {
  const head = buildMarketingHead(snapshot.site.marketing);
  assert.equal(
    head.script.filter((item) => item.key === "snapchat-init").length,
    1
  );
  assert.equal(
    head.script.filter((item) => item.key === "snapchat-pixel").length,
    1
  );
  assert.ok(!JSON.stringify(head).includes("user_email"));
  assert.equal(
    buildMarketingHead({ ...snapshot.site.marketing, enabled: false }).script
      .length,
    0
  );
  assert.equal(
    buildMarketingHead({
      enabled: true,
      googleTagId: "</script>",
      snapchatPixelId: "<script>",
      mailchimpScriptUrl: "https://chimpstatic.com.evil.example/file.js",
    }).script.length,
    0
  );
});

test("CMS requests published documents and deeply populated media", () => {
  const query = new URLSearchParams(contentQuery("home"));
  assert.equal(query.get("status"), "published");
  assert.equal(
    query.get("populate[values][populate][image][populate][file]"),
    "true"
  );
  assert.equal(query.get("populate[seo][populate][headLinks]"), "true");
  const item = publicMedia(
    { file: { url: "/uploads/logo.svg" }, url: "/legacy/logo.svg" },
    "https://cms.example.com"
  );
  assert.equal(item.file.url, "https://cms.example.com/uploads/logo.svg");
  assert.equal(item.url, "/legacy/logo.svg");
  assert.throws(() => assertContent({ site: null, home: {}, about: {} }));
  assertContent(snapshot);
});

test("migration is opt-in, restart-safe, and preserves existing unpublished edits", async () => {
  const { bootstrap } = require("../cms/src/index.js");
  const originalSeed = process.env.SEED_CONTENT;
  const originalDatabase = process.env.DATABASE_FILENAME;
  const temporaryDatabaseDirectory = mkdtempSync(
    join(tmpdir(), "assetar-seed-test-")
  );
  let writes = 0,
    uploads = 0;
  const existing = new Set();
  const strapi = {
    db: {
      query: (uid) =>
        uid === "plugin::upload.file"
          ? { findOne: async () => ({ id: 99 }) }
          : { count: async () => (existing.has(uid) ? 1 : 0) },
    },
    documents: (uid) => ({
      create: async ({ data, status }) => {
        assert.equal(status, "published");
        assert.ok(data);
        existing.add(uid);
        writes++;
      },
    }),
    plugin: () => ({
      service: () => ({
        upload: async () => {
          uploads++;
          return [{ id: 99 }];
        },
      }),
    }),
    log: { info() {} },
  };
  try {
    process.env.DATABASE_FILENAME = join(
      temporaryDatabaseDirectory,
      "data.db"
    );
    process.env.SEED_CONTENT = "false";
    await bootstrap({ strapi });
    assert.equal(writes, 0);
    process.env.SEED_CONTENT = "true";
    existing.add("api::about-page.about-page");
    await bootstrap({ strapi });
    assert.equal(writes, 2);
    await bootstrap({ strapi });
    assert.equal(writes, 2);
    assert.equal(uploads, 0);
  } finally {
    if (originalSeed === undefined) delete process.env.SEED_CONTENT;
    else process.env.SEED_CONTENT = originalSeed;
    if (originalDatabase === undefined) delete process.env.DATABASE_FILENAME;
    else process.env.DATABASE_FILENAME = originalDatabase;
    rmSync(temporaryDatabaseDirectory, { recursive: true, force: true });
  }
});

test("SQLite uses the persistent production database path", () => {
  const database = require("../cms/config/database.js");
  const result = database({
    env: (key, fallback) =>
      key === "DATABASE_FILENAME" ? "/app/data/data.db" : fallback,
  });
  assert.equal(result.connection.client, "sqlite");
  assert.equal(result.connection.connection.filename, "/app/data/data.db");
  assert.equal(result.connection.useNullAsDefault, true);
});

test("cleared page SEO fields inherit site defaults and explicit page canonical wins", () => {
  const head = buildPageHead(
    {
      name: "Assetar",
      seo: {
        title: "Default title",
        description: "Default description",
        headLinks: [{ rel: "canonical", href: "https://example.com/" }],
      },
    },
    {
      seo: {
        title: "",
        description: null,
        canonicalUrl: "https://example.com/story",
      },
    },
    "/about",
    "https://example.com"
  );
  assert.equal(head.title, "Default title");
  assert.equal(
    head.meta.find((item) => item.name === "description").content,
    "Default description"
  );
  assert.equal(
    head.link.find((item) => item.rel === "canonical").href,
    "https://example.com/story"
  );
});

test("first migration imports every distinct local image only once", async () => {
  const { bootstrap } = require("../cms/src/index.js");
  const previousSeed = process.env.SEED_CONTENT;
  const previousDatabase = process.env.DATABASE_FILENAME;
  const temporaryDatabaseDirectory = mkdtempSync(
    join(tmpdir(), "assetar-seed-test-")
  );
  const media = new Map();
  const documents = [];
  const strapi = {
    db: {
      query: (uid) =>
        uid === "plugin::upload.file"
          ? { findOne: async ({ where }) => media.get(where.name) }
          : { count: async () => 0 },
    },
    documents: () => ({ create: async ({ data }) => documents.push(data) }),
    plugin: () => ({
      service: () => ({
        upload: async ({ data, files }) => {
          assert.ok(existsSync(files.filepath));
          assert.ok(files.size > 0);
          assert.ok(files.mimetype.startsWith("image/"));
          assert.ok(!media.has(data.fileInfo.name), "Duplicate image import");
          const file = { id: media.size + 1 };
          media.set(data.fileInfo.name, file);
          return [file];
        },
      }),
    }),
    log: { info() {} },
  };
  try {
    process.env.SEED_CONTENT = "true";
    process.env.DATABASE_FILENAME = join(
      temporaryDatabaseDirectory,
      "data.db"
    );
    await bootstrap({ strapi });
    assert.equal(documents.length, 3);
    assert.equal(media.size, 9);
    assert.ok(documents[0].logo.file);
    assert.equal(
      new Set(documents[1].services.map((item) => item.image.file)).size,
      1
    );
  } finally {
    if (previousSeed === undefined) delete process.env.SEED_CONTENT;
    else process.env.SEED_CONTENT = previousSeed;
    if (previousDatabase === undefined) delete process.env.DATABASE_FILENAME;
    else process.env.DATABASE_FILENAME = previousDatabase;
    rmSync(temporaryDatabaseDirectory, { recursive: true, force: true });
  }
});
