FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
ARG PUBLIC_URL=http://localhost:1337
ENV PUBLIC_URL=$PUBLIC_URL NODE_ENV=production STRAPI_TELEMETRY_DISABLED=true
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=1337 STRAPI_TELEMETRY_DISABLED=true
WORKDIR /app
COPY --from=build --chown=node:node /app /app
# Strapi writes user migrations at startup; keep that directory and persistent data writable.
RUN mkdir -p /app/database/migrations /app/public/uploads /app/data \
    && chown -R node:node /app/database /app/public/uploads /app/data
USER node
EXPOSE 1337
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s CMD node -e "fetch('http://127.0.0.1:1337/_health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "start"]
