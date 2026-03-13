export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if ("user" in session && session.user) {
    return sendRedirect(event, `/login`);
  }

  const user = await prisma.user.create({ data: {} });

  return { id: user.id };
});
