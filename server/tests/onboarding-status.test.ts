import { describe, expect, it } from "vitest";
import { resolveNeedsOnboarding } from "../src/lib/onboarding-status.js";
import type { User } from "@prisma/client";

function buildClientUser(
  overrides: Partial<User> & { clientSettings?: User["clientSettings"] } = {},
): User {
  return {
    id: "user-1",
    email: "client@shutterdesk.rw",
    fullName: "Aline Uwase",
    phone: "+250 788 123 456",
    passwordHash: "hash",
    role: "client",
    avatarUrl: null,
    clientSettings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("resolveNeedsOnboarding", () => {
  it("returns false when client onboarding was skipped", async () => {
    const user = buildClientUser({
      clientSettings: { skipped: true },
    });

    await expect(resolveNeedsOnboarding(user)).resolves.toBe(false);
  });

  it("returns true when client profile details are incomplete", async () => {
    const user = buildClientUser({
      clientSettings: { address: "", interests: [] },
    });

    await expect(resolveNeedsOnboarding(user)).resolves.toBe(true);
  });
});
