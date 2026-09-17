import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { CustomersManager } from "@/components/customers-manager";
import type { Customer } from "@/types/database";

const SORT_COLUMNS: Record<string, string> = {
  name: "name",
  loyalty_points: "loyalty_points",
  created_at: "created_at",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string };
}) {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const q = searchParams.q ?? "";
  const sort = SORT_COLUMNS[searchParams.sort ?? ""] ? (searchParams.sort as string) : "name";

  let query = supabase.from("customers").select("*").eq("business_id", business.id);

  if (q.trim()) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: customers } = await query.order(SORT_COLUMNS[sort], {
    ascending: sort !== "created_at" && sort !== "loyalty_points",
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Müşteriler</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Müşteri kayıtlarını, sadakat puanlarını ve geçmişlerini yönet.
      </p>

      <div className="mt-6">
        <CustomersManager customers={(customers ?? []) as Customer[]} q={q} sort={sort} />
      </div>
    </div>
  );
}
