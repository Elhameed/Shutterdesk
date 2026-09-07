import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * `src/contracts/` is resolved directly by the frontend build through the
 * `@contracts/*` alias. Anything in there that survives compilation gets
 * bundled into the browser, and an import of server code would drag Prisma in
 * with it.
 *
 * The rule is that the directory holds types only. This enforces it, because a
 * `const` added there would otherwise ship to users without anyone noticing.
 */

const contractsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "contracts",
);

const sourceFiles = readdirSync(contractsDir).filter((name) => name.endsWith(".ts"));

/** Strip comments so prose about `const` or Prisma doesn't trip the checks. */
function stripComments(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("contracts are type-only", () => {
  it("finds the contract sources", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it.each(sourceFiles)("%s exports no runtime values", (name) => {
    const code = stripComments(readFileSync(path.join(contractsDir, name), "utf8"));

    expect(code).not.toMatch(/export\s+(const|let|var|function|class|enum)\b/);
    // `export default` and re-exported values would ship too.
    expect(code).not.toMatch(/export\s+default\b/);
  });

  it.each(sourceFiles)("%s imports nothing outside contracts", (name) => {
    const code = stripComments(readFileSync(path.join(contractsDir, name), "utf8"));

    for (const [, specifier] of code.matchAll(/from\s+"([^"]+)"/g)) {
      // Only sibling contract modules are allowed. Notably not
      // "@prisma/client": the enums are re-declared here for this reason.
      expect(specifier).toMatch(/^\.\/[\w-]+\.js$/);
    }
  });

  it.each(sourceFiles)("%s uses type-only exports", (name) => {
    const code = stripComments(readFileSync(path.join(contractsDir, name), "utf8"));

    for (const [statement] of code.matchAll(/^export\s+\{[^}]*\}[^;]*;/gm)) {
      expect(statement).toMatch(/^export\s+type\s/);
    }
    for (const [statement] of code.matchAll(/^export\s+\*[^;]*;/gm)) {
      expect(statement).toMatch(/^export\s+type\s+\*/);
    }
  });
});
