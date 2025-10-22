// /lib/auth.ts (eller hvor din helper ligger)
import { prisma } from "@/lib/db";


type EnsureUserOpts = {
  fallbackEmail?: string; // valgfri .env DEMO_EMAIL
};

export async function getOrCreateUserId(opts: EnsureUserOpts = {}) {
  // 1) Find e-mail fra session (hvis next-auth er sat op). Ellers brug fallback.
  let email =
    process.env.DEMO_EMAIL ||
    opts.fallbackEmail ||
    "demo@fitfokus.local";

  email = email.trim().toLowerCase();

  // 2) Upsert på e-mail → få DB-id tilbage (ikke session-id)
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      settings: {
        create: {
          goal: "Styrke + kondition",
          daysPerWeek: 4,
          equipmentProfile: "Fitnesscenter (maskiner + frie vægte)",
          lastPlanType: "Full Body",
        },
      },
    },
    select: { id: true },
  });

  return user.id; // <- Dette er DB’ens cuid, matcher dine rækker (cmh1...)
}
