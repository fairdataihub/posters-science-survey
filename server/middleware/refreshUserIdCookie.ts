const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export default defineEventHandler((event) => {
  const userId = getCookie(event, "userId");

  if (userId) {
    setCookie(event, "userId", userId, { maxAge: MAX_AGE, path: "/" });
  }
});
