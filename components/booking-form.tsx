"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarCheck, CalendarDays, Check, Clock, Loader2, Mail, Phone, User } from "lucide-react";
import type { Business, Service } from "@/types/database";
import { createAppointment, getSlotsForDate } from "@/app/[slug]/actions";

function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function groupSlots(slots: string[]) {
  const groups: { label: string; items: string[] }[] = [
    { label: "Sabah", items: [] },
    { label: "Öğleden sonra", items: [] },
    { label: "Akşam", items: [] },
  ];

  for (const slot of slots) {
    const hour = new Date(slot).getHours();
    if (hour < 12) groups[0].items.push(slot);
    else if (hour < 17) groups[1].items.push(slot);
    else groups[2].items.push(slot);
  }

  return groups.filter((g) => g.items.length > 0);
}

function SectionLabel({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
        {step}
      </span>
      {children}
    </h3>
  );
}

export function BookingForm({
  business,
  services,
}: {
  business: Business;
  services: Service[];
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [dateStr, setDateStr] = useState(todayStr());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSubmitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ slot: string; service: Service } | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const slotGroups = useMemo(() => groupSlots(slots), [slots]);

  useEffect(() => {
    if (!serviceId || !dateStr) return;
    setSelectedSlot(null);
    setLoadingSlots(true);
    getSlotsForDate({ businessId: business.id, serviceId, dateStr })
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [business.id, serviceId, dateStr]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !selectedService) return;
    setError(null);

    startSubmit(async () => {
      const result = await createAppointment({
        businessId: business.id,
        serviceId: selectedService.id,
        startTime: selectedSlot,
        customerName,
        customerPhone,
        customerEmail,
      });

      if (result.success) {
        setConfirmed({ slot: selectedSlot, service: selectedService });
      } else {
        setError(result.error);
        getSlotsForDate({ businessId: business.id, serviceId, dateStr }).then(setSlots);
        setSelectedSlot(null);
      }
    });
  }

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass rounded-xl p-8 text-center shadow-lg"
      >
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15"
        >
          <Check className="h-7 w-7 text-success" />
        </motion.span>
        <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">
          Randevunuz onaylandı
        </h2>

        <div className="mx-auto mt-5 max-w-xs space-y-2 rounded-lg border border-border bg-muted p-4 text-left text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hizmet</span>
            <span className="font-medium text-foreground">{confirmed.service.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tarih</span>
            <span className="font-medium text-foreground">
              {format(new Date(confirmed.slot), "d MMMM yyyy, EEEE", { locale: tr })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Saat</span>
            <span className="font-medium text-foreground">
              {format(new Date(confirmed.slot), "HH:mm")}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Onay e-postası <span className="font-medium text-foreground">{customerEmail}</span>{" "}
          adresine gönderildi.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_3fr]">
      <div className="space-y-6">
        <div className="glass rounded-xl p-4 shadow-md">
          <SectionLabel step={1}>Hizmet seç</SectionLabel>
          <div className="mt-3 space-y-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setServiceId(service.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  service.id === serviceId
                    ? "border-primary bg-primary/10 shadow-glow-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{service.name}</span>
                  <span className="text-sm text-muted-foreground">{service.price} ₺</span>
                </div>
                <span className="text-xs text-muted-foreground">{service.duration_minutes} dk</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-4 shadow-md">
          <SectionLabel step={2}>Tarih seç</SectionLabel>
          <div className="relative mt-3">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={dateStr}
              min={todayStr()}
              onChange={(e) => setDateStr(e.target.value)}
              className="glass-subtle w-full rounded-lg py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 shadow-md">
        <SectionLabel step={3}>Saat seç</SectionLabel>

        {loadingSlots && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Müsait saatler yükleniyor…
          </div>
        )}

        {!loadingSlots && slots.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Bu tarihte müsait saat yok. Başka bir tarih seçin.
          </p>
        )}

        {!loadingSlots && slotGroups.length > 0 && (
          <div className="mt-4 space-y-4">
            {slotGroups.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {group.items.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm transition-all ${
                        slot === selectedSlot
                          ? "border-accent bg-accent font-medium text-accent-foreground shadow-glow-accent"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(slot), "HH:mm")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedSlot && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onSubmit={handleSubmit}
              className="mt-6 space-y-3 overflow-hidden border-t border-border pt-6"
            >
              <SectionLabel step={4}>Bilgilerini gir</SectionLabel>

              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  placeholder="Ad Soyad"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="glass-subtle w-full rounded-lg py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="tel"
                  placeholder="Telefon"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="glass-subtle w-full rounded-lg py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  type="email"
                  placeholder="E-posta"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="glass-subtle w-full rounded-lg py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {error && (
                <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-glow-accent transition-all hover:brightness-105 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarCheck className="h-4 w-4" />
                )}
                Randevuyu onayla
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
