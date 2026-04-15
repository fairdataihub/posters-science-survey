export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const { user } = session;

  // Get poster IDs already evaluated by this user
  const evaluated = await prisma.evaluation.findMany({
    where: { userId: user.id },
    select: { posterId: true },
  });
  const evaluatedIds = evaluated.map((e) => e.posterId);

  // Fetch all posters not yet evaluated by this user
  const unevaluated = await prisma.poster.findMany({
    where: evaluatedIds.length > 0 ? { id: { notIn: evaluatedIds } } : {},
  });

  // Shuffle for variety each session
  const posters = unevaluated.sort(() => Math.random() - 0.5);

  return { posters, evaluationCount: evaluatedIds.length };
});
