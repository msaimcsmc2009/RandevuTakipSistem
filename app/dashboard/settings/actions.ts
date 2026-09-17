"use server";

import { z } from "zod";
import { requireUser } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import type { WorkingHours } from "@/types/database";

const daySchema = z.object({
  closed: z.boolean(),
  open: z.string(),
  close: z.string(),
});

const settingsInput = z.object({
  businessId: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(60),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  days: z.object({
    mon: daySchema,
    tue: daySchema,
    wed: daySchema,
    thu: daySchema,
    fri: daySchema,
    sat: daySchema,
    sun: daySchema,
  }),
});

export type SettingsInput = z.infer<typeof settingsInput>;

function toWorkingHours(days: SettingsInput["days"]): WorkingHours {
  const entries = Object.entries(days).map(([key, day]) => [
    key,
    day.closed ? [] : [[day.open, day.close]],
  ]);
  return Object.fromEntries(entries) as WorkingHours;
}

export async function saveBusinessSettings(
  input: SettingsInput
): Promise<{ success: true; slug: string } | { success: false; error: string }> {
  const parsed = settingsInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Bilgiler eksik veya hatalı." };
  }

  const user = await requireUser();
  const supabase = createClient();
  const slug = slugify(parsed.data.slug);

  if (!slug) {
    return { success: false, error: "Geçerli bir adres (slug) girin." };
  }

  const { data: slugOwner } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (slugOwner && slugOwner.id !== parsed.data.businessId) {
    return { success: false, error: "Bu adres başka bir işletme tarafından kullanılıyor." };
  }

  const record = {
    name: parsed.data.name,
    slug,
    phone: parsed.data.phone || null,
    address: parsed.data.address || null,
    working_hours: toWorkingHours(parsed.data.days),
  };

  if (parsed.data.businessId) {
    const { error } = await supabase
      .from("businesses")
      .update(record)
      .eq("id", parsed.data.businessId)
      .eq("owner_id", user.id);

    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("businesses").insert({
      ...record,
      owner_id: user.id,
    });

    if (error) return { success: false, error: error.message };
  }

  return { success: true, slug };
}
