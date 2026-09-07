import { describe, expect, it } from "vitest";
import { authed, setUpStudio } from "./helpers.js";

/**
 * Route handlers return per-field validation errors alongside the generic
 * "Validation failed" message. The client picks the field message to show, so
 * these assert the field name and a human-readable message are actually there
 * — without them the UI can only say something went wrong.
 */
describe("validation error bodies", () => {
  it("names the offending field on a bad client payload", async () => {
    const studio = await setUpStudio("validation");

    const response = await authed(studio.token)
      .post("/api/photographer/clients")
      .send({
        name: "Bad Email Client",
        email: "not-an-email",
        phone: "+250 788 000 000",
        category: "wedding",
      })
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "email",
          message: expect.stringContaining("valid email"),
        }),
      ]),
    );
  });

  it("names every missing required field", async () => {
    const studio = await setUpStudio("validation.missing");

    const response = await authed(studio.token)
      .post("/api/photographer/clients")
      .send({ category: "wedding" })
      .expect(400);

    const fields = (response.body.errors as Array<{ field: string }>).map(
      (item) => item.field,
    );
    expect(fields).toEqual(expect.arrayContaining(["name", "email", "phone"]));
  });
});
