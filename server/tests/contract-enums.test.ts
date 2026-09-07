import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * `src/contracts/enums.ts` re-declares the Prisma enums as string unions,
 * because the frontend resolves that directory directly and importing
 * `@prisma/client` there would pull Prisma into the browser bundle.
 *
 * A hand-maintained copy drifts unless something checks it. This reads both
 * files and fails if any enum's members differ, so adding a booking status to
 * the schema without updating the contract breaks the build rather than
 * shipping a type that quietly lies to the client.
 */

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parsePrismaEnums(): Map<string, string[]> {
  const schema = readFileSync(
    path.join(serverRoot, "prisma", "schema.prisma"),
    "utf8",
  );
  const enums = new Map<string, string[]>();

  for (const match of schema.matchAll(/enum\s+(\w+)\s*\{([^}]*)\}/g)) {
    const [, name, body] = match;
    const members = body
      .split("\n")
      .map((line) => line.replace(/\/\/.*$/, "").trim())
      .filter(Boolean);
    enums.set(name, members.sort());
  }

  return enums;
}

function parseContractUnions(): Map<string, string[]> {
  const source = readFileSync(
    path.join(serverRoot, "src", "contracts", "enums.ts"),
    "utf8",
  );
  const unions = new Map<string, string[]>();

  for (const match of source.matchAll(/export type (\w+) =([^;]*);/g)) {
    const [, name, body] = match;
    const members = [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
    if (members.length > 0) {
      unions.set(name, members);
    }
  }

  return unions;
}

describe("contract enums", () => {
  const prismaEnums = parsePrismaEnums();
  const contractUnions = parseContractUnions();

  it("finds the enums in both files", () => {
    expect(prismaEnums.size).toBeGreaterThan(0);
    expect(contractUnions.size).toBeGreaterThan(0);
  });

  it("declares every Prisma enum", () => {
    const missing = [...prismaEnums.keys()].filter(
      (name) => !contractUnions.has(name),
    );
    expect(missing).toEqual([]);
  });

  it.each([...parsePrismaEnums().keys()])(
    "%s has the same members in the schema and the contract",
    (name) => {
      expect(contractUnions.get(name)).toEqual(prismaEnums.get(name));
    },
  );
});
