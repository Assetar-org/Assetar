import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const target = process.argv[2] || ".env";
if (![".env", "cms/.env"].includes(target))
  throw new Error("Use .env or cms/.env");
if (existsSync(target))
  throw new Error(`${target} exists; refusing to overwrite secrets`);
let text = readFileSync(`${target}.example`, "utf8");
for (const key of [
  "ADMIN_JWT_SECRET",
  "API_TOKEN_SALT",
  "TRANSFER_TOKEN_SALT",
  "ENCRYPTION_KEY",
  "JWT_SECRET",
]) {
  text = text.replace(
    new RegExp(`^${key}=$`, "m"),
    `${key}=${randomBytes(32).toString("hex")}`
  );
}
text = text.replace(
  /^APP_KEYS=$/m,
  `APP_KEYS=${randomBytes(32).toString("hex")},${randomBytes(32).toString(
    "hex"
  )}`
);
writeFileSync(target, text, { mode: 0o600, flag: "wx" });
console.log(`Created ${target}. Set domains and API token before deployment.`);
