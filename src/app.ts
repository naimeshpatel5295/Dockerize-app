import express from "express";
import routes from "./routes";
import { requestLogger } from "./middleware/logger.middleware";
import { metricsMiddleware } from "./middleware/metrics.middleware";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import { register } from "./metrics";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(metricsMiddleware);

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
