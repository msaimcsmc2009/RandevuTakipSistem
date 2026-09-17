"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateUniqueSlug } from "@/lib/slug";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const businessName = String(formData.get("businessName") ?? "");

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    // Email confirmation is required by the Supabase project settings —
    // there's no active session yet to create the business row with.
    redirect(
      `/login?error=${encodeURIComponent(
        "Hesabın oluşturuldu. Devam etmek için e-postanı onayla ve giriş yap."
      )}`
    );
  }

  const slug = await generateUniqueSlug(supabase, businessName || email.split("@")[0]);

  const { error: businessError } = await supabase.from("businesses").insert({
    name: businessName || email.split("@")[0],
    slug,
    owner_id: data.user!.id,
  });

  if (businessError) {
    redirect(`/signup?error=${encodeURIComponent(businessError.message)}`);
  }

  redirect("/dashboard/settings");
}
