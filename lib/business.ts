import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export async function requireUser(): Promise<User> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return user;
}

export async function getOwnerBusiness(userId: string): Promise<Business | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();

  return data as Business | null;
}

export async function requireOwnerBusiness(): Promise<{
  business: Business;
  userEmail: string;
}> {
  const user = await requireUser();
  const business = await getOwnerBusiness(user.id);

  if (!business) redirect("/dashboard/settings");
  return { business, userEmail: user.email ?? "" };
}
