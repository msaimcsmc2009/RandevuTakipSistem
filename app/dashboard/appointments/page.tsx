import Link from "next/link";
import {
  addDays,
  addWeeks,
  endOfDay,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import { requireOwnerBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { AppointmentCard } from "@/components/appointment-card";
import type { AppointmentStatus } from "@/types/database";

type AppointmentRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  service: { name: string } | null;
};

function toDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string };
}) {
  const { business } = await requireOwnerBusiness();
  const supabase = createClient();

  const view = searchParams.view === "day" ? "day" : "week";
  const anchor = toDate(searchParams.date);

  const rangeStart = view === "day" ? startOfDay(anchor) : startOfWeek(anchor, { weekStartsOn: 1 });
  const rangeEnd = view === "day" ? endOfDay(anchor) : endOfWeek(anchor, { weekStartsOn: 1 });

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, customer_name, customer_phone, start_time, end_time, status, service:services(name)")
    .eq("business_id", business.id)
    .gte("start_time", rangeStart.toISOString())
    .lte("start_time", rangeEnd.toISOString())
    .order("start_time", { ascending: true });

  const rows = (appointments ?? []) as unknown as AppointmentRow[];

  const prevHref = `/dashboard/appointments?view=${view}&date=${format(
    view === "day" ? addDays(anchor, -1) : subWeeks(anchor, 1),
    "yyyy-MM-dd"
  )}`;
  const nextHref = `/dashboard/appointments?view=${view}&date=${format(
    view === "day" ? addDays(anchor, 1) : addWeeks(anchor, 1),
    "yyyy-MM-dd"
  )}`;
  const todayHref = `/dashboard/appointments?view=${view}&date=${format(new Date(), "yyyy-MM-dd")}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Randevular</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "day"
              ? format(anchor, "d MMMM yyyy, EEEE", { locale: tr })
              : `${format(rangeStart, "d MMM", { locale: tr })} – ${format(rangeEnd, "d MMM yyyy", { locale: tr })}`}
            <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {rows.length} randevu
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border">
            <Link
              href={`/dashboard/appointments?view=day&date=${format(anchor, "yyyy-MM-dd")}`}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
              }`}
            >
              Gün
            </Link>
            <Link
              href={`/dashboard/appointments?view=week&date=${format(anchor, "yyyy-MM-dd")}`}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"
              }`}
            >
              Hafta
            </Link>
          </div>

          <Link
            href={prevHref}
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={todayHref}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Bugün
          </Link>
          <Link
            href={nextHref}
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {view === "day" ? (
        <div className="mt-6 space-y-3">
          {rows.length === 0 && <EmptyState text="Bu gün için randevu yok." />}
          {rows.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(rangeStart, i);
            const dayAppointments = rows.filter((a) => isSameDay(new Date(a.start_time), day));
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={i}
                className={isToday ? "rounded-lg bg-primary/10 p-2 -m-2" : undefined}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "EEE d MMM", { locale: tr })}
                </p>
                <div className="mt-2 space-y-2">
                  {dayAppointments.length === 0 && (
                    <p className="text-xs text-muted-foreground/70">Randevu yok</p>
                  )}
                  {dayAppointments.map((a) => (
                    <AppointmentCard key={a.id} appointment={a} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
      <CalendarX2 className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
