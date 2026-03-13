import { z } from "zod";

const loginSchema = z.object({ id: z.string() });

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const cookieId = getCookie(event, "userId");

  // If a session already exists, refresh the cookie and return
  if ("user" in session && session.user) {
    return { id: (session.user as { id: string }).id };
  }

  const body = await readValidatedBody(event, (b) => loginSchema.safeParse(b));

  if (!body.success) {
    // Fall back to userId cookie if no body provided

    if (!cookieId) {
      throw createError({
        statusCode: 401,
        statusMessage: "No user ID found. Please generate one first.",
      });
    }
  }

  const userId = body.success ? body.data.id : cookieId;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found for the provided ID.",
    });
  }

  await setUserSession(event, {
    loggedInAt: new Date(),
    user: { id: user.id },
    userSessionField: "",
  });

  return { id: user.id };
});
