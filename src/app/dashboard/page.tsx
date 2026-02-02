import { DashboardClient } from "./dashboard-client";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to TourSync. Here&apos;s what&apos;s happening today.
        </p>
      </div>
      <DashboardClient organizations={[]} tours={[]} userRole={null} />
    </div>
  );
}
