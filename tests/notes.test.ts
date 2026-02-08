import request from "supertest";
import app from "../src/app";

const mockNote = {
  id: "test-uuid-1234",
  title: "Test Note",
  content: "Test content",
  isFavorite: false,
  createdAt: new Date().toISOString(),
  tags: [],
};

const mockNoteToggled = { ...mockNote, isFavorite: true };

jest.mock("../src/config/db", () => {
  const note = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return {
    __esModule: true,
    default: { note, $queryRaw: jest.fn(), $disconnect: jest.fn() },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prismaMock = require("../src/config/db").default;

describe("Notes CRUD", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.note.create.mockResolvedValue(mockNote);
    prismaMock.note.findMany.mockResolvedValue([mockNote]);
    prismaMock.note.findUnique.mockResolvedValue(mockNote);
    prismaMock.note.update.mockResolvedValue(mockNoteToggled);
    prismaMock.note.delete.mockResolvedValue(mockNote);
  });

  // 1) Create note
  describe("POST /notes", () => {
    it("should create a note and return 201", async () => {
      const res = await request(app)
        .post("/notes")
        .send({ title: "Test Note", content: "Test content" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("Test Note");
      expect(prismaMock.note.create).toHaveBeenCalledTimes(1);
    });

    it("should return 400 if title is missing", async () => {
      const res = await request(app)
        .post("/notes")
        .send({ content: "No title" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should return 400 if content is missing", async () => {
      const res = await request(app)
        .post("/notes")
        .send({ title: "No content" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  // 2) Get notes
  describe("GET /notes", () => {
    it("should return all notes with 200", async () => {
      const res = await request(app).get("/notes");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(prismaMock.note.findMany).toHaveBeenCalledTimes(1);
    });
  });

  // 3) Toggle favorite
  describe("PATCH /notes/:id/favorite", () => {
    it("should toggle favorite and return 200", async () => {
      const res = await request(app).patch(`/notes/${mockNote.id}/favorite`);

      expect(res.status).toBe(200);
      expect(res.body.isFavorite).toBe(true);
      expect(prismaMock.note.update).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if note not found", async () => {
      prismaMock.note.findUnique.mockResolvedValueOnce(null);

      const res = await request(app).patch("/notes/nonexistent/favorite");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Note not found");
    });
  });

  // 4) Delete note
  describe("DELETE /notes/:id", () => {
    it("should delete and return 204", async () => {
      const res = await request(app).delete(`/notes/${mockNote.id}`);

      expect(res.status).toBe(204);
      expect(prismaMock.note.delete).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if note not found", async () => {
      prismaMock.note.findUnique.mockResolvedValueOnce(null);

      const res = await request(app).delete("/notes/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Note not found");
    });
  });
});
