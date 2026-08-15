import { loadEnv } from "./config/env.js";
import { createApp } from "./app.js";
import { initMonitoring } from "./lib/monitoring.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const env = loadEnv();
initMonitoring(env);
const app = createApp(env);

const server = app.listen(env.PORT, () => {
  logger.info("server_started", {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    healthCheck: `http://localhost:${env.PORT}/api/health`,
  });
});

async function shutdown(signal: string) {
  console.log(`[server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
