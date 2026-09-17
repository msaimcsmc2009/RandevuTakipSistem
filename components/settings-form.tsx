"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Business, WorkingHours } from "@/types/database";
import { saveBusinessSettings } from "@/app/dashboard/settings/actions";

const DAY_LABELS: { key: keyof WorkingHours; label: string }[] = [
  { key: "mon", label: "Pazartesi" },
  { key: "tue", label: "Salı" },
  { key: "wed", label: "Çarşamba" },
  { key: "thu", label: "Perşembe" },
  { key: "fri", label: "Cuma" },
  { key: "sat", label: "Cumartesi" },
  { key: "sun", label: "Pazar" },
];

type DayState = { closed: boolean; open: string; close: string };

function daysFromWorkingHours(wh: WorkingHours | undefined): Record<keyof WorkingHours, DayState> {
  const result = {} as Record<keyof WorkingHours, DayState>;
  for (const { key } of DAY_LABELS) {
    const range = wh?.[key]?.[0];
    result[key] = {
      closed: !range,
      open: range?.[0] ?? "09:00",
      close: range?.[1] ?? "18:00",
    };
  }
  return result;
}

export function SettingsForm({ business }: { business: Business | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(business?.name ?? "");
  const [slug, setSlug] = useState(business?.slug ?? "");
  const [phone, setPhone] = useState(business?.phone ?? "");
  const [address, setAddress] = useState(business?.address ?? "");
  const [days, setDays] = useState(daysFromWorkingHours(business?.working_hours));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateDay(key: keyof WorkingHours, patch: Partial<DayState>) {
    setDays((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await saveBusinessSettings({
        businessId: business?.id,
        name,
        slug,
        phone,
        address,
        days,
      });

      if (result.success) {
        setSlug(result.slug);
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="glass rounded-xl p-5 shadow-md">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          İşletme bilgileri
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-foreground">İşletme adı</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-subtle mt-1 w-full rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Randevu sayfası adresi (slug)
            </span>
            <div className="glass-subtle mt-1 flex items-center rounded-lg transition-all focus-within:border-primary focus-within:shadow-glow-primary focus-within:ring-2 focus-within:ring-primary/30">
              <span className="pl-3 text-sm text-muted-foreground">/</span>
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg bg-transparent px-2 py-2 text-sm text-foreground outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Telefon</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="glass-subtle mt-1 w-full rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Adres</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="glass-subtle mt-1 w-full rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>
      </section>

      <section className="glass rounded-xl p-5 shadow-md">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Çalışma saatleri
        </h2>
        <div className="mt-4 space-y-2">
          {DAY_LABELS.map(({ key, label }) => {
            const day = days[key];
            return (
              <div
                key={key}
                className={`flex flex-wrap items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                  day.closed
                    ? "border-border bg-white/[0.02]"
                    : "border-primary/20 bg-primary/5"
                }`}
              >
                <span
                  className={`w-28 text-sm font-medium ${day.closed ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {label}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!day.closed}
                    onChange={(e) => updateDay(key, { closed: !e.target.checked })}
                    className="accent-primary"
                  />
                  Açık
                </label>
                {!day.closed && (
                  <>
                    <input
                      type="time"
                      value={day.open}
                      onChange={(e) => updateDay(key, { open: e.target.value })}
                      className="glass-subtle rounded-md px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <span className="text-muted-foreground">–</span>
                    <input
                      type="time"
                      value={day.close}
                      onChange={(e) => updateDay(key, { close: e.target.value })}
                      className="glass-subtle rounded-md px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-primary-glow to-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow-primary transition-all hover:shadow-glow-primary-lg disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Kaydet
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Kaydedildi
          </span>
        )}
      </div>
    </form>
  );
}
