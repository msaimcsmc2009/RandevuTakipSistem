import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ArrowLeft, Cake, Mail, Phone, Star, StickyNote } from "lucide-react";
import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus, Customer } from "@/types/database";

type AppointmentHistoryRow = {
  id: string;
  start_time: string;
  status: AppointmentStatus;
  price_at_booking: number;
  service: { name: string } | null;
};

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!customer) notFound();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, start_time, status, price_at_booking, service:services(name)")
    .eq("customer_id", params.id)
    .eq("business_id", business.id)
    .order("start_time", { ascending: false });

  const history = (appointments ?? []) as unknown as AppointmentHistoryRow[];
  const completedVisits = history.filter((a) => a.status !== "cancelled");

  const totalVisits = completedVisits.length;
  const totalSpend = completedVisits.reduce((sum, a) => sum + Number(a.price_at_booking ?? 0), 0);

  const serviceCounts = new Map<string, number>();
  for (const a of completedVisits) {
    const name = a.service?.name ?? "Bilinmeyen hizmet";
    serviceCounts.set(name, (serviceCounts.get(name) ?? 0) + 1);
  }
  const mostBookedService =
    [...serviceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const typedCustomer = customer as Customer;

  return (
    <div>
      <Link
        href="/dashboard/customers"
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Müşterilere dön
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{typedCustomer.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {typedCustomer.phone}
            </span>
            {typedCustomer.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {typedCustomer.email}
              </span>
            )}
            {typedCustomer.birth_date && (
              <span className="flex items-center gap-1.5">
                <Cake className="h-3.5 w-3.5" />
                {format(new Date(typedCustomer.birth_date), "d MMMM", { locale: tr })}
              </span>
            )}
          </div>
        </div>
        <Badge className="flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5" /> {typedCustomer.loyalty_points} puan
        </Badge>
      </div>

      {typedCustomer.notes && (
        <Card elevated className="mt-4 p-4">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <StickyNote className="mt-0.5 h-4 w-4 flex-none" /> {typedCustomer.notes}
          </p>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card elevated className="p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Toplam geliş</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-foreground">{totalVisits}</p>
        </Card>
        <Card elevated className="p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Toplam harcama</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-foreground">
            ₺{new Intl.NumberFormat("tr-TR").format(totalSpend)}
          </p>
        </Card>
        <Card elevated className="p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">En çok aldığı hizmet</p>
          <p className="mt-2 font-heading text-lg font-semibold text-foreground">{mostBookedService}</p>
        </Card>
      </div>

      <h2 className="mt-8 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Randevu geçmişi
      </h2>
      <Card className="mt-3 divide-y divide-border">
        {history.length === 0 && (
          <CardContent className="text-center text-sm text-muted-foreground">
            Henüz randevu geçmişi yok.
          </CardContent>
        )}
        {history.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{a.service?.name ?? "Hizmet"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {format(new Date(a.start_time), "d MMMM yyyy, HH:mm", { locale: tr })}
              </p>
            </div>
            <div className="flex flex-none items-center gap-3">
              <span className="text-sm font-medium text-foreground">₺{a.price_at_booking}</span>
              <Badge variant={a.status === "cancelled" ? "neutral" : "success"}>
                {a.status === "cancelled" ? "İptal edildi" : "Tamamlandı"}
              </Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
