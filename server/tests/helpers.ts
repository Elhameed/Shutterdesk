import request from "supertest";
import type { Test } from "supertest";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import { prisma } from "../src/lib/prisma.js";

export const testEnv = loadEnv();
export const app = createApp(testEnv);

export const TEST_PASSWORD = "TestPass123!";

export function uniqueEmail(localPart: string) {
  return `${localPart}.${Date.now()}@shutterdesk.test`;
}

/** Bookable date within the default 60-day studio horizon (weekday). */
export function testBookingDate(daysAhead = 21, time = "11:00 AM") {
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + Math.min(Math.max(daysAhead, 2), 55));

  while (target.getDay() === 0 || target.getDay() === 6) {
    target.setDate(target.getDate() + 1);
  }

  return {
    date: target.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time,
  };
}

export function api(): Test {
  return request(app);
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}) {
  const response = await api()
    .post("/api/auth/register")
    .send({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      password: input.password ?? TEST_PASSWORD,
    })
    .expect(201);

  return response.body as {
    token: string;
    user: { userId: string; email: string; role: string };
  };
}

export async function setRole(token: string, role: "photographer" | "client") {
  const response = await api()
    .patch("/api/auth/me/role")
    .set("Authorization", `Bearer ${token}`)
    .send({ role })
    .expect(200);

  return response.body as { token: string; user: { userId: string; role: string } };
}

export async function onboardPhotographer(token: string, businessName: string) {
  const response = await api()
    .post("/api/photographer/onboarding/complete")
    .set("Authorization", `Bearer ${token}`)
    .send({
      businessName,
      specialization: "Wedding",
      bio: "Test studio bio",
      momoAccountName: businessName,
      momoNumber: "+250 788 111 222",
    })
    .expect(201);

  return response.body.data as {
    studio: { id: string; slug: string };
  };
}

export async function completeClientOnboarding(token: string) {
  await api()
    .patch("/api/client/settings")
    .set("Authorization", `Bearer ${token}`)
    .send({
      phone: "+250 788 333 444",
      address: "Kigali, Rwanda",
      interests: ["Wedding", "Portrait"],
    })
    .expect(200);
}

export async function createPhotographerPackage(
  token: string,
  input: {
    title: string;
    price: number;
    depositPercent?: number;
    category?: "wedding" | "portrait" | "commercial" | "editorial";
  },
) {
  const response = await api()
    .post("/api/photographer/services")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: input.title,
      description: "Integration test package",
      price: input.price,
      depositPercent: input.depositPercent ?? 50,
      category: input.category ?? "wedding",
      duration: "2hr",
      isActive: true,
    })
    .expect(201);

  return response.body.data as { id: string; price: number; depositPercent: number };
}

export async function addCrmClient(
  token: string,
  input: { name: string; email: string; phone?: string },
) {
  const response = await api()
    .post("/api/photographer/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: input.name,
      email: input.email,
      phone: input.phone ?? "+250 788 555 666",
      category: "wedding",
    })
    .expect(201);

  return response.body.data as { id: string; email: string };
}

export { prisma };
