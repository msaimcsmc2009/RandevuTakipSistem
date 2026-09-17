import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Ban, Clock, Phone, User } from "lucide-react";
import { cancelAppointment } from "@/app/dashboard/appointments/actions";
import { DeleteAppointmentButton } from "@/components/delete-appointment-button";
import type { AppointmentStatus } from "@/types/database";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Beklemede",
  confirmed: "Onaylı",
  cancelled: "İptal edildi",
};

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-primary/15 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

export function AppointmentCard({
  appointment,
}: {
  appointment: {
    id: string;
    customer_name: string;
    customer_phone: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    service: { name: string } | null;
  };
}) {
  const isCancelled = appointment.status === "cancelled";

  return (
    <div
      className={`rounded-lg border border-l-[3px] border-border bg-card/60 p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
        isCancelled ? "border-l-border opacity-60" : "border-l-primary"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {format(new Date(appointment.start_time), "HH:mm", { locale: tr })}–
          {format(new Date(appointment.end_time), "HH:mm", { locale: tr })}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[appointment.status]}`}
        >
          {STATUS_LABEL[appointment.status]}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-foreground">
        {appointment.service?.name ?? "Hizmet"}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <User className="h-3 w-3" /> {appointment.customer_name}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Phone className="h-3 w-3" /> {appointment.customer_phone}
      </p>

      <div className="mt-2 flex items-center gap-3">
        {!isCancelled && (
          <form action={cancelAppointment}>
            <input type="hidden" name="appointmentId" value={appointment.id} />
            <button
              type="submit"
              className="flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:opacity-80"
            >
              <Ban className="h-3 w-3" /> İptal et
            </button>
          </form>
        )}
        <DeleteAppointmentButton appointmentId={appointment.id} />
      </div>
    </div>
  );
}
