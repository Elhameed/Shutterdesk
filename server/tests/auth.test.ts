import { describe, expect, it } from "vitest";
import {
  api,
  registerUser,
  setRole,
  TEST_PASSWORD,
  uniqueEmail,
} from "./helpers.js";

describe("Auth API", () => {
  it("returns health check with database connected", async () => {
    const response = await api().get("/api/health").expect(200);

    expect(response.body.status).toBe("ok");
    expect(response.body.database).toBe("connected");
  });

  it("registers, sets role, and returns current user", async () => {
    const email = uniqueEmail("auth.user");

    const registered = await registerUser({
      fullName: "Test User",
      email,
      phone: "+250 788 000 001",
    });

    expect(registered.token.length).toBeGreaterThan(10);
    expect(registered.user.email).toBe(email);

    const withRole = await setRole(registered.token, "client");

    const me = await api()
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${withRole.token}`)
      .expect(200);

    expect(me.body.user.email).toBe(email);
    expect(me.body.user.role).toBe("client");
  });

  it("logs in with valid credentials", async () => {
    const email = uniqueEmail("auth.login");

    await registerUser({
      fullName: "Login User",
      email,
      phone: "+250 788 000 002",
    });

    const login = await api()
      .post("/api/auth/login")
      .send({ email, password: TEST_PASSWORD })
      .expect(200);

    expect(login.body.token.length).toBeGreaterThan(10);
    expect(login.body.user.email).toBe(email);
  });

  it("rejects invalid login credentials", async () => {
    await api()
      .post("/api/auth/login")
      .send({ email: "missing@shutterdesk.test", password: "wrong-password" })
      .expect(401);
  });
});
