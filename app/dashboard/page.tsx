import { Suspense } from "react";
import { requireOwnerBusiness } from "@/lib/business";
import { DashboardStatsGrid } from "@/components/dashboard-stats-grid";
import { DashboardStatsGridSkeleton } from "@/components/dashboard-stats-grid-skeleton";

export default async function DashboardPage() {
  const { business } = await requireOwnerBusiness();

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Genel Bakış</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {business.name} için işletme özeti.
        </p>
      </div>

      <div className="mt-6">
        <Suspense fallback={<DashboardStatsGridSkeleton />}>
          <DashboardStatsGrid businessId={business.id} />
        </Suspense>
      </div>
    </div>
  );
}
