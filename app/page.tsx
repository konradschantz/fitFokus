// app/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  // Logget ind? Send fx til dagens træning:
  redirect("/workout/today");
}
