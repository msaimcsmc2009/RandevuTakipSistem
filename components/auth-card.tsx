"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck, Clock3, ShieldCheck } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  error,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  error?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="bg-brand-panel relative hidden flex-col justify-between border-r border-border px-12 py-12 text-foreground md:flex">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          randevu.
        </Link>

        <div className="max-w-xs">
          <p className="font-heading text-2xl font-semibold leading-snug">
            Randevularını takvimde değil, tek sayfada topla.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <CalendarCheck className="h-4 w-4 flex-none text-primary" />
              Kendi randevu sayfan, saniyeler içinde kurulur.
            </li>
            <li className="flex items-center gap-2.5">
              <Clock3 className="h-4 w-4 flex-none text-primary" />
              Müsaitlik otomatik hesaplanır, çakışma olmaz.
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 flex-none text-primary" />
              Verilerin güvenli şekilde saklanır.
            </li>
          </ul>
        </div>

        <span className="text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} randevu.
        </span>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <Link
            href="/"
            className="mb-8 inline-block font-heading text-lg font-semibold text-foreground md:hidden"
          >
            randevu.
          </Link>

          <div className="glass-strong rounded-xl p-8 shadow-modal">
            <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

            {error && (
              <p className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-6">{children}</div>
            <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export function AuthInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        {...props}
        className="glass-subtle mt-1 w-full rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

export function AuthSubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-gradient-to-b from-primary-glow to-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow-primary transition-all duration-200 hover:shadow-glow-primary-lg hover:brightness-105 active:translate-y-px active:brightness-95"
    >
      {children}
    </button>
  );
}
