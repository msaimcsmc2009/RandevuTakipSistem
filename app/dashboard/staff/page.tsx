import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { StaffManager } from "@/components/staff-manager";
import type { Staff } from "@/types/database";

export default async function StaffPage() {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Personel</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ekibindeki personeli yönet. Çalışma saatleri ve randevu ataması sonraki aşamada eklenecek.
      </p>

      <div className="mt-6">
        <StaffManager staff={(staff ?? []) as Staff[]} />
      </div>
    </div>
  );
}
