// auth.d.ts
declare module "#auth-utils" {
  interface User {
    id: string;
  }

  interface UserSession {
    userSessionField: string;
  }

  interface SecureSessionData {
    secureSessionField: string;
  }
}

export {};
