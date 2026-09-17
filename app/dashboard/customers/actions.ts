"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

const customerInput = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type ActionResult = { success: true } | { success: false; error: string };

export async function createCustomer(input: z.infer<typeof customerInput>): Promise<ActionResult> {
  const parsed = customerInput.parse(input);
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { error } = await supabase.from("customers").insert({
    business_id: business.id,
    name: parsed.name,
    phone: normalizePhone(parsed.phone),
    email: parsed.email || null,
    birth_date: parsed.birthDate || null,
    notes: parsed.notes || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Bu telefon numarasıyla kayıtlı bir müşteri zaten var." };
    }
    return { success: false, error: "Müşteri eklenemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/dashboard/customers");
  return { success: true };
}

export async function updateCustomer(
  input: { id: string; loyaltyPoints?: number } & z.infer<typeof customerInput>
): Promise<ActionResult> {
  const parsed = customerInput.parse(input);
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.name,
      phone: normalizePhone(parsed.phone),
      email: parsed.email || null,
      birth_date: parsed.birthDate || null,
      notes: parsed.notes || null,
      ...(input.loyaltyPoints !== undefined ? { loyalty_points: input.loyaltyPoints } : {}),
    })
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Bu telefon numarasıyla kayıtlı bir müşteri zaten var." };
    }
    return { success: false, error: "Müşteri güncellenemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${input.id}`);
  return { success: true };
}

export async function deleteCustomer(input: { id: string }): Promise<ActionResult> {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) {
    return { success: false, error: "Müşteri silinemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/dashboard/customers");
  return { success: true };
}
