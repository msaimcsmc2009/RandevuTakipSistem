"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";

const staffInput = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  specialty: z.string().max(200).optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().optional(),
});

type ActionResult = { success: true } | { success: false; error: string };

export async function createStaff(input: z.infer<typeof staffInput>): Promise<ActionResult> {
  const parsed = staffInput.parse(input);
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { error } = await supabase.from("staff").insert({
    business_id: business.id,
    name: parsed.name,
    phone: parsed.phone || null,
    specialty: parsed.specialty || null,
    photo_url: parsed.photoUrl || null,
    active: parsed.active ?? true,
  });

  if (error) return { success: false, error: "Personel eklenemedi. Lütfen tekrar deneyin." };

  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function updateStaff(
  input: { id: string } & z.infer<typeof staffInput>
): Promise<ActionResult> {
  const parsed = staffInput.parse(input);
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { error } = await supabase
    .from("staff")
    .update({
      name: parsed.name,
      phone: parsed.phone || null,
      specialty: parsed.specialty || null,
      photo_url: parsed.photoUrl || null,
      ...(parsed.active !== undefined ? { active: parsed.active } : {}),
    })
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) return { success: false, error: "Personel güncellenemedi. Lütfen tekrar deneyin." };

  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function deleteStaff(input: { id: string }): Promise<ActionResult> {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { error } = await supabase
    .from("staff")
    .delete()
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) return { success: false, error: "Personel silinemedi. Lütfen tekrar deneyin." };

  revalidatePath("/dashboard/staff");
  return { success: true };
}
