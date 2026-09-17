import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { ServicesManager } from "@/components/services-manager";
import type { Service } from "@/types/database";

export default async function ServicesPage() {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Hizmetler</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Müşterilerinin randevu sayfanda seçebileceği hizmetleri yönet.
      </p>

      <div className="mt-6">
        <ServicesManager services={(services ?? []) as Service[]} />
      </div>
    </div>
  );
}
