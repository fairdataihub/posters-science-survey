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

  if (unevaluated.length === 0) {
    return { poster: null, evaluationCount: evaluatedIds.length };
  }

  // Priority: pick from under-threshold first (fewest evaluations), then random
  const underThreshold = unevaluated
    .filter((p) => p._count.evaluation < EVALUATION_THRESHOLD)
    .sort((a, b) => a._count.evaluation - b._count.evaluation);

  const pool = underThreshold.length > 0 ? underThreshold : unevaluated;
  const selected = pool[Math.floor(Math.random() * pool.length)]!;
  const { _count, ...poster } = selected;

  return { poster, evaluationCount: evaluatedIds.length };
});
