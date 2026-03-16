import { z } from "zod";

const bodySchema = z.object({
  posterId: z.string(),
  isPoster: z.boolean(),
  confidence: z.number().int().min(1).max(5),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const { user } = session;

  const body = await readValidatedBody(event, bodySchema.parse);

  const evaluation = await prisma.evaluation.upsert({
    where: {
      userId_posterId: {
        userId: user.id,
        posterId: body.posterId,
      },
    },
    create: {
      userId: user.id,
      posterId: body.posterId,
      isPoster: body.isPoster,
      confidence: body.confidence,
    },
    update: {
      isPoster: body.isPoster,
      confidence: body.confidence,
    },
  });

  return evaluation;
});
