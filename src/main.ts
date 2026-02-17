import "./config/env.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();

// Bind to 0.0.0.0 so Azure/containers can reach the app. Avoids EADDRINUSE quirks when PORT is shared.
const host = process.env.HOST ?? "0.0.0.0";
const server = app.listen(env.PORT, host, () => {
  logger.info({ port: env.PORT, host, env: env.NODE_ENV }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Server error");
  process.exit(1);
});
