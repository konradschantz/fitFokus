// /lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/db";

type EnsureUserOpts = {
  fallbackEmail?: string;
};

const DEFAULT_SETTINGS = {
  goal: "Styrke + kondition",
  daysPerWeek: 4,
  equipmentProfile: "Fitnesscenter (maskiner + frie vægte)",
  lastPlanType: "Full Body",
};

export async function getOrCreateUserId(opts: EnsureUserOpts = {}) {
  const session = await getServerSession(authOptions);
  const fallbackEmail = opts.fallbackEmail || process.env.DEMO_EMAIL || "demo@fitfokus.local";

  if (session?.user?.id) {
    const existing = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
    if (existing) {
      return existing.id;
    }

    const email = (session.user.email ?? fallbackEmail).trim().toLowerCase();
    const created = await prisma.user.create({
      data: {
        id: session.user.id,
        email,
        settings: { create: DEFAULT_SETTINGS },
      },
      select: { id: true },
    });
    return created.id;
  }

  const normalizedEmail = fallbackEmail.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: {
      email: normalizedEmail,
      settings: { create: DEFAULT_SETTINGS },
    },
    select: { id: true },
  });

  return user.id;
}
