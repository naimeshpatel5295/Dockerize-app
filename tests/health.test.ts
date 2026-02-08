import request from "supertest";
import app from "../src/app";

jest.mock("../src/config/db", () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
    $disconnect: jest.fn(),
  },
}));

describe("GET /health", () => {
  it("should return 200 with status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("db", "connected");
  });
});
