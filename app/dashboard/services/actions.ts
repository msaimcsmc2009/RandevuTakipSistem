"use server";

import { z } from "zod";
import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";

const serviceInput = z.object({
  name: z.string().min(2).max(100),
  durationMinutes: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export async function addService(input: z.infer<typeof serviceInput>) {
  const parsed = serviceInput.parse(input);
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  await supabase.from("services").insert({
    business_id: business.id,
    name: parsed.name,
    duration_minutes: parsed.durationMinutes,
    price: parsed.price,
  });
}

export async function updateService(input: { id: string } & z.infer<typeof serviceInput>) {
  const parsed = serviceInput.parse(input);
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  await supabase
    .from("services")
    .update({
      name: parsed.name,
      duration_minutes: parsed.durationMinutes,
      price: parsed.price,
    })
    .eq("id", input.id)
    .eq("business_id", business.id);
}

export async function deleteService(input: { id: string }) {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", input.id)
    .eq("business_id", business.id);

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Bu hizmet silinemiyor çünkü bu hizmete bağlı randevular var. Önce ilgili randevuları silin veya bu hizmeti kullanmayı bırakın."
      );
    }
    throw new Error("Hizmet silinirken bir hata oluştu.");
  }
}
