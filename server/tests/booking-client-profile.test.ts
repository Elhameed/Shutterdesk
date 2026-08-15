import { describe, expect, it } from "vitest";
import {
  normalizeBookingInstagram,
  resolveBookingClientProfile,
} from "../src/lib/booking-client-profile.js";

describe("booking client profile resolution", () => {
  it("strips known placeholder Instagram handles", () => {
    expect(normalizeBookingInstagram("instagram.com/immaculee.niyonsaba")).toBe("");
    expect(normalizeBookingInstagram("instagram.com/imaniuwase")).toBe("");
    expect(normalizeBookingInstagram("instagram.com/teniola.mukamana")).toBe(
      "instagram.com/teniola.mukamana",
    );
  });

  it("prefers linked user profile over stored booking meta", () => {
    const profile = resolveBookingClientProfile({
      clientName: "Stored Name",
      clientEmail: "stored@example.com",
      clientMeta: {
        phone: "+250 788 000 000",
        instagram: "instagram.com/immaculee.niyonsaba",
        preferredSince: 2023,
      },
      linkedUser: {
        fullName: "Teniola Mukamana",
        email: "teniola@example.com",
        phone: "+250 788 555 123",
        avatarUrl: null,
        createdAt: new Date("2025-03-01T10:00:00Z"),
      },
    });

    expect(profile).toMatchObject({
      name: "Teniola Mukamana",
      email: "teniola@example.com",
      phone: "+250 788 555 123",
      instagram: "",
      preferredSince: 2025,
    });
  });

  it("returns empty phone and null preferredSince when no live data exists", () => {
    const profile = resolveBookingClientProfile({
      clientName: "Booking Name",
      clientEmail: "booking@example.com",
      clientMeta: {},
    });

    expect(profile).toMatchObject({
      name: "Booking Name",
      email: "booking@example.com",
      phone: "",
      instagram: "",
      preferredSince: null,
    });
  });
});
