// auth.ts (NextAuth v4 options)
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { db } from "@/lib/db";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    // Surface clear configuration errors during startup and in logs
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || undefined,
  debug: true,
  providers: [
    Google({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user = { ...(session.user || {}), id: token.userId };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        // Always allow explicit navigation to login
        if (url === "/login" || url.startsWith(`${baseUrl}/login`)) {
          return `${baseUrl}/login`;
        }
        // Pass through same-origin and relative URLs. Middleware will handle auth-only routes.
        if (url.startsWith(baseUrl)) return url;
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // Otherwise, fallback to baseUrl
        return baseUrl;
      } catch {
        return `${baseUrl}/login`;
      }
    },
  },
  pages: { signIn: "/login" },
};
