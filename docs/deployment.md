# Contabo + Coolify deployment

The repository is `https://github.com/Assetar-org/Assetar.git`. Use a Git-based Docker Compose application, with base directory `/` and compose location `/compose.yaml`. The checked-out branch is currently `master`; select the branch containing this migration after it has been committed and pushed.

## Services and persistent storage

| Service | Internal port | Persistent paths |
| --- | --- | --- |
| `web` — Nuxt Node server | 3000 | None |
| `cms` — Strapi + SQLite | 1337 | `/app/data` (`cms_data`), `/app/public/uploads` (`cms_uploads`) |

SQLite is at `/app/data/data.db`. Run **one CMS replica**, with deployments that stop the old CMS before starting the new one; do not use overlapping rolling replicas against the same SQLite file. Nuxt can restart independently. Docker volume ownership is prepared for the unprivileged `node` user. If replacing named volumes with bind mounts, make both directories writable by UID/GID 1000 first.

Neither service publishes a host port in the production compose file. Coolify's proxy terminates HTTPS and routes to the internal ports. Use `compose.local.yaml` only for a local smoke test.

## First deployment

1. Point the website and CMS subdomains at your Contabo server. For example, use the real website domain and `cms.<your-domain>`; no production domain is assumed in code.
2. Connect the new GitHub organization repository to Coolify. Configure the Docker Compose build pack with the paths above. Confirm Coolify has repository access.
3. Generate secrets locally with `node scripts/generate-env.mjs` if `.env` does not already exist. Copy each secret into Coolify's environment settings; never commit `.env`. Preserve these secrets across deployments.
4. Set `SITE_PUBLIC_URL=https://<website-domain>` and `CMS_PUBLIC_URL=https://<cms-domain>`. `CMS_PUBLIC_URL` is used at build time and runtime; rebuild the CMS if it changes.
5. Set `APP_KEYS` (two comma-separated random keys), `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, and `JWT_SECRET`. Content seeding is enabled by default for a database's first startup and records completion in the persistent `/app/data` volume. Set `SEED_CONTENT=false` to postpone or disable the initial migration. Leave `NUXT_STRAPI_TOKEN` empty until the first admin account exists.
6. In Coolify assign the website HTTPS domain to `web`, target port **3000**, and the CMS HTTPS domain to `cms`, target port **1337**. Deploy. Confirm the CMS logs show `Initial content migration completed` and the three migrated pages. The website health endpoint is live, but pages intentionally return 503 until the API token is configured.
7. Open `https://<cms-domain>/admin` and create the initial administrator. In Settings → API Tokens, create a **Custom** token with `find` access for the three single types and Upload `find`/`findOne` for populated media. No create/update/delete privileges are needed. Do not enable anonymous content API access through the Public role.
8. Set `NUXT_STRAPI_TOKEN` in Coolify to that token and redeploy the web service. The token is sent from the Nuxt server to Strapi over the internal Compose network; it is never included in public Nuxt runtime config. The persistent seed marker prevents later CMS restarts from importing the starter content again.
9. Invite content editors through Strapi's Administration Panel users/roles. Give editors access to the relevant single types and Media Library. Reserve publishing and Site Setting marketing edits for the appropriate team members. Configure an email provider if you need reliable invitation/password-reset delivery.
10. Verify `/`, a direct `/about` request, mobile navigation, WhatsApp/contact links, and page source metadata. Save a draft and confirm it does not change the public site; publish and reload to confirm it does. Restart the CMS and confirm edits and images survive.

The frontend intentionally does not cache CMS responses, so publication changes appear on the next full page load. An already open browser retains its content snapshot until reloaded. If a required single type is unpublished or the CMS is unavailable, requests return 503; old source content is never silently substituted. Use `NUXT_CONTENT_SOURCE=snapshot` only for an explicit local frontend preview (production compose always sets `cms`).

`/api/health` verifies that Nuxt is running; `/api/content` also verifies the CMS connection and required published content. Strapi's `/_health` is used for its container health check.

## Backups and recovery

Back up **both** named volumes and keep an encrypted copy off the Contabo VPS. Persisting a volume protects against redeployments, not disk loss. Also retain the deployed commit and Strapi secrets separately.

For the simplest consistent backup, use a maintenance window: stop `cms` through Coolify, copy/archive the entire `cms_data` and `cms_uploads` volumes, then start `cms` again. Stopping Strapi closes SQLite cleanly and keeps database/media references aligned. Do not copy only a live `.db` file while writes are occurring; journal/WAL files may also be needed. Coolify prefixes volume names, so use the actual names shown for your deployment.

Restore into a stopped CMS running the compatible code version, restore both volumes, ensure UID/GID 1000 ownership, restore the original secrets, then start the CMS and check content, login, and media. Test a restore before relying on the backup. Never run `docker compose down -v` on a deployment you intend to retain.

## Local container smoke test

Generate `.env`, fill the secrets and URLs, and set `SEED_CONTENT=true`, then:

```sh
docker compose -f compose.yaml -f compose.local.yaml up --build -d
```

Create the admin and API token at `http://localhost:1337/admin`, add the token to `.env`, set `SEED_CONTENT=false`, and recreate `web` to apply the token:

```sh
docker compose -f compose.yaml -f compose.local.yaml up -d
```

## References

- [Nuxt Node deployment](https://nuxt.com/docs/4.x/getting-started/deployment)
- [Strapi SQLite configuration](https://docs.strapi.io/cms/configurations/database)
- [Strapi Docker deployment](https://docs.strapi.io/cms/installation/docker)
- [Coolify Docker Compose applications](https://coolify.io/docs/applications/builds/docker-compose)

## Dependency installation

Run `npm install` at the repository root and `npm --prefix cms install` on a machine with npm registry access, then commit the resulting lockfiles. Network restrictions in the migration workspace prevented completing those installs. The Dockerfiles currently use `npm ci` when a lockfile exists and `npm install` otherwise; commit both lockfiles before relying on repeatable production builds. The CMS image compiles native SQLite dependencies in its Linux build stage, so local macOS `node_modules` must never be copied into it.
