import { describe, expect, it } from "vitest";
import {
  addCrmClient,
  api,
  onboardPhotographer,
  registerUser,
  setRole,
  testBookingDate,
  uniqueEmail,
} from "./helpers.js";

/**
 * Booking references used to be allocated by loading every row in `bookings`
 * and taking the highest numeric suffix. Besides scanning the whole table on
 * every create, two concurrent creates read the same max and produced the same
 * reference. They are now drawn from a Postgres sequence.
 */
describe("booking references", () => {
  it("issues a distinct reference to each of two concurrent bookings", async () => {
    const photographerEmail = uniqueEmail("photo.reference");

    const photographer = await registerUser({
      fullName: "Reference Photographer",
      email: photographerEmail,
      phone: "+250 788 400 001",
    });
    const session = await setRole(photographer.token, "photographer");
    await onboardPhotographer(session.token, "Reference Test Studio");

    const [first, second] = await Promise.all(
      ["one", "two"].map(async (label, index) => {
        const clientEmail = uniqueEmail(`client.reference.${label}`);
        const crmClient = await addCrmClient(session.token, {
          name: `Reference Client ${label}`,
          email: clientEmail,
        });

        // Different days so slot availability can't reject either booking.
        const slot = testBookingDate(14 + index * 7, "10:00 AM");

        return api()
          .post("/api/photographer/bookings")
          .set("Authorization", `Bearer ${session.token}`)
          .send({
            clientId: crmClient.id,
            clientName: `Reference Client ${label}`,
            email: clientEmail,
            packageName: "Reference Test Package",
            packageDetail: "Concurrent create",
            date: slot.date,
            time: slot.time,
            packagePrice: 100_000,
          })
          .expect(201);
      }),
    );

    expect(first.body.data.id).not.toBe(second.body.data.id);

    const references = await Promise.all(
      [first, second].map(async (response) => {
        const detail = await api()
          .get(`/api/photographer/bookings/${response.body.data.id}/detail`)
          .set("Authorization", `Bearer ${session.token}`)
          .expect(200);
        return detail.body.data.reference as string;
      }),
    );

    expect(references[0]).toMatch(/^BK-\d+$/);
    expect(references[0]).not.toBe(references[1]);
  });
});
