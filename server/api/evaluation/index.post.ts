import { z } from "zod";

const bodySchema = z.object({
  posterId: z.string(),
  userChoice: z.enum(["poster", "non-poster", "unsure"]),
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
      userChoice: body.userChoice,
    },
    update: {
      userChoice: body.userChoice,
    },
  });

  if (!evaluation) {
    throw createError({
      statusCode: 500,
      message: "Failed to save evaluation",
    });
  }

  return evaluation;
});
