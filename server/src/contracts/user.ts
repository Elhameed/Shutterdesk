import type { UserRole } from "./enums.js";

/**
 * The authenticated user as the API returns it.
 *
 * The server called this `PublicUser` and the client called it `User`. Note
 * `userId` rather than `id` — the field is named that way on the wire, and
 * renaming it would be a breaking change for a deployed client, so the contract
 * records what is actually sent.
 */
export type ApiUser = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  needsOnboarding: boolean;
};

/**
 * Auth responses sit outside the `{ data }` envelope the rest of the API uses.
 * That is deliberate — see the note in docs/ARCHITECTURE.md §5.
 */
export type ApiAuthResponse = {
  user: ApiUser;
  token: string;
};

export type ApiMeResponse = {
  user: ApiUser;
};
