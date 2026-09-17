"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteAppointment } from "@/app/dashboard/appointments/actions";

export function DeleteAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("appointmentId", appointmentId);
    startTransition(async () => {
      await deleteAppointment(formData);
    });
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Emin misiniz?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-1 font-medium text-destructive transition-colors hover:opacity-80 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Evet, sil
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          Vazgeç
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:opacity-80"
    >
      <Trash2 className="h-3 w-3" /> Sil
    </button>
  );
}
