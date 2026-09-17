import { requireUser, getOwnerBusiness } from "@/lib/business";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const business = await getOwnerBusiness(user.id);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Ayarlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        İşletme bilgilerini ve çalışma saatlerini güncelle.
      </p>

      <div className="mt-6 max-w-2xl">
        <SettingsForm business={business} />
      </div>
    </div>
  );
}
