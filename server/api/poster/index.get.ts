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

  // Get poster IDs already evaluated by this user
  const evaluated = await prisma.evaluation.findMany({
    where: { userId: user.id },
    select: { posterId: true },
  });
  const evaluatedIds = new Set(evaluated.map((e) => e.posterId));

  // Fetch posters in the user's order, excluding already-scored ones
  const remainingIds = dbUser.posterOrder.filter((id) => !evaluatedIds.has(id));

  const posterMap = await prisma.poster
    .findMany({
      where: { id: { in: remainingIds } },
    })
    .then((rows) => new Map(rows.map((p) => [p.id, p])));

  const posters = remainingIds
    .map((id) => posterMap.get(id))
    .filter(Boolean);

  return { posters, evaluationCount: evaluatedIds.size };
});
