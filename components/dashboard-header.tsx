"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/dashboard/actions";
import { DashboardNav } from "@/components/dashboard-nav";
import type { Business } from "@/types/database";

export function DashboardHeader({ business }: { business: Business | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "glass-strong shadow-sm" : "glass"
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex-none font-heading text-lg font-semibold tracking-tight text-foreground">
            randevu<span className="text-accent">.</span>
          </span>
          {business && (
            <span className="truncate rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {business.name}
            </span>
          )}
        </div>
        <div className="flex flex-none items-center gap-3 sm:gap-5">
          {business && (
            <Link
              href={`/${business.slug}`}
              target="_blank"
              aria-label="Randevu sayfam"
              className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-glow"
            >
              <span className="hidden sm:inline">Randevu sayfam</span>{" "}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              aria-label="Çıkış yap"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Çıkış yap</span>
            </button>
          </form>
        </div>
      </div>
      <DashboardNav />
    </header>
  );
}
