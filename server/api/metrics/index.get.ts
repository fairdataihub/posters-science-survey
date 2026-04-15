const TOTAL_POSTERS = 350;
const COMPLETION_THRESHOLD = 70;

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  // --- Poster coverage ---
  const posterEvalCounts = await prisma.poster.findMany({
    select: { _count: { select: { evaluation: true } } },
  });

  const postersWithZero = posterEvalCounts.filter(
    (p) => p._count.evaluation === 0,
  ).length;
  const postersWithAtLeast1 = posterEvalCounts.filter(
    (p) => p._count.evaluation >= 1,
  ).length;
  const postersWithAtLeast2 = posterEvalCounts.filter(
    (p) => p._count.evaluation >= 2,
  ).length;
  const postersWithAtLeast3 = posterEvalCounts.filter(
    (p) => p._count.evaluation >= 3,
  ).length;

  // --- User stats ---
  const userEvalCounts = await prisma.user.findMany({
    select: { _count: { select: { evaluation: true } } },
  });

  const totalUsers = userEvalCounts.length;
  const usersWithThreshold = userEvalCounts.filter(
    (u) => u._count.evaluation >= COMPLETION_THRESHOLD,
  ).length;
  const usersCompleted = userEvalCounts.filter(
    (u) => u._count.evaluation >= TOTAL_POSTERS,
  ).length;

  return {
    totalPosters: TOTAL_POSTERS,
    posters: {
      withZero: postersWithZero,
      withAtLeast1: postersWithAtLeast1,
      withAtLeast2: postersWithAtLeast2,
      withAtLeast3: postersWithAtLeast3,
    },
    users: {
      total: totalUsers,
      completionThreshold: COMPLETION_THRESHOLD,
      withThreshold: usersWithThreshold,
      completed: usersCompleted,
    },
  };
});
