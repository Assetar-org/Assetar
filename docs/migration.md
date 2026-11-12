# Migration notes

The Vue 3/Vite application has moved to Nuxt 4's `app/` structure, with server-rendered `/` and `/about` pages. Standalone router/bootstrap, unused Pinia store, obsolete Vite/Netlify/Gatsby setup, and unreferenced old components were removed. Historical sources remain in Git.

Existing page and component styles, assets, routes, and active page content were retained. Navigation now uses real links, the mobile toggle has an accessible label/state, and each page has a primary heading. Shared page styles are loaded globally so a direct `/about` request renders correctly without visiting the home page first.

`shared/content.json` is the migrated frontend preview snapshot; `cms/seed/content.json` is the matching one-time import source. Four values, four services, five active customer reviews, four FAQs, contacts/social links, and the two page calls to action are included. Commented-out content and unused components were not imported. Existing copy is preserved, including spelling and historical wording; the team can revise it in the CMS.

The CMS uses structured reusable components and three draft/publish single types. With `SEED_CONTENT=true`, bootstrap imports local content images and creates/publishes only missing documents. It skips any type with existing documents, including drafts. Turn the seed flag off after successful migration. Remote platform images remain external references. Existing design textures, decorative quotation/star icons, and fonts remain bundled assets.

The Nuxt `/api/content` endpoint authenticates to Strapi server-side, requests only published documents, explicitly populates nested components/media, and converts upload paths to the configured public CMS origin. In CMS mode, failures return 503 instead of exposing draft content or silently resurrecting the seed snapshot. API tokens never enter public runtime config.

Head metadata uses Nuxt `useHead`, with page-specific SEO, social previews, canonical links, verification meta tags, and structured marketing links. The old hardcoded hostname and non-existent search-action structured data were removed. Google Ads, Snapchat, and Mailchimp configuration was migrated; duplicate Snapchat initialization and hardcoded user email were removed.

Production consists of two containers: Nuxt and Strapi with SQLite. Persistent named volumes hold the SQLite directory and uploads. See deployment documentation for first-run setup, backup, and restore.

## Validation

`npm test` checks schema/seed parity, local media presence, head-tag and URL validation, published-content query construction, media URL normalization, non-destructive migration behavior, and SQLite's persistent path. Production builds and runtime verification are recorded in the task handoff; unit tests alone do not prove CMS startup or container deployment.

### Checks performed in the migration workspace

- Nine Node tests passed; all eleven page/component SFCs compiled; JavaScript syntax and Compose structure checks passed.
- An isolated smoke build completed with locally available Nuxt 4.6.2 / Vue 3.5.44. Its older local Sass compiler needed a temporary compatibility adapter, used only outside the repository. This is **not** verification of the declared Nuxt 4.6.4 / Vue 3.5.45 dependency installation.
- In-process rendering of `/` and `/about` returned 200 with the migrated copy, canonical metadata, one primary heading, and one Snapchat loader. The health route also passed. Mocked CMS requests verified authentication, published-only queries, public upload URLs, no-store responses, and a sanitized 503 on upstream failure.
- Registry access and Docker access were unavailable; the preview server could not bind a port. Exact-dependency builds, actual Strapi/SQLite startup and import, browser interaction checks, and deployment remain to be run in an unrestricted environment. No production CMS has been populated or deployed by this session.
