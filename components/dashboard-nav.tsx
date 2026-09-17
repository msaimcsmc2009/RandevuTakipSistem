"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Scissors, Settings, UserCog, Users } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Randevular", icon: CalendarDays },
  { href: "/dashboard/customers", label: "Müşteriler", icon: Users },
  { href: "/dashboard/staff", label: "Personel", icon: UserCog },
  { href: "/dashboard/services", label: "Hizmetler", icon: Scissors },
  { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-8">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
