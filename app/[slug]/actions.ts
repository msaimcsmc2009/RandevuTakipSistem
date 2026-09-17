"use server";

import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/availability";
import { sendBookingEmails } from "@/lib/email";
import { normalizePhone } from "@/lib/phone";
import type { Business } from "@/types/database";

export async function getSlotsForDate({
  businessId,
  serviceId,
  dateStr,
}: {
  businessId: string;
  serviceId: string;
  dateStr: string;
}): Promise<string[]> {
  const supabase = createClient();

  const [{ data: business }, { data: service }] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", businessId).maybeSingle(),
    supabase.from("services").select("*").eq("id", serviceId).maybeSingle(),
  ]);

  if (!business || !service) return [];

  const date = new Date(`${dateStr}T00:00:00`);
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);

  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("start_time, end_time")
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .gte("start_time", dayStart.toISOString())
    .lte("start_time", dayEnd.toISOString());

  const slots = getAvailableSlots({
    date,
    workingHours: (business as Business).working_hours,
    durationMinutes: service.duration_minutes,
    existingAppointments: existingAppointments ?? [],
  });

  return slots.map((s) => s.start.toISOString());
}

const bookingSchema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string(),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(7).max(20),
  customerEmail: z.string().email(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export async function createAppointment(
  input: BookingInput
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Bilgiler eksik veya hatalı." };
  }

  const { businessId, serviceId, startTime, customerName, customerPhone, customerEmail } =
    parsed.data;

  const supabase = createClient();
  const serviceRole = createServiceRoleClient();

  const [{ data: business }, { data: service }] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", businessId).maybeSingle(),
    supabase.from("services").select("*").eq("id", serviceId).maybeSingle(),
  ]);

  if (!business || !service) {
    return { success: false, error: "İşletme veya hizmet bulunamadı." };
  }

  const start = new Date(startTime);
  const end = new Date(start.getTime() + service.duration_minutes * 60_000);
  const dateForAvailability = new Date(start);
  dateForAvailability.setHours(0, 0, 0, 0);

  const dayStart = new Date(dateForAvailability);
  const dayEnd = new Date(dateForAvailability);
  dayEnd.setHours(23, 59, 59, 999);

  const { data: existingAppointments } = await supabase
    .from("appointments")
    .select("start_time, end_time")
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .gte("start_time", dayStart.toISOString())
    .lte("start_time", dayEnd.toISOString());

  const stillAvailable = getAvailableSlots({
    date: dateForAvailability,
    workingHours: (business as Business).working_hours,
    durationMinutes: service.duration_minutes,
    existingAppointments: existingAppointments ?? [],
  }).some((slot) => slot.start.getTime() === start.getTime());

  if (!stillAvailable) {
    return {
      success: false,
      error: "Bu saat az önce başka bir müşteri tarafından alındı. Lütfen başka bir saat seçin.",
    };
  }

  const normalizedPhone = normalizePhone(customerPhone);
  const { data: customer } = await serviceRole
    .from("customers")
    .upsert(
      { business_id: businessId, name: customerName, phone: normalizedPhone, email: customerEmail },
      { onConflict: "business_id,phone" }
    )
    .select("id")
    .single();

  const { data: appointment, error: insertError } = await serviceRole
    .from("appointments")
    .insert({
      business_id: businessId,
      service_id: serviceId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      customer_id: customer?.id ?? null,
      price_at_booking: service.price,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "confirmed",
    })
    .select("*")
    .single();

  if (insertError || !appointment) {
    return {
      success: false,
      error: "Bu saat az önce başka bir müşteri tarafından alındı. Lütfen başka bir saat seçin.",
    };
  }

  let ownerEmail: string | null = null;
  try {
    const { data: ownerUser } = await serviceRole.auth.admin.getUserById(
      (business as Business).owner_id
    );
    ownerEmail = ownerUser.user?.email ?? null;
  } catch (err) {
    console.error("İşletme sahibi e-postası alınamadı:", err);
  }

  await sendBookingEmails({
    business: business as Business,
    service,
    appointment,
    ownerEmail,
  });

  return { success: true };
}
