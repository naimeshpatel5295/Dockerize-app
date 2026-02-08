import prisma from "../config/db";

export const createNote = (title: string, content: string) => {
  return prisma.note.create({
    data: { title, content },
  });
};

export const getAllNotes = () => {
  return prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getNoteById = (id: string) => {
  return prisma.note.findUnique({
    where: { id },
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
  });
};
