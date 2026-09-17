"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StaffFormModal } from "@/components/staff-form-modal";
import { deleteStaff, updateStaff } from "@/app/dashboard/staff/actions";
import type { Staff } from "@/types/database";

export function StaffManager({ staff }: { staff: Staff[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    startTransition(async () => {
      const result = await deleteStaff({ id });
      if (!result.success) {
        toast.error(result.error);
        setDeleteTarget(null);
        return;
      }
      toast.success("Personel silindi.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function handleToggleActive(member: Staff) {
    startTransition(async () => {
      const result = await updateStaff({
        id: member.id,
        name: member.name,
        phone: member.phone ?? "",
        specialty: member.specialty ?? "",
        photoUrl: member.photo_url ?? "",
        active: !member.active,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingStaff(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Personel ekle
        </Button>
      </div>

      <Card className="divide-y divide-border">
        {staff.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <UserCog className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Henüz personel eklenmedi.</p>
          </div>
        )}
        {staff.map((member) => (
          <div
            key={member.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="h-9 w-9 flex-none rounded-full object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/15 text-primary">
                  <UserCog className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{member.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.specialty || "Uzmanlık belirtilmedi"}
                  {member.phone ? ` · ${member.phone}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-3">
              <button
                onClick={() => handleToggleActive(member)}
                disabled={isPending}
                className="disabled:opacity-60"
              >
                <Badge variant={member.active ? "success" : "neutral"}>
                  {member.active ? "Aktif" : "Pasif"}
                </Badge>
              </button>
              <button
                onClick={() => {
                  setEditingStaff(member);
                  setModalOpen(true);
                }}
                aria-label="Düzenle"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Düzenle</span>
              </button>
              <button
                onClick={() => setDeleteTarget(member)}
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

      <StaffFormModal open={modalOpen} onClose={() => setModalOpen(false)} staff={editingStaff} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isPending}
        title="Personeli sil"
        description={`"${deleteTarget?.name ?? ""}" adlı personeli silmek istediğinize emin misiniz?`}
      />
    </div>
  );
}
