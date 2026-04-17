export default defineEventHandler(async (event) => {
  await clearUserSession(event);
  deleteCookie(event, "userId");
  return { success: true };
});
