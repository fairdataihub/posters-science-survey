export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const { user } = session;

  // Load user with current posterOrder
  let dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
  });

  // If no order yet, generate a randomized one and persist it
  if (dbUser.posterOrder.length === 0) {
    const allPosters = await prisma.poster.findMany({ select: { id: true } });
    const shuffled = allPosters
      .map((p) => p.id)
      .sort(() => Math.random() - 0.5);

    dbUser = await prisma.user.update({
      where: { id: user.id },
      data: { posterOrder: shuffled },
    });
  }

  // Fetch posters in the user's order
  const posterMap = await prisma.poster
    .findMany({
      where: { id: { in: dbUser.posterOrder } },
    })
    .then((rows) => new Map(rows.map((p) => [p.id, p])));

  const posters = dbUser.posterOrder
    .map((id) => posterMap.get(id))
    .filter(Boolean);

  // Fetch existing evaluations keyed by posterId
  const evalRows = await prisma.evaluation.findMany({
    where: { userId: user.id },
  });
  const evaluations = Object.fromEntries(evalRows.map((e) => [e.posterId, e]));

  return { posters, evaluations };
});
