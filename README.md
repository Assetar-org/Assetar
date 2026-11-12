# Assetar

Nuxt 4 website and Strapi 5 CMS for [Assetar](https://github.com/Assetar-org/Assetar), deployed together on Contabo using Coolify. Strapi uses SQLite; the database and uploaded images live in separate persistent Docker volumes.

The existing `/` and `/about` pages keep their design. Their copy, calls to action, navigation, contacts, social links, values, services, platform images, reviews, FAQs, SEO metadata, and marketing head links are editable in Strapi. The original Google Ads, Snapchat, and Mailchimp integrations are configurable there too.

## Local setup

Use Node **22.22.3+** or **24.15+** (within those major versions).

```sh
npm install
node scripts/generate-env.mjs
npm run dev
```

This previews the migrated snapshot without requiring Strapi. To edit and publish through the CMS:

```sh
npm --prefix cms install
node scripts/generate-env.mjs cms/.env
```

Set `SEED_CONTENT=true` in `cms/.env` for the first run, then:

```sh
npm run cms:dev
```

Visit `http://localhost:1337/admin`, create the first administrator, and create a **Custom API token** granting only `find` for Home Page, About Page, and Site Setting, plus Upload's `find` and `findOne` for populated images. Keep Public role permissions disabled. Copy the token into root `.env` as `NUXT_STRAPI_TOKEN`, change `NUXT_CONTENT_SOURCE=cms`, and restart Nuxt. Set `SEED_CONTENT=false` after migration. Keep the root and CMS env files private.

The import creates and publishes only missing single types; it never overwrites existing drafts or published edits. Existing local images are imported into the Media Library. Third-party platform logos retain their current external URLs and can be replaced with uploaded images.

```sh
npm test
npm run build
npm run cms:build
```

See [Coolify deployment and backups](docs/deployment.md), [editing content and marketing](docs/content-editing.md), and [migration details and validation](docs/migration.md).
