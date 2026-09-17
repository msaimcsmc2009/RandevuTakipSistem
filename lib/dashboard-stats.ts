import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  setDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { tr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  todayAppointments: number;
  weekAppointments: number;
  monthAppointments: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  avgDailyCustomers: number;
  avgDailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  busiestHour: number | null;
  busiestDayLabel: string | null;
};

const ROLLING_WINDOW_DAYS = 90;

type PeriodRow = { price_at_booking: number };

async function getPeriodTotals(
  businessId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<{ count: number; revenue: number }> {
  const supabase = createClient();
  const { data } = await supabase
    .from("appointments")
    .select("price_at_booking")
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .gte("start_time", rangeStart.toISOString())
    .lte("start_time", rangeEnd.toISOString());

  const rows = (data ?? []) as PeriodRow[];
  return {
    count: rows.length,
    revenue: rows.reduce((sum, row) => sum + Number(row.price_at_booking ?? 0), 0),
  };
}

export async function getDashboardStats(businessId: string): Promise<DashboardStats> {
  const supabase = createClient();
  const now = new Date();

  const [today, week, month] = await Promise.all([
    getPeriodTotals(businessId, startOfDay(now), endOfDay(now)),
    getPeriodTotals(businessId, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })),
    getPeriodTotals(businessId, startOfMonth(now), endOfMonth(now)),
  ]);

  const totalCustomersQuery = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);
  const totalCustomers = totalCustomersQuery.count ?? 0;

  const newCustomersQuery = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("created_at", startOfMonth(now).toISOString());
  const newCustomersThisMonth = newCustomersQuery.count ?? 0;

  // Rolling window used as the basis for daily-average figures (revenue,
  // customers) and "busiest hour/day" — a fixed 90-day trailing sample
  // rather than the (variable-length) current calendar month.
  const windowStart = subDays(startOfDay(now), ROLLING_WINDOW_DAYS);
  const { data: windowData } = await supabase
    .from("appointments")
    .select("customer_id, price_at_booking, start_time")
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .gte("start_time", windowStart.toISOString())
    .lte("start_time", now.toISOString());

  const windowRows = (windowData ?? []) as {
    customer_id: string | null;
    price_at_booking: number;
    start_time: string;
  }[];

  const windowRevenue = windowRows.reduce((sum, row) => sum + Number(row.price_at_booking ?? 0), 0);
  const avgDailyRevenue = windowRevenue / ROLLING_WINDOW_DAYS;

  const visitsByCustomer = new Map<string, number>();
  for (const row of windowRows) {
    if (!row.customer_id) continue;
    visitsByCustomer.set(row.customer_id, (visitsByCustomer.get(row.customer_id) ?? 0) + 1);
  }
  const returningCustomers = [...visitsByCustomer.values()].filter((visits) => visits >= 2).length;
  const avgDailyCustomers = visitsByCustomer.size / ROLLING_WINDOW_DAYS;

  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0); // 0 = Sunday, matches date-fns getDay()
  for (const row of windowRows) {
    const date = new Date(row.start_time);
    hourCounts[date.getHours()] += 1;
    dayCounts[date.getDay()] += 1;
  }

  const busiestHour = hourCounts.some((c) => c > 0)
    ? hourCounts.indexOf(Math.max(...hourCounts))
    : null;

  let busiestDayLabel: string | null = null;
  if (dayCounts.some((c) => c > 0)) {
    const busiestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    busiestDayLabel = format(setDay(now, busiestDayIndex, { weekStartsOn: 0 }), "EEEE", { locale: tr });
  }

  return {
    todayAppointments: today.count,
    weekAppointments: week.count,
    monthAppointments: month.count,
    totalCustomers,
    newCustomersThisMonth,
    returningCustomers,
    avgDailyCustomers,
    avgDailyRevenue,
    weeklyRevenue: week.revenue,
    monthlyRevenue: month.revenue,
    busiestHour,
    busiestDayLabel,
  };
}
