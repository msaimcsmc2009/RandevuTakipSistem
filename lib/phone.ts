/**
 * Normalizes a Turkish phone number to a bare 10-digit canonical form,
 * stripping formatting and a leading "0" or "90" country-code prefix.
 * Mirrors the `normalize_phone_tr` SQL function in
 * supabase/migrations/0002_phase1_foundation.sql — keep both in sync.
 */
export function normalizePhone(raw: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  if (digits.length === 12 && digits.startsWith("90")) {
    return digits.slice(2);
  }

  return digits;
}
