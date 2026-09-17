"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Scissors, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Service } from "@/types/database";
import { addService, deleteService, updateService } from "@/app/dashboard/services/actions";

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [newPrice, setNewPrice] = useState("0");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    startTransition(async () => {
      await addService({
        name: newName.trim(),
        durationMinutes: Number(newDuration),
        price: Number(newPrice),
      });
      setNewName("");
      setNewDuration("30");
      setNewPrice("0");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    setDeleteError(null);
    startTransition(async () => {
      try {
        await deleteService({ id });
        setDeleteTarget(null);
        router.refresh();
      } catch (error) {
        setDeleteTarget(null);
        setDeleteError(error instanceof Error ? error.message : "Hizmet silinirken bir hata oluştu.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Yeni hizmet ekle
        </h2>
        <form
          onSubmit={handleAdd}
          className="glass mt-3 grid grid-cols-1 gap-3 rounded-xl p-4 shadow-md sm:grid-cols-[2fr_1fr_1fr_auto]"
        >
        <input
          required
          placeholder="Hizmet adı (örn. Saç Kesimi)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="glass-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
        />
        <input
          required
          type="number"
          min={5}
          step={5}
          placeholder="Süre (dk)"
          value={newDuration}
          onChange={(e) => setNewDuration(e.target.value)}
          className="glass-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
        />
        <input
          required
          type="number"
          min={0}
          step={1}
          placeholder="Fiyat (₺)"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="glass-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-primary-glow to-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow-primary transition-all hover:shadow-glow-primary-lg disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Ekle
        </button>
        </form>
      </div>

      {deleteError && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">
          <p>{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className="flex-none text-destructive transition-colors hover:opacity-80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="glass divide-y divide-border rounded-xl shadow-md">
        {services.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Henüz hizmet eklenmedi.</p>
          </div>
        )}
        {services.map((service) =>
          editingId === service.id ? (
            <ServiceEditRow
              key={service.id}
              service={service}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <div
              key={service.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Scissors className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.duration_minutes} dk · {service.price} ₺
                  </p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-3">
                <button
                  onClick={() => setEditingId(service.id)}
                  aria-label="Düzenle"
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Düzenle</span>
                </button>
                <button
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(service);
                  }}
                  disabled={isPending}
                  aria-label="Sil"
                  className="flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:opacity-80 disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sil</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="Hizmeti sil"
        description={`"${deleteTarget?.name ?? ""}" adlı hizmeti silmek istediğinize emin misiniz?`}
      />
    </div>
  );
}

function ServiceEditRow({
  service,
  onCancel,
  onSaved,
}: {
  service: Service;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(service.name);
  const [duration, setDuration] = useState(String(service.duration_minutes));
  const [price, setPrice] = useState(String(service.price));
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateService({
        id: service.id,
        name: name.trim(),
        durationMinutes: Number(duration),
        price: Number(price),
      });
      onSaved();
    });
  }

  return (
    <form
      onSubmit={handleSave}
      className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[2fr_1fr_1fr_auto_auto]"
    >
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="glass-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
      />
      <input
        required
        type="number"
        min={5}
        step={5}
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="glass-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
      />
      <input
        required
        type="number"
        min={0}
        step={1}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="glass-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:shadow-glow-primary focus:ring-2 focus:ring-primary/30"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gradient-to-b from-primary-glow to-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-glow-primary transition-all hover:shadow-glow-primary-lg disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
