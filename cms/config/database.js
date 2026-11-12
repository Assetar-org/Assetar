const path = require("node:path");
module.exports = ({ env }) => ({
  connection: {
    client: "sqlite",
    connection: {
      filename: path.resolve(
        __dirname,
        "..",
        env("DATABASE_FILENAME", ".tmp/data.db")
      ),
    },
    useNullAsDefault: true,
  },
});
