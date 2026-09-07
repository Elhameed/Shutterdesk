/**
 * The browser-persisted session: the JWT, the role it was issued for, and
 * whether the user asked to be remembered.
 *
 * These keys and the clear-session logic were written out twice — once as
 * constants in AuthProvider and once as string literals in the axios response
 * interceptor, which also clears the session on a 401. Two copies of "what
 * counts as the session" is one rename away from a token that never gets
 * cleared.
 */

const TOKEN_KEY = "shutterdesk_token";
const ROLE_KEY = "shutterdesk_role";
const REMEMBER_KEY = "shutterdesk_remember";

export function readSessionToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function persistSession(
  token: string,
  role: string,
  rememberMe = false,
): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);

  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function persistSessionRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}
