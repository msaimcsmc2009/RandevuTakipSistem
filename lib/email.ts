import { Resend } from "resend";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Appointment, Business, Service } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

// Works out of the box with no domain verification — swap for a verified
// sender address (e.g. randevu@sizin-domaininiz.com) in production.
const FROM = "Randevu Sistemi <onboarding@resend.dev>";

function formatWhen(startTime: string): string {
  return format(new Date(startTime), "d MMMM yyyy, EEEE HH:mm", { locale: tr });
}

export async function sendBookingEmails({
  business,
  service,
  appointment,
  ownerEmail,
}: {
  business: Business;
  service: Service;
  appointment: Appointment;
  ownerEmail: string | null;
}): Promise<void> {
  const when = formatWhen(appointment.start_time);

  const sends: Promise<unknown>[] = [
    resend.emails
      .send({
        from: FROM,
        to: appointment.customer_email,
        subject: `${business.name} — Randevunuz onaylandı`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #0f766e;">Randevunuz onaylandı</h2>
            <p>Merhaba ${appointment.customer_name},</p>
            <p><strong>${business.name}</strong> için randevunuz alındı.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 4px 0; color: #57534e;">Hizmet</td><td style="padding: 4px 0;"><strong>${service.name}</strong></td></tr>
              <tr><td style="padding: 4px 0; color: #57534e;">Tarih / Saat</td><td style="padding: 4px 0;"><strong>${when}</strong></td></tr>
              ${business.address ? `<tr><td style="padding: 4px 0; color: #57534e;">Adres</td><td style="padding: 4px 0;">${business.address}</td></tr>` : ""}
              ${business.phone ? `<tr><td style="padding: 4px 0; color: #57534e;">Telefon</td><td style="padding: 4px 0;">${business.phone}</td></tr>` : ""}
            </table>
            <p style="color: #78716c; font-size: 14px;">Randevunuzda değişiklik yapmak isterseniz lütfen işletmeyle iletişime geçin.</p>
          </div>
        `,
      })
      .catch((err) => console.error("Müşteri e-postası gönderilemedi:", err)),
  ];

  if (ownerEmail) {
    sends.push(
      resend.emails
        .send({
          from: FROM,
          to: ownerEmail,
          subject: `Yeni randevu: ${appointment.customer_name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #0f766e;">Yeni randevu alındı</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 4px 0; color: #57534e;">Müşteri</td><td style="padding: 4px 0;"><strong>${appointment.customer_name}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #57534e;">Telefon</td><td style="padding: 4px 0;">${appointment.customer_phone}</td></tr>
                <tr><td style="padding: 4px 0; color: #57534e;">E-posta</td><td style="padding: 4px 0;">${appointment.customer_email}</td></tr>
                <tr><td style="padding: 4px 0; color: #57534e;">Hizmet</td><td style="padding: 4px 0;"><strong>${service.name}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #57534e;">Tarih / Saat</td><td style="padding: 4px 0;"><strong>${when}</strong></td></tr>
              </table>
            </div>
          `,
        })
        .catch((err) => console.error("İşletme sahibi e-postası gönderilemedi:", err))
    );
  }

  await Promise.all(sends);
}
