import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch Organizations
  const { data: organizations } = await supabase
    .from("organizations")
    .select("*");

  // Fetch Tours with Organization info
  const { data: tours } = await supabase
    .from("tours")
    .select("*, organizations(name)");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-muted-foreground">
          Welcome to TourSync. Here's what's happening today.
        </p>
      </div>

      <DashboardClient 
        organizations={organizations || []} 
        tours={tours || []} 
      />
    </div>
  );
}
