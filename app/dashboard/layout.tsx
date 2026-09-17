import { requireUser, getOwnerBusiness } from "@/lib/business";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const business = await getOwnerBusiness(user.id);

  return (
    <div className="min-h-screen">
      <DashboardHeader business={business} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
