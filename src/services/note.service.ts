import prisma from "../config/db";

const includeTags = { tags: true } as const;

export const createNote = (title: string, content: string) => {
  return prisma.note.create({
    data: { title, content },
    include: includeTags,
  });
};

export const getAllNotes = (tag?: string, search?: string) => {
  return prisma.note.findMany({
    where: {
      ...(tag ? { tags: { some: { name: tag } } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { content: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: includeTags,
    orderBy: { createdAt: "desc" },
  });
};

export const getNoteById = (id: string) => {
  return prisma.note.findUnique({
    where: { id },
    include: includeTags,
  });
};

export const deleteNote = (id: string) => {
  return prisma.note.delete({
    where: { id },
  });
};

export const toggleFavorite = async (id: string) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return null;

  return prisma.note.update({
    where: { id },
    data: { isFavorite: !note.isFavorite },
    include: includeTags,
  });
};

export const addTagToNote = async (noteId: string, tagName: string) => {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) return null;

  const normalizedName = tagName.toLowerCase().trim();

  return prisma.note.update({
    where: { id: noteId },
    data: {
      tags: {
        connectOrCreate: {
          where: { name: normalizedName },
          create: { name: normalizedName },
        },
      },
    },
    include: includeTags,
  });
};
