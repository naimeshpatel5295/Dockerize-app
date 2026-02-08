import app from "./app";
import { config } from "./config";
import prisma from "./config/db";

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

function shutdown(signal: string): void {
  console.log(`\n${signal} received. Server shutting down...`);
  server.close(() => {
    prisma
      .$disconnect()
      .then(() => {
        console.log("Database connection closed.");
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      });
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
