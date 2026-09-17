import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/booking-form";
import type { Business, Service } from "@/types/database";

export default async function BusinessBookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!business) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  const typedBusiness = business as Business;
  const typedServices = (services ?? []) as Service[];

  return (
    <main className="min-h-screen pb-24">
      <header className="bg-brand-panel border-b border-border text-foreground">
        <div className="mx-auto max-w-4xl px-6 py-14 sm:px-12">
          <div className="flex items-center gap-4">
            <span className="glass flex h-14 w-14 flex-none items-center justify-center rounded-xl font-heading text-xl font-semibold text-primary">
              {typedBusiness.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h1 className="font-heading text-3xl font-semibold leading-tight">
                {typedBusiness.name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                {typedBusiness.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {typedBusiness.address}
                  </span>
                )}
                {typedBusiness.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {typedBusiness.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-12">
        {typedServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Bu işletme henüz hizmet eklememiş. Daha sonra tekrar deneyin.
          </p>
        ) : (
          <BookingForm business={typedBusiness} services={typedServices} />
        )}
      </div>
    </main>
  );
}
