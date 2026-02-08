import express from "express";
import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
