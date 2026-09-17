"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";

export async function cancelAppointment(formData: FormData) {
  const id = String(formData.get("appointmentId") ?? "");
  if (!id) return;

  const supabase = createClient();
  await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
  revalidatePath("/dashboard/appointments");
}

export async function deleteAppointment(formData: FormData) {
  const id = String(formData.get("appointmentId") ?? "");
  if (!id) return;

  const { business } = await requireOwnerBusiness();
  const supabase = createClient();
  await supabase.from("appointments").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/dashboard/appointments");
}
