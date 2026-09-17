"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock3, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
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
    <main className="min-h-screen overflow-hidden">
      <header
        className={cn(
          "sticky top-0 z-40 flex items-center justify-between px-6 py-6 transition-all duration-300 sm:px-12",
          scrolled ? "glass-strong shadow-sm" : "glass"
        )}
      >
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
          randevu<span className="text-accent">.</span>
        </span>
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/login" className="transition-colors hover:text-foreground">
            Giriş yap
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-b from-primary-glow to-primary px-4 py-2 text-primary-foreground shadow-glow-primary transition-all hover:shadow-glow-primary-lg hover:brightness-105"
          >
            Ücretsiz başla
          </Link>
        </nav>
      </header>

      <section className="relative">
        <div className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 px-6 pb-32 pt-16 sm:px-12 md:grid-cols-[3fr_2fr] md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Yerel işletmeler için
            </span>

            <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
              Randevularını takvimde değil,{" "}
              <span className="text-primary">tek sayfada</span> topla.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Berber, kuaför, klinik ya da güzellik salonu fark etmez — kendi
              randevu sayfanı aç, müşterilerin müsait saatleri görüp saniyeler
              içinde randevu alsın.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <Link
                href="/signup"
                className="group flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground shadow-glow-accent transition-all hover:brightness-105"
              >
                İşletmeni ekle
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Zaten hesabım var
              </Link>
            </div>

            <dl className="mt-16 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <dt className="text-2xl font-semibold text-foreground">3 dk</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">kurulum süresi</dd>
              </div>
              <div>
                <dt className="text-2xl font-semibold text-foreground">7/24</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">müşteri randevu alabilir</dd>
              </div>
              <div>
                <dt className="text-2xl font-semibold text-foreground">0 ₺</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground">başlangıç maliyeti</dd>
              </div>
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="relative mt-4 sm:mt-10"
          >
            <BookingPreviewCard />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="glass absolute -left-6 -top-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground shadow-md"
            >
              <Check className="h-3.5 w-3.5 text-success" /> Randevu onaylandı
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-12">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Üç adımda kendi randevu sayfan
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <Step
              number="01"
              title="Hesabını aç"
              text="İşletme adını gir, çalışma saatlerini belirle."
            />
            <Step
              number="02"
              title="Hizmetlerini ekle"
              text="Süre ve fiyatıyla birlikte sunduğun hizmetleri listele."
            />
            <Step
              number="03"
              title="Sayfanı paylaş"
              text="randevu.app/isletmen linkini müşterilerinle paylaş, randevular kendiliğinden gelsin."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row sm:px-12">
          <span className="font-heading font-semibold text-foreground">randevu.</span>
          <span>© {new Date().getFullYear()} — yerel işletmeler için randevu yönetimi.</span>
        </div>
      </footer>
    </main>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <span className="font-heading text-3xl font-semibold text-primary/30">{number}</span>
      <h3 className="mt-3 font-heading text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </motion.div>
  );
}

function BookingPreviewCard() {
  return (
    <div className="glass rounded-2xl p-5 shadow-hero transition-all duration-200 hover:-translate-y-1 hover:shadow-floating">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Berber Ahmet · Hizmet seç
      </p>
      <div className="mt-3 flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5">
        <span className="text-sm font-medium text-foreground">Saç Kesimi</span>
        <span className="text-sm text-muted-foreground">200 ₺</span>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5" /> Saat seç
      </p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {["10:00", "10:30", "11:00", "13:30"].map((time, i) => (
          <span
            key={time}
            className={`rounded-md border px-2 py-1.5 text-center text-xs ${
              i === 2
                ? "border-accent bg-accent font-medium text-accent-foreground shadow-glow-accent"
                : "border-border text-muted-foreground"
            }`}
          >
            {time}
          </span>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" /> Barbaros Mah., Antalya
      </p>
    </div>
  );
}
