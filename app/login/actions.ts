"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.message === "Email not confirmed"
        ? "E-postanı henüz onaylamadın. Gelen kutunu (ve spam klasörünü) kontrol edip onay linkine tıkla."
        : "E-posta veya şifre hatalı.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard");
}
