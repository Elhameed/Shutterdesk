// One-off maintenance: remove integration-test data from the connected database.
//
// Test accounts are created with synthetic "@shutterdesk.test" emails (see
// tests/helpers.ts `uniqueEmail`). Deleting those users cascades to their
// studios and all studio-scoped data (bookings, clients, galleries, payments,
// packages, schedules) and their notifications — see prisma/schema.prisma.
//
// SAFE BY DEFAULT: prints a preview and deletes NOTHING unless run with
// `--confirm`. It only ever targets the "@shutterdesk.test" domain, so real users
// and seeded demo accounts (gmail, etc.) are never touched. Schema is untouched.
//
// Usage (from server/):
//   node scripts/cleanup-test-data.mjs            # preview only
//   node scripts/cleanup-test-data.mjs --confirm  # actually delete

import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.resolve(serverRoot, ".env") });

const TEST_DOMAIN = "@shutterdesk.test";
const CONFIRM = process.argv.includes("--confirm");

const dbUrl = process.env.DATABASE_URL ?? "";
if (!dbUrl) {
  console.error("DATABASE_URL is not set (expected in server/.env). Aborting.");
  process.exit(1);
}

function describeHost(url) {
  const match = url.match(/@([^/]+)\/([^?]+)/);
  return match ? `${match[1]}/${match[2]}` : "(unparsed)";
}

const prisma = new PrismaClient();

async function main() {
  console.log(`Database:   ${describeHost(dbUrl)}`);
  console.log(`Target:     users with email ending "${TEST_DOMAIN}"`);
  console.log(`Mode:       ${CONFIRM ? "DELETE (--confirm)" : "PREVIEW (dry run)"}`);
  console.log("");

  const emailFilter = { email: { endsWith: TEST_DOMAIN } };

  const users = await prisma.user.findMany({
    where: emailFilter,
    select: { id: true, email: true, role: true, fullName: true },
    orderBy: { createdAt: "asc" },
  });
  const userIds = users.map((u) => u.id);

  // What cascades when those users are removed.
  const studios = await prisma.studio.findMany({
    where: { ownerUserId: { in: userIds } },
    select: { id: true },
  });
  const studioIds = studios.map((s) => s.id);

  const [
    bookingsByStudio,
    bookingsByEmail,
    verificationsByEmail,
    recordsByEmail,
    crmByEmail,
    galleries,
    packages,
    notifications,
  ] = await Promise.all([
    prisma.booking.count({ where: { studioId: { in: studioIds } } }),
    prisma.booking.count({ where: { clientEmail: { endsWith: TEST_DOMAIN } } }),
    prisma.paymentVerification.count({ where: { clientEmail: { endsWith: TEST_DOMAIN } } }),
    prisma.paymentRecord.count({ where: { clientEmail: { endsWith: TEST_DOMAIN } } }),
    prisma.studioClient.count({ where: { email: { endsWith: TEST_DOMAIN } } }),
    prisma.gallery.count({ where: { studioId: { in: studioIds } } }),
    prisma.servicePackage.count({ where: { studioId: { in: studioIds } } }),
    prisma.notification.count({ where: { userId: { in: userIds } } }),
  ]);

  console.log(`Test users found: ${users.length}`);
  for (const u of users) {
    console.log(`  - [${u.role}] ${u.email} (${u.fullName})`);
  }
  console.log("");
  console.log("Cascade / cleanup impact:");
  console.log(`  studios owned by test users:        ${studioIds.length}`);
  console.log(`  bookings under those studios:        ${bookingsByStudio}`);
  console.log(`  bookings by test client email:       ${bookingsByEmail}`);
  console.log(`  payment verifications (test email):  ${verificationsByEmail}`);
  console.log(`  payment records (test email):        ${recordsByEmail}`);
  console.log(`  CRM clients (test email):            ${crmByEmail}`);
  console.log(`  galleries under those studios:       ${galleries}`);
  console.log(`  service packages under studios:      ${packages}`);
  console.log(`  notifications for test users:        ${notifications}`);
  console.log("");

  // Safety: surface any non-test studios a test client may have touched, so we
  // never cascade-delete a real studio. (Should be 0 for pure test data.)
  const strayBookings = await prisma.booking.findMany({
    where: {
      clientEmail: { endsWith: TEST_DOMAIN },
      studioId: { notIn: studioIds.length ? studioIds : ["__none__"] },
    },
    select: { id: true, studio: { select: { slug: true, ownerUserId: true } } },
  });
  if (strayBookings.length) {
    console.log(
      `NOTE: ${strayBookings.length} test-email booking(s) reference a studio NOT owned by a test user.`,
    );
    console.log("      These bookings will be deleted, but their (real) studio will NOT.");
    console.log("");
  }

  if (!CONFIRM) {
    console.log("Dry run — nothing deleted. Re-run with --confirm to delete.");
    return;
  }

  console.log("Deleting…");
  const result = await prisma.$transaction(async (tx) => {
    // 1) Users → cascades studios (+ all studio-scoped rows) and notifications.
    const deletedUsers = await tx.user.deleteMany({ where: emailFilter });
    // 2) Defensive: any leftover test-email rows not covered by cascades
    //    (e.g. a test client that interacted with a real studio).
    const deletedRecords = await tx.paymentRecord.deleteMany({
      where: { clientEmail: { endsWith: TEST_DOMAIN } },
    });
    const deletedVerifications = await tx.paymentVerification.deleteMany({
      where: { clientEmail: { endsWith: TEST_DOMAIN } },
    });
    const deletedBookings = await tx.booking.deleteMany({
      where: { clientEmail: { endsWith: TEST_DOMAIN } },
    });
    const deletedCrm = await tx.studioClient.deleteMany({
      where: { email: { endsWith: TEST_DOMAIN } },
    });
    return {
      users: deletedUsers.count,
      paymentRecords: deletedRecords.count,
      paymentVerifications: deletedVerifications.count,
      bookings: deletedBookings.count,
      crmClients: deletedCrm.count,
    };
  });

  console.log("");
  console.log("Deleted:");
  console.log(`  users:                 ${result.users}`);
  console.log(`  stray payment records: ${result.paymentRecords}`);
  console.log(`  stray verifications:   ${result.paymentVerifications}`);
  console.log(`  stray bookings:        ${result.bookings}`);
  console.log(`  stray CRM clients:     ${result.crmClients}`);

  const remaining = await prisma.user.count({ where: emailFilter });
  console.log("");
  console.log(`Remaining "${TEST_DOMAIN}" users: ${remaining}`);
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
