import { addMinutes, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import type { WorkingHours } from "@/types/database";

const WEEKDAY_KEYS: (keyof WorkingHours)[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export type Slot = {
  start: Date;
  end: Date;
};

export type ExistingAppointment = {
  start_time: string;
  end_time: string;
};

const STEP_MINUTES = 15;

function weekdayKeyFor(date: Date): keyof WorkingHours {
  return WEEKDAY_KEYS[date.getDay()];
}

function timeOnDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  return setMilliseconds(
    setSeconds(setMinutes(setHours(date, hours), minutes), 0),
    0
  );
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Computes free time slots for a given calendar day, based on the business's
 * working hours and its already-booked (non-cancelled) appointments.
 * Assumes the business operates in the server's local timezone (MVP scope).
 */
export function getAvailableSlots({
  date,
  workingHours,
  durationMinutes,
  existingAppointments,
  now = new Date(),
}: {
  date: Date;
  workingHours: WorkingHours;
  durationMinutes: number;
  existingAppointments: ExistingAppointment[];
  now?: Date;
}): Slot[] {
  const ranges = workingHours[weekdayKeyFor(date)] ?? [];
  const booked = existingAppointments.map((a) => ({
    start: new Date(a.start_time),
    end: new Date(a.end_time),
  }));

  const slots: Slot[] = [];

  for (const [openStr, closeStr] of ranges) {
    const open = timeOnDate(date, openStr);
    const close = timeOnDate(date, closeStr);

    let candidateStart = open;
    while (true) {
      const candidateEnd = addMinutes(candidateStart, durationMinutes);
      if (candidateEnd > close) break;

      const isBooked = booked.some((b) =>
        overlaps(candidateStart, candidateEnd, b.start, b.end)
      );
      const isPast = candidateStart < now;

      if (!isBooked && !isPast) {
        slots.push({ start: candidateStart, end: candidateEnd });
      }

      candidateStart = addMinutes(candidateStart, STEP_MINUTES);
    }
  }

  return slots;
}
