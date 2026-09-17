import {
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  Clock,
  Flame,
  Repeat2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { StatCard } from "@/components/stat-card";

export async function DashboardStatsGrid({ businessId }: { businessId: string }) {
  const stats = await getDashboardStats(businessId);

  const cards = [
    { label: "Bugünkü randevu", icon: CalendarCheck, value: stats.todayAppointments },
    { label: "Haftalık randevu", icon: CalendarRange, value: stats.weekAppointments },
    { label: "Aylık randevu", icon: CalendarClock, value: stats.monthAppointments },
    { label: "Toplam müşteri", icon: Users, value: stats.totalCustomers },
    { label: "Yeni müşteri", icon: UserPlus, value: stats.newCustomersThisMonth, hint: "Bu ay" },
    {
      label: "Tekrar gelen müşteri",
      icon: Repeat2,
      value: stats.returningCustomers,
      hint: "Son 90 gün",
    },
    {
      label: "Ort. günlük müşteri",
      icon: UserCheck,
      value: stats.avgDailyCustomers,
      decimals: 1,
      hint: "Son 90 gün",
    },
    {
      label: "Ort. günlük gelir",
      icon: Wallet,
      value: stats.avgDailyRevenue,
      prefix: "₺",
      hint: "Son 90 gün",
    },
    { label: "Haftalık gelir", icon: BarChart3, value: stats.weeklyRevenue, prefix: "₺" },
    { label: "Aylık gelir", icon: TrendingUp, value: stats.monthlyRevenue, prefix: "₺" },
    {
      label: "En yoğun saat",
      icon: Clock,
      display:
        stats.busiestHour !== null ? `${String(stats.busiestHour).padStart(2, "0")}:00` : "—",
    },
    { label: "En yoğun gün", icon: Flame, display: stats.busiestDayLabel ?? "—" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 35}ms`, animationFillMode: "backwards" }}
        >
          <StatCard {...card} />
        </div>
      ))}
    </div>
  );
}
