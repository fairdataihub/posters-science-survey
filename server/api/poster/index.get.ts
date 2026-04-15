const EVALUATION_THRESHOLD = 3;

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const { user } = session;

  // Get poster IDs already evaluated by this user
  const evaluated = await prisma.evaluation.findMany({
    where: { userId: user.id },
    select: { posterId: true },
  });
  const evaluatedIds = evaluated.map((e) => e.posterId);

  // Fetch all posters not yet evaluated by this user, with their global evaluation count
  const unevaluated = await prisma.poster.findMany({
    where: evaluatedIds.length > 0 ? { id: { notIn: evaluatedIds } } : {},
    include: { _count: { select: { evaluation: true } } },
  });

  // Priority: posters under the threshold first (fewest evaluations first),
  // then the rest in random order
  const underThreshold = unevaluated
    .filter((p) => p._count.evaluation < EVALUATION_THRESHOLD)
    .sort((a, b) => a._count.evaluation - b._count.evaluation);

  const aboveThreshold = unevaluated
    .filter((p) => p._count.evaluation >= EVALUATION_THRESHOLD)
    .sort(() => Math.random() - 0.5);

  const posters = [...underThreshold, ...aboveThreshold].map(
    ({ _count, ...p }) => p,
  );

  return { posters, evaluationCount: evaluatedIds.length };
});
