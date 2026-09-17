"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Plus, Search, Star, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomerFormModal } from "@/components/customer-form-modal";
import { deleteCustomer } from "@/app/dashboard/customers/actions";
import type { Customer } from "@/types/database";

const SORT_OPTIONS = [
  { value: "name", label: "İsme göre" },
  { value: "loyalty_points", label: "Sadakat puanına göre" },
  { value: "created_at", label: "En yeni" },
];

export function CustomersManager({
  customers,
  q,
  sort,
}: {
  customers: Customer[];
  q: string;
  sort: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => updateParam("q", value), 300);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    startTransition(async () => {
      const result = await deleteCustomer({ id });
      if (!result.success) {
        toast.error(result.error);
        setDeleteTarget(null);
        return;
      }
      toast.success("Müşteri silindi.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={q}
            placeholder="İsim veya telefon ara..."
            className="pl-9"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-auto"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Button
          onClick={() => {
            setEditingCustomer(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Müşteri ekle
        </Button>
      </div>

      <Card className="divide-y divide-border">
        {customers.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Users className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Henüz müşteri kaydı yok.</p>
          </div>
        )}
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 transition-colors hover:bg-muted/50"
          >
            <Link href={`/dashboard/customers/${customer.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{customer.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{customer.phone}</p>
            </Link>
            <div className="flex flex-none items-center gap-1.5 text-xs font-medium text-warning">
              <Star className="h-3.5 w-3.5" /> {customer.loyalty_points}
            </div>
            <div className="flex flex-none items-center gap-3">
              <button
                onClick={() => {
                  setEditingCustomer(customer);
                  setModalOpen(true);
                }}
                aria-label="Düzenle"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Düzenle</span>
              </button>
              <button
                onClick={() => setDeleteTarget(customer)}
                disabled={isPending}
                aria-label="Sil"
                className="flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:opacity-80 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sil</span>
              </button>
            </div>
          </div>
        ))}
      </Card>

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={editingCustomer}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isPending}
        title="Müşteriyi sil"
        description={`"${deleteTarget?.name ?? ""}" adlı müşteriyi silmek istediğinize emin misiniz? Randevu geçmişi korunur.`}
      />
    </div>
  );
}
