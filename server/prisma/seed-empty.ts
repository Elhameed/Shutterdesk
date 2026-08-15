/**
 * Intentionally empty seed — used when you want migrate reset without demo data.
 * Default seed remains server/prisma/seed.ts for regression testing.
 */
async function main() {
  // No-op: blank database for first-time user flows.
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
