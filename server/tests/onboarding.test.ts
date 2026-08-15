import { describe, expect, it } from "vitest";
import {
  api,
  onboardPhotographer,
  registerUser,
  setRole,
  uniqueEmail,
} from "./helpers.js";

describe("Onboarding API", () => {
  it("skips photographer onboarding and creates a studio", async () => {
    const email = uniqueEmail("onboarding.skip");
    const registered = await registerUser({
      fullName: "Skip Studio Owner",
      email,
      phone: "+250 788 000 010",
    });
    const withRole = await setRole(registered.token, "photographer");

    const response = await api()
      .post("/api/photographer/onboarding/skip")
      .set("Authorization", `Bearer ${withRole.token}`)
      .send({ businessName: "Skip Test Studio" })
      .expect(200);

    expect(response.body.data.studio.id).toBeTruthy();
    expect(response.body.data.studio.slug).toContain("skip-test-studio");
  });

  it("completes photographer onboarding", async () => {
    const email = uniqueEmail("onboarding.complete");
    const registered = await registerUser({
      fullName: "Complete Studio Owner",
      email,
      phone: "+250 788 000 011",
    });
    const withRole = await setRole(registered.token, "photographer");

    const studio = await onboardPhotographer(withRole.token, "Complete Test Studio");
    expect(studio.studio.slug).toContain("complete-test-studio");
  });
});

describe("Auth logout revocation", () => {
  it("invalidates token after logout", async () => {
    const email = uniqueEmail("auth.logout");
    const registered = await registerUser({
      fullName: "Logout User",
      email,
      phone: "+250 788 000 012",
    });

    await api()
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${registered.token}`)
      .expect(200);

    await api()
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registered.token}`)
      .expect(401);
  });
});
