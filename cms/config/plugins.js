module.exports = ({ env }) => ({
  "users-permissions": { config: { jwtSecret: env("JWT_SECRET") } },
  upload: { config: { sizeLimit: 10 * 1024 * 1024 } },
});
